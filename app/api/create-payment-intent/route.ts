// 'use server'

export const dynamic = 'force-dynamic'


// import { NextRequest, NextResponse } from 'next/server'
// import { stripe } from '@/lib/stripe'
// import { createClient } from '@/utils/supabase/server'
// import { createClient as createServiceRoleClient } from '@supabase/supabase-js'
// import { z } from 'zod'

// const supabaseAdmin = createServiceRoleClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!,
//     {
//         auth: {
//             autoRefreshToken: false,
//             persistSession: false,
//         },
//     }
// )

// // Zod schema for stored addon from cart
// const storedAddonSchema = z.object({
//     id: z.string(),
//     name: z.string(),
//     price: z.number(),
//     icon: z.string().optional().nullable(),
//     type: z.enum(['standard', 'location', 'voucher', 'duration']),
//     googleMapsUrl: z.string().optional().nullable(),
// })

// // Zod schema for cart item validation - supports both physical and experience products
// const cartItemSchema = z.object({
//     id: z.union([z.string(), z.number()]).transform(String),
//     productType: z.enum(['physical', 'experience']).optional(),
//     title: z.string().optional(),
//     price: z.number().optional(),
//     quantity: z.number().min(1),
//     imageUrl: z.string().optional().nullable(),
//     // Physical product fields
//     selectedVariant: z.object({
//         options: z.record(z.string()).optional(),
//         sku: z.string().optional(),
//     }).optional().nullable(),
//     // Experience fields (CMS data stored in cart)
//     experienceSlug: z.string().optional().nullable(),
//     selectedLocation: z.string().nullable().optional(),
//     selectedVoucher: z.string().nullable().optional(),
//     selectedDuration: z.string().nullable().optional(),
//     voucherName: z.string().max(16).optional().nullable(),
//     additionalItems: z.array(z.string()).optional().nullable(),
//     // CMS experience stored addon data
//     storedAddons: z.array(storedAddonSchema).optional().nullable(),
//     storedLocationName: z.string().optional().nullable(),
//     storedVoucherName: z.string().optional().nullable(),
//     storedDurationName: z.string().optional().nullable(),
//     storedLocationUrl: z.string().optional().nullable(),
//     selectedDate: z.string().optional().nullable(), // Raw ISO date for database
//     storedSelectedDate: z.string().optional().nullable(), // Formatted for display
// })

// const requestSchema = z.object({
//     cartItems: z.array(cartItemSchema),
//     personalInfo: z.object({
//         fullName: z.string().min(2),
//         email: z.string().email(),
//         phoneNumber: z.string().min(5),
//         address: z.string().optional().nullable(),
//         city: z.string().optional().nullable(),
//         postalCode: z.string().optional().nullable(),
//         country: z.string().optional().nullable(),
//     }),
// })

// export async function POST(request: NextRequest) {
//     try {
//         const supabase = await createClient()

//         // 1. Authenticate the user
//         const { data: { user } } = await supabase.auth.getUser()

//         if (!user) {
//             return NextResponse.json(
//                 { error: 'User not authenticated' },
//                 { status: 401 }
//             )
//         }

//         // 2. Parse and validate request body
//         const body = await request.json()
//         const validation = requestSchema.safeParse(body)

//         if (!validation.success) {
//             console.error('Validation error:', validation.error.flatten())
//             return NextResponse.json(
//                 { error: 'Invalid request data', details: validation.error.flatten() },
//                 { status: 400 }
//             )
//         }

//         const { cartItems, personalInfo } = validation.data

//         // 3. Determine if physical address is required
//         const isPhysicalRequired = cartItems.some(item =>
//             item.productType === 'physical' ||
//             item.storedVoucherName?.toLowerCase().includes('физически') ||
//             item.storedVoucherName?.toLowerCase().includes('physical')
//         )

//         // 4. Manual validation if physical is required
//         if (isPhysicalRequired) {
//             if (!personalInfo.address || personalInfo.address.length < 5) return NextResponse.json({ error: 'Address is required' }, { status: 400 });
//             if (!personalInfo.city || personalInfo.city.length < 2) return NextResponse.json({ error: 'City is required' }, { status: 400 });
//             if (!personalInfo.postalCode || personalInfo.postalCode.length < 3) return NextResponse.json({ error: 'Postal code is required' }, { status: 400 });
//             if (!personalInfo.country || personalInfo.country.length < 2) return NextResponse.json({ error: 'Country is required' }, { status: 400 });
//         }

//         // 5. Calculate total and validate prices
//         let totalAmount = 0
//         const validatedItems = []

//         console.log('[DEBUG] Incoming cart items:', JSON.stringify(cartItems, null, 2));

//         // Separating numeric IDs and string identifiers (slugs or unconventional IDs)
//         const allIdentifiers = Array.from(new Set([
//             ...cartItems.map(item => item.id),
//             ...cartItems.filter(item => item.experienceSlug).map(item => item.experienceSlug!)
//         ]));

//         const numericIds = allIdentifiers.filter(id => /^\d+$/.test(String(id))).map(id => parseInt(String(id)));
//         const stringIdentifiers = allIdentifiers.filter(id => !/^\d+$/.test(String(id)));

//         const skus = Array.from(new Set(cartItems.filter(i => i.selectedVariant?.sku).map(i => i.selectedVariant!.sku!)));
//         const addonIds = Array.from(new Set([
//             ...cartItems.flatMap(i => i.additionalItems || []),
//             ...cartItems.filter(i => i.selectedDuration).map(i => i.selectedDuration!)
//         ]));

//         // Fetch products from Supabase using both IDs and Slugs
//         const queries = [];
//         if (numericIds.length > 0) {
//             queries.push(supabaseAdmin.from('products').select('id, price, product_type, _status, slug').in('id', numericIds));
//         }
//         if (stringIdentifiers.length > 0) {
//             queries.push(supabaseAdmin.from('products').select('id, price, product_type, _status, slug').in('slug', stringIdentifiers));
//         }

//         const results = await Promise.all(queries);
//         const dbProducts = results.flatMap(r => r.data || []);
//         const errors = results.filter(r => r.error).map(r => r.error);

//         if (errors.length > 0) {
//             console.error('Database error fetching products:', errors)
//             return NextResponse.json({ error: 'Failed to fetch products from database' }, { status: 500 })
//         }

//         // Create mapping by both ID (stringified) and Slug
//         const productMap = new Map();
//         dbProducts.forEach(p => {
//             productMap.set(String(p.id), p);
//             if (p.slug) productMap.set(p.slug, p);
//         });

//         // Fetch variants if needed
//         let variantMap = new Map();
//         if (skus.length > 0) {
//             const { data: dbVariants } = await supabaseAdmin
//                 .from('products_variants')
//                 .select('*')
//                 .in('sku', skus);
//             if (dbVariants) variantMap = new Map(dbVariants.map(v => [v.sku, v]));
//         }

//         // Fetch addons if needed
//         let addonMap = new Map();
//         if (addonIds.length > 0) {
//             const { data: dbAddons } = await supabaseAdmin
//                 .from('products_additional_items')
//                 .select('*')
//                 .in('id', addonIds);
//             if (dbAddons) addonMap = new Map(dbAddons.map(a => [a.id, a]));
//         }

//         for (const item of cartItems) {
//             const dbProduct = productMap.get(item.id) || (item.experienceSlug ? productMap.get(item.experienceSlug) : null);

//             if (!dbProduct || dbProduct._status !== 'published') {
//                 console.error(`Product validation failed for item:`, item.id);
//                 console.error(`Found DB product:`, dbProduct);
//                 return NextResponse.json({ error: `Product not found or unavailable` }, { status: 400 });
//             }

//             let unitPrice = Number(dbProduct.price) || 0;

//             if (dbProduct.product_type === 'physical') {
//                 const sku = item.selectedVariant?.sku;
//                 if (sku) {
//                     const variant = variantMap.get(sku);
//                     if (variant) unitPrice += Number(variant.price_modifier) || 0;
//                 }

//                 const itemTotal = unitPrice * item.quantity;
//                 totalAmount += itemTotal;

//                 // Format variant options as string
//                 const optionsStr = item.selectedVariant?.options
//                     ? Object.entries(item.selectedVariant.options)
//                         .map(([k, v]) => `${k}: ${v}`)
//                         .join(', ')
//                     : ''

//                 validatedItems.push({
//                     type: 'physical',
//                     productId: item.id,
//                     productTitle: item.title || '',
//                     variant: optionsStr,
//                     sku: sku || '',
//                     imageUrl: item.imageUrl || '',
//                     quantity: item.quantity,
//                     unitPrice,
//                     totalPrice: itemTotal,
//                 })
//             } else {
//                 // Experience
//                 const selectedAddonIds = item.additionalItems || [];
//                 const addonNames = [];

//                 // Add standard/voucher addons
//                 for (const addonId of selectedAddonIds) {
//                     const addon = addonMap.get(addonId);
//                     if (addon) {
//                         unitPrice += Number(addon.price) || 0;
//                         if (addon.type === 'standard' || addon.type === 'duration') {
//                             addonNames.push(addon.name);
//                         }
//                     }
//                 }

//                 // Add duration addon price if selected separately
//                 if (item.selectedDuration) {
//                     const durationAddon = addonMap.get(item.selectedDuration);
//                     if (durationAddon) {
//                         unitPrice += Number(durationAddon.price) || 0;
//                         if (!addonNames.includes(durationAddon.name)) {
//                             addonNames.push(durationAddon.name);
//                         }
//                     }
//                 }

//                 // If we have a stored duration name that isn't already in addons, add it
//                 if (item.storedDurationName && !addonNames.includes(item.storedDurationName)) {
//                     addonNames.push(item.storedDurationName)
//                 }

//                 // Get location name from storedLocationName
//                 const locationName = item.storedLocationName || 'N/A'

//                 // Get voucher type from storedVoucherName
//                 const voucherType = item.storedVoucherName || 'Digital'

//                 const itemTotal = unitPrice * item.quantity
//                 totalAmount += itemTotal

//                 validatedItems.push({
//                     type: 'experience',
//                     experienceSlug: item.experienceSlug,
//                     experienceTitle: item.title || '',
//                     imageUrl: item.imageUrl || '',
//                     location: locationName,
//                     addons: addonNames,
//                     voucherType,
//                     voucherRecipientName: item.voucherName || '',
//                     selectedDate: item.selectedDate || null,
//                     quantity: item.quantity,
//                     unitPrice,
//                     totalPrice: itemTotal,
//                 })
//             }
//         }

//         // 4. Create Payment Intent with metadata
//         // Split cart items to stay under Stripe's 500 char limit per field
//         const itemsMetadata: Record<string, string> = {}
//         validatedItems.forEach((item, index) => {
//             const itemJson = JSON.stringify(item)
//             itemsMetadata[`cart_${index}`] = itemJson.length <= 500
//                 ? itemJson
//                 : JSON.stringify({
//                     type: item.type,
//                     title: (item as any).productTitle || (item as any).experienceTitle || '',
//                     qty: item.quantity,
//                     total: item.totalPrice
//                 })
//         })

//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(totalAmount * 100), // Convert to cents
//             currency: 'eur',
//             automatic_payment_methods: {
//                 enabled: true,
//             },
//             metadata: {
//                 userId: user.id,
//                 userEmail: personalInfo.email,
//                 fullName: personalInfo.fullName,
//                 phoneNumber: personalInfo.phoneNumber,
//                 address: personalInfo.address || '',
//                 city: personalInfo.city || '',
//                 postalCode: personalInfo.postalCode || '',
//                 country: personalInfo.country || '',
//                 itemCount: String(validatedItems.length),
//                 ...itemsMetadata,
//             },
//         })

//         // 5. Return client secret to frontend
//         return NextResponse.json({
//             clientSecret: paymentIntent.client_secret,
//             amount: totalAmount,
//         })

//     } catch (error) {
//         console.error('Payment Intent creation error:', error)
//         return NextResponse.json(
//             { error: error instanceof Error ? error.message : 'Unknown error occurred' },
//             { status: 500 }
//         )
//     }
// }
