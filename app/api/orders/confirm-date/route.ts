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
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

                // Get the date - use provided selectedDate or the one from orderItem
                const voucherDate = selectedDate || orderItem.selected_date

                const voucherResponse = await fetch(`${baseUrl}/api/vouchers/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderItemId: parseInt(orderItemId),
                        userId: userId,
                        productSlug: orderItem.product_id,
                        selectedDate: voucherDate,
                        addons: orderItem.addons,
                        voucherRecipientName: orderItem.voucher_recipient_name,
                        location: orderItem.location
                    })
                })

                if (!voucherResponse.ok) {
                    const voucherError = await voucherResponse.json()
                    console.error('Voucher generation failed:', voucherError)
                    // Don't fail the whole request - voucher can be regenerated
                } else {
                    const voucherData = await voucherResponse.json()
                    console.log('[Voucher] Generated successfully:', voucherData)
                }
            } catch (voucherError) {
                console.error('Error calling voucher generation:', voucherError)
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
