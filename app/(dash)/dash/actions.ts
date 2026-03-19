'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function deleteOrder(orderId: string) {
  const supabase = await createClient()

  // Call the RPC function to delete the order
  const { error } = await supabase.rpc('delete_order_by_id', {
    order_id_to_delete: orderId,
  })

  if (error) {
    console.error('Error deleting order:', error)
    throw new Error('Failed to delete order.')
  }

  revalidatePath('/dash')
}

export async function updateVoucherRecipientName(orderItemId: number, newName: string) {
  const supabase = await createClient()

  // Update both order_items and vouchers via RPC
  const { error } = await supabase.rpc('update_voucher_recipient', {
    p_order_item_id: orderItemId,
    p_new_name: newName
  })

  if (error) {
    console.error('Error updating order item recipient via RPC:', error)
    throw new Error('Failed to update recipient.')
  }

  revalidatePath('/dash')
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()

  // Call the RPC function to update the order status
  const { error } = await supabase.rpc('update_order_status_by_id', {
    order_id_to_update: orderId,
    new_status: status,
  })

  if (error) {
    console.error('Error updating order status:', error)
    throw new Error('Failed to update order status.')
  }

  revalidatePath('/dash')
}

export async function confirmOrderDate(params: {
  orderId: string,
  orderItemId: number,
  selectedDate: string,
  confirmOnly: boolean,
  orderItem: any,
  userId: string | null
}) {
  const supabase = await createClient()
  const { orderId, orderItemId, selectedDate, confirmOnly, orderItem, userId } = params

  // Determine the final date to use
  const finalDate = confirmOnly ? null : selectedDate

  // Call RPC function to update date and status
  const { error } = await supabase.rpc('confirm_order_date', {
    p_order_id: parseInt(orderId),
    p_order_item_id: orderItemId,
    p_selected_date: finalDate
  })

  if (error) {
    console.error('Error calling confirm_order_date RPC:', error)
    throw new Error('Failed to confirm order date')
  }

  // If this is an experience order, generate voucher
  if (orderItem && orderItem.item_type === 'experience') {
    const voucherDate = selectedDate || orderItem.selected_date

    // Use standard client to call RPC bridge in public schema
    const { data: voucherId, error: voucherError } = await supabase.rpc('create_voucher', {
      p_order_item_id: orderItemId,
      p_user_id: userId || null,
      p_product_slug: orderItem.product_id,
      p_selected_date: voucherDate,
      p_addons: orderItem.addons,
      p_voucher_recipient_name: orderItem.voucher_recipient_name,
      p_location: orderItem.location,
      p_voucher_type: orderItem.voucher_type
    })

    if (voucherError) {
      console.error('[Dash] Voucher creation failed:', voucherError)
    } else if (voucherId) {
      // Use the RPC bridge to get notification details securely
      try {
        console.log('[Dash] Fetching details for email...')
        const { data: details, error: detailsError } = await supabase.rpc('get_voucher_notification_details', {
          p_voucher_id: voucherId
        })

        if (!detailsError && details?.[0]?.user_email) {
          const info = details[0]
          const { resend, emailTemplates } = await import('@/lib/resend')
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://danirusev.com'

          console.log(`[Dash] Triggering Resend for: ${info.user_email}`)
          const { data: emailData, error: emailErr } = await resend.emails.send(
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

          if (emailErr) console.error('[Dash] Resend error:', emailErr)
          else console.log('[Dash] Email sent successfully!', emailData?.id)
        } else {
          console.error('[Dash] Details fetch failed or email missing:', detailsError?.message)
        }
      } catch (err) {
        console.error('[Dash] Email flow exception:', err)
      }
    }
  }

  revalidatePath('/dash')
}