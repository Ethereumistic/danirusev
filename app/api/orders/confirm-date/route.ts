import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const body = await request.json()
        const { orderId, orderItemId, selectedDate, confirmOnly, orderItem, userId } = body

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
        }

        // Determine the final date to use
        const finalDate = confirmOnly ? null : selectedDate

        // Call RPC function to update date and status
        const { data, error } = await supabase.rpc('confirm_order_date', {
            p_order_id: parseInt(orderId),
            p_order_item_id: confirmOnly ? null : (orderItemId ? parseInt(orderItemId) : null),
            p_selected_date: finalDate
        })

        if (error) {
            console.error('Error calling confirm_order_date RPC:', error)
            return NextResponse.json({ error: 'Failed to confirm order date' }, { status: 500 })
        }

        // If this is an experience order, generate voucher
        if (orderItem && orderItem.item_type === 'experience' && userId) {
            try {
                // Get the date - use provided selectedDate or the one from orderItem
                const voucherDate = selectedDate || orderItem.selected_date

                console.log('[Voucher] Creating voucher via RPC directly...')

                // Call the database function directly instead of fetching our own API
                const { data: voucherId, error: voucherError } = await supabase.rpc('create_voucher', {
                    p_order_item_id: parseInt(orderItemId),
                    p_user_id: userId,
                    p_product_slug: orderItem.product_id,
                    p_selected_date: voucherDate,
                    p_addons: orderItem.addons,
                    p_voucher_recipient_name: orderItem.voucher_recipient_name,
                    p_location: orderItem.location
                })

                if (voucherError) {
                    console.error('Voucher creation failed:', voucherError)
                    // Don't fail the whole request - voucher can be regenerated
                } else {
                    console.log('[Voucher] Generated successfully via RPC:', voucherId)
                }
            } catch (voucherError) {
                console.error('Error in voucher generation logic:', voucherError)
                // Don't fail the whole request
            }
        }

        return NextResponse.json({
            success: true,
            message: confirmOnly ? 'Date confirmed' : 'Date updated and confirmed'
        })

    } catch (error) {
        console.error('Error in confirm-date API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
