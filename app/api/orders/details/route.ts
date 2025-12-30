import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // 1. Authenticate user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // 2. Get order_id from query params
        const searchParams = request.nextUrl.searchParams
        const orderId = searchParams.get('order_id')

        if (!orderId) {
            return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
        }

        // 3. Fetch orders for this user using the existing RPC
        const { data: orders, error } = await supabase.rpc('get_user_orders_with_items')

        if (error || !orders) {
            console.error('Error fetching orders:', error)
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
        }

        // 4. Find the specific order in the results
        const order = (orders as any[]).find(o => String(o.id) === String(orderId))

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // 5. Format response (Simplified for inquiries)
        return NextResponse.json({
            customerName: (order.shipping_address_snapshot as any).fullName || 'Customer',
            amount: 0, // It's always 0 for manual inquiries in this path
            currency: 'BGN',
            items: [] // No longer needed for display on confirmation page
        })

    } catch (error) {
        console.error('Error fetching order details:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
