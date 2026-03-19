import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

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

        // Update order_items.selected_date if a new date is provided
        // This ensures the customer sees the confirmed date on their orders page
        if (selectedDate && orderItemId) {
            const { error: updateDateError } = await supabase.rpc('update_order_item_date', {
                p_order_item_id: parseInt(orderItemId),
                p_selected_date: selectedDate
            })

            if (updateDateError) {
                console.error('Error updating order item date:', updateDateError)
                // Continue anyway - this is not critical
            }
        }

        // Call RPC function to update date and status
        const { data, error } = await supabase.rpc('confirm_order_date', {
            p_order_id: parseInt(orderId),
            p_order_item_id: orderItemId ? parseInt(orderItemId) : null,
            p_selected_date: finalDate
        })

        if (error) {
            console.error('Error calling confirm_order_date RPC:', error)
            return NextResponse.json({ error: 'Failed to confirm order date' }, { status: 500 })
        }

        // If this is an experience order, generate voucher
        if (orderItem && orderItem.item_type === 'experience') {
            try {
                // Get the date - use provided selectedDate or the one from orderItem
                const voucherDate = selectedDate || orderItem.selected_date

                console.log('[Voucher] Creating voucher via RPC directly...')

                // Call the database function directly instead of fetching our own API
                const { data: voucherId, error: voucherError } = await supabase.rpc('create_voucher', {
                    p_order_item_id: parseInt(orderItemId),
                    p_user_id: userId || null,
                    p_product_slug: orderItem.product_id,
                    p_selected_date: voucherDate,
                    p_addons: orderItem.addons,
                    p_voucher_recipient_name: orderItem.voucher_recipient_name,
                    p_location: orderItem.location,
                    p_voucher_type: orderItem.voucher_type // Now passing this explicitly
                })

                if (voucherError) {
                    console.error('[Voucher] RPC create_voucher failed:', voucherError)
                    // Don't fail the whole request - voucher can be regenerated
                } else {
                    console.log('[Voucher] Generated successfully via RPC:', voucherId)

                    // RPC Bridge: Call the public function to get data from ecommerce schema
                    console.log(`[Voucher] Fetching notification details for: ${voucherId}`)
                    const { data: details, error: detailsError } = await supabase.rpc('get_voucher_notification_details', {
                        p_voucher_id: voucherId
                    })

                    if (detailsError) {
                        console.error('[Voucher] RPC Error:', detailsError.message)
                    } else if (!details || details.length === 0) {
                        console.warn('[Voucher] No data returned from RPC for ID:', voucherId)
                    } else {
                        const info = details[0]
                        if (info.user_email) {
                            console.log(`[Voucher] Sending email to: ${info.user_email}`)
                            const { resend, emailTemplates } = await import('@/lib/resend')
                            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://danirusev.com'

                            const { data: emailRes, error: emailError } = await resend.emails.send(
                                emailTemplates.voucherConfirmed({
                                    to: info.user_email,
                                    experienceName: orderItem.title || info.experience_title || 'Преживяване',
                                    recipientName: info.recipient_name || info.user_full_name || 'Клиент',
                                    experienceDate: new Date(voucherDate).toLocaleDateString('bg-BG', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    }),
                                    expiryDate: new Date(info.expiry_date).toLocaleDateString('bg-BG'),
                                    voucherUrl: userId ? `${baseUrl}/vouchers#voucher-${voucherId}` : `${baseUrl}/api/vouchers/download/${voucherId}`
                                })
                            )

                            if (emailError) console.error('[Voucher] Resend error:', emailError)
                            else console.log('[Voucher] Email successfully sent!', emailRes?.id)
                        } else {
                            console.error('[Voucher] RPC returned data but email was empty.')
                        }
                    }
                }
            } catch (voucherError) {
                console.error('Error in voucher generation/email logic:', voucherError)
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
