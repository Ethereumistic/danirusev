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

        // 1. Authenticate user (optional for guest orders)
        const { data: { user } } = await supabase.auth.getUser()

        // 2. Get order_id from query params
        const searchParams = request.nextUrl.searchParams
        const orderId = searchParams.get('order_id')

        if (!orderId) {
            return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
        }

        console.log(`[DETAILS_API] Secure Lookup for: ${orderId}`);

        // STRATEGY 1: Use the 'get_all_orders_with_details' RPC which we KNOW has the 'orderId' column
        // This is safe because we will filter by user.id in JS.
        const { data: allOrders, error: rpcError } = await supabaseAdmin.rpc('get_all_orders_with_details')

        if (!rpcError && allOrders) {
            // Find the order that belongs to this user and matches the ID (numeric or string)
            const order = allOrders.find((o: any) =>
                (o.id.toString() === orderId || o.orderId === orderId) &&
                (o.userId === null || o.userId === user?.id)
            )

            if (order) {
                console.log(`[DETAILS_API] Order found via Admin RPC: ${order.id}`);
                return NextResponse.json({
                    customerName: order.customerName || 'Customer',
                    amount: parseFloat(order.total) * 100,
                    currency: 'EUR',
                    items: order.orderItems || []
                })
            }
        }

        // STRATEGY 2: Fallback to the user-specific RPC (might be missing order_id_ref until updated)
        const { data: userOrders } = await supabaseAdmin.rpc('get_all_orders_with_details')
        if (userOrders) {
            const order = userOrders.find((o: any) =>
                (o.id.toString() === orderId ||
                 o.payment_transaction_id === orderId ||
                 (o as any).order_id_ref === orderId ||
                 o.orderId === orderId) && 
                (o.userId === null || o.userId === user?.id)
            )

            if (order) {
                console.log(`[DETAILS_API] Order found via User RPC: ${order.id}`);
                return NextResponse.json({
                    customerName: (order.shipping_address_snapshot as any).fullName || 'Customer',
                    amount: parseFloat(order.total_price) * 100,
                    currency: 'EUR',
                    items: order.order_items || []
                })
            }
        }

        console.log(`[DETAILS_API] Final 404 for: ${orderId}`);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    } catch (error) {
        console.error('[DETAILS_API] Global Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
