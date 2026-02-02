import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceRoleClient } from '@supabase/supabase-js'

const supabaseAdmin = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // 3. Authenticate user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // 3. Get order_id from query params
        const searchParams = request.nextUrl.searchParams
        const orderId = searchParams.get('order_id')

        if (!orderId) {
            return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
        }

        // 4. Find the order by our new reference ID
        // We first check the orders table directly for the order_id_ref
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('order_id_ref', orderId)
            .eq('user_id', user.id)
            .single()

        if (order) {
            return NextResponse.json({
                customerName: (order.shipping_address_snapshot as any).fullName || 'Customer',
                amount: parseFloat(order.total_price) * 100, // Convert to cents for display
                currency: 'EUR',
                items: order.items || []
            })
        }

        // 5. Fallback: If order not created yet, check if checkout session exists
        // (This handles the case where the user lands on confirmation page BEFORE webhook completes)
        const { data: checkoutSessionArray } = await supabaseAdmin.rpc('get_checkout_session', {
            p_order_id: orderId
        })

        if (!checkoutSessionArray || checkoutSessionArray.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        const checkoutSession = checkoutSessionArray[0]

        if (checkoutSession.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Return details from checkout session for display while order is processing
        return NextResponse.json({
            customerName: checkoutSession.full_name || 'Customer',
            amount: parseFloat(checkoutSession.total_amount) * 100,
            currency: 'EUR',
            items: checkoutSession.cart_items || []
        })

    } catch (error) {
        console.error('Error fetching order details:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
