import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

// Zod schema for stored addon from cart
const storedAddonSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    icon: z.string().optional().nullable(),
    type: z.enum(['standard', 'location', 'voucher']),
    googleMapsUrl: z.string().optional().nullable(),
})

// Zod schema for cart item validation
const cartItemSchema = z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    productType: z.enum(['physical', 'experience']).optional(),
    title: z.string().optional(),
    price: z.number().optional(),
    quantity: z.number().min(1),
    imageUrl: z.string().optional().nullable(),
    // Physical product fields
    selectedVariant: z.object({
        options: z.record(z.string()).optional(),
        sku: z.string().optional(),
    }).optional().nullable(),
    // Experience fields
    experienceSlug: z.string().optional().nullable(),
    selectedLocation: z.string().nullable().optional(),
    selectedVoucher: z.string().nullable().optional(),
    selectedDuration: z.string().nullable().optional(),
    voucherName: z.string().max(16).optional().nullable(),
    additionalItems: z.array(z.string()).optional().nullable(),
    // CMS experience stored addon data
    storedAddons: z.array(storedAddonSchema).optional().nullable(),
    storedLocationName: z.string().optional().nullable(),
    storedVoucherName: z.string().optional().nullable(),
    storedDurationName: z.string().optional().nullable(),
    storedLocationUrl: z.string().optional().nullable(),
    selectedDate: z.string().optional().nullable(),
    storedSelectedDate: z.string().optional().nullable(),
})

const requestSchema = z.object({
    cartItems: z.array(cartItemSchema),
    personalInfo: z.object({
        fullName: z.string().min(2),
        email: z.string().email(),
        phoneNumber: z.string().min(5),
        address: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        postalCode: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
    }),
})

// Use service role client for order creation (similar to webhook)
import { createClient as createServiceRoleClient } from '@supabase/supabase-js'

const supabaseAdmin = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
)

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // 1. Authenticate the user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            )
        }

        // 2. Parse and validate request body
        const body = await request.json()
        const validation = requestSchema.safeParse(body)

        if (!validation.success) {
            console.error('Validation error:', validation.error.flatten())
            return NextResponse.json(
                { error: 'Invalid request data', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { cartItems, personalInfo } = validation.data

        // 3. Determine if physical address is required
        const isPhysicalRequired = cartItems.some(item =>
            item.productType === 'physical' ||
            item.storedVoucherName?.toLowerCase().includes('физически') ||
            item.storedVoucherName?.toLowerCase().includes('physical')
        )

        // 4. Manual validation if physical is required
        if (isPhysicalRequired) {
            if (!personalInfo.address || personalInfo.address.length < 5) return NextResponse.json({ error: 'Address is required' }, { status: 400 });
            if (!personalInfo.city || personalInfo.city.length < 2) return NextResponse.json({ error: 'City is required' }, { status: 400 });
            if (!personalInfo.postalCode || personalInfo.postalCode.length < 3) return NextResponse.json({ error: 'Postal code is required' }, { status: 400 });
            if (!personalInfo.country || personalInfo.country.length < 2) return NextResponse.json({ error: 'Country is required' }, { status: 400 });
        }

        // 5. Process items and calculate total
        let totalAmount = 0
        const orderItems = []

        console.log('[DEBUG] Incoming manual order items:', JSON.stringify(cartItems, null, 2));

        // Separating numeric IDs and string identifiers (slugs or unconventional IDs)
        const allIdentifiers = Array.from(new Set([
            ...cartItems.map(item => item.id),
            ...cartItems.filter(item => item.experienceSlug).map(item => item.experienceSlug!)
        ]));

        const numericIds = allIdentifiers.filter(id => /^\d+$/.test(String(id))).map(id => parseInt(String(id)));
        const stringIdentifiers = allIdentifiers.filter(id => !/^\d+$/.test(String(id)));

        const skus = Array.from(new Set(cartItems.filter(i => i.selectedVariant?.sku).map(i => i.selectedVariant!.sku!)));
        const addonIds = Array.from(new Set([
            ...cartItems.flatMap(i => i.additionalItems || []),
            ...cartItems.filter(i => i.selectedDuration).map(i => i.selectedDuration!)
        ]));

        // Fetch products from Supabase using both IDs and Slugs
        const queries = [];
        if (numericIds.length > 0) {
            queries.push(supabaseAdmin.from('products').select('id, price, product_type, _status, slug').in('id', numericIds));
        }
        if (stringIdentifiers.length > 0) {
            queries.push(supabaseAdmin.from('products').select('id, price, product_type, _status, slug').in('slug', stringIdentifiers));
        }

        const results = await Promise.all(queries);
        const dbProducts = results.flatMap(r => r.data || []);
        const errors = results.filter(r => r.error).map(r => r.error);

        if (errors.length > 0) {
            console.error('Database error fetching products:', errors)
            return NextResponse.json({ error: 'Failed to fetch products from database' }, { status: 500 })
        }

        // Create mapping by both ID (stringified) and Slug
        const productMap = new Map();
        dbProducts.forEach(p => {
            productMap.set(String(p.id), p);
            if (p.slug) productMap.set(p.slug, p);
        });

        // Fetch variants if needed
        let variantMap = new Map();
        if (skus.length > 0) {
            const { data: dbVariants } = await supabaseAdmin
                .from('products_variants')
                .select('*')
                .in('sku', skus);
            if (dbVariants) variantMap = new Map(dbVariants.map(v => [v.sku, v]));
        }

        // Fetch addons if needed
        let addonMap = new Map();
        if (addonIds.length > 0) {
            const { data: dbAddons } = await supabaseAdmin
                .from('products_additional_items')
                .select('*')
                .in('id', addonIds);
            if (dbAddons) addonMap = new Map(dbAddons.map(a => [a.id, a]));
        }

        for (const item of cartItems) {
            const dbProduct = productMap.get(item.id) || (item.experienceSlug ? productMap.get(item.experienceSlug) : null);

            if (!dbProduct || dbProduct._status !== 'published') {
                console.error(`Product validation failed for item:`, item.id);
                console.error(`Found DB product:`, dbProduct);
                return NextResponse.json({ error: `Product not found or unavailable` }, { status: 400 });
            }

            let unitPrice = Number(dbProduct.price) || 0;

            if (dbProduct.product_type === 'physical') {
                const sku = item.selectedVariant?.sku;
                if (sku) {
                    const variant = variantMap.get(sku);
                    if (variant) unitPrice += Number(variant.price_modifier) || 0;
                }

                const itemTotal = unitPrice * item.quantity;
                totalAmount += itemTotal;

                // Format variant options as string
                const optionsStr = item.selectedVariant?.options
                    ? Object.entries(item.selectedVariant.options)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')
                    : ''

                orderItems.push({
                    product_id: item.id,
                    title: item.title || 'Product',
                    quantity: item.quantity,
                    price: unitPrice,
                    variant: optionsStr,
                    sku: sku || '',
                    item_type: 'physical',
                    image_url: item.imageUrl || null,
                    location: null,
                    addons: null,
                    voucher_type: null,
                    voucher_recipient_name: null,
                    selected_date: null,
                })
            } else {
                // Experience
                const selectedAddonIds = item.additionalItems || [];
                const addonNames = [];

                // Add standard/voucher addons
                for (const addonId of selectedAddonIds) {
                    const addon = addonMap.get(addonId);
                    if (addon) {
                        unitPrice += Number(addon.price) || 0;
                        if (addon.type === 'standard' || addon.type === 'duration') {
                            addonNames.push(addon.name);
                        }
                    }
                }

                // Add duration addon price if selected separately
                if (item.selectedDuration) {
                    const durationAddon = addonMap.get(item.selectedDuration);
                    if (durationAddon) {
                        unitPrice += Number(durationAddon.price) || 0;
                        if (!addonNames.includes(durationAddon.name)) {
                            addonNames.push(durationAddon.name);
                        }
                    }
                }

                // If we have a stored duration name that isn't already in addons, add it
                if (item.storedDurationName && !addonNames.includes(item.storedDurationName)) {
                    addonNames.push(item.storedDurationName)
                }

                const itemTotal = unitPrice * item.quantity
                totalAmount += itemTotal

                orderItems.push({
                    product_id: item.experienceSlug || item.id,
                    title: item.title || 'Experience',
                    quantity: item.quantity,
                    price: unitPrice,
                    variant: '',
                    sku: '',
                    item_type: 'experience',
                    image_url: item.imageUrl || null,
                    location: item.storedLocationName || null,
                    addons: addonNames,
                    voucher_type: item.storedVoucherName || null,
                    voucher_recipient_name: item.voucherName || null,
                    selected_date: item.selectedDate || null,
                })
            }
        }

        // 4. Create manual order ID (to satisfy idempotency or just distinguish)
        const manualOrderId = `manual_${Date.now()}_${user.id.slice(0, 8)}`

        // 5. Call Database Function to create order
        const { data: orderId, error: orderError } = await supabaseAdmin.rpc('create_order_from_webhook', {
            p_user_id: user.id,
            p_total_price: totalAmount,
            p_shipping_address_snapshot: {
                ...personalInfo,
                email: personalInfo.email,
                address: personalInfo.address || '',
                city: personalInfo.city || '',
                postalCode: personalInfo.postalCode || '',
                country: personalInfo.country || '',
            },
            p_cart_items: orderItems,
            p_stripe_payment_intent_id: manualOrderId, // Use manual ID as "payment intent"
        })

        if (orderError) {
            console.error('Error creating manual order:', orderError)
            return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
        }

        // 6. Update Profile
        const { error: profileError } = await supabaseAdmin.rpc('update_profile_from_checkout', {
            p_user_id: user.id,
            p_full_name: personalInfo.fullName,
            p_phone_number: personalInfo.phoneNumber,
            p_address: personalInfo.address || '',
            p_city: personalInfo.city || '',
            p_postal_code: personalInfo.postalCode || '',
            p_country: personalInfo.country || '',
            p_email: personalInfo.email,
        })

        if (profileError) {
            console.error('Error updating profile:', profileError)
            // Still proceed since order was created
        }

        return NextResponse.json({
            success: true,
            orderId
        })

    } catch (error) {
        console.error('Manual order creation error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        )
    }
}
