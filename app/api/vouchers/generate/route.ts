import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const body = await request.json()
        const {
            orderItemId,
            userId,
            productSlug,
            selectedDate,
            addons,
            voucherRecipientName,
            location
        } = body

        if (!orderItemId || !userId || !productSlug || !selectedDate) {
            return NextResponse.json({
                error: 'Missing required fields'
            }, { status: 400 })
        }

        // Create voucher record in database (PDF will be generated on-demand when downloaded)
        const { data: voucherId, error: createError } = await supabase.rpc('create_voucher', {
            p_order_item_id: orderItemId,
            p_user_id: userId,
            p_product_slug: productSlug,
            p_selected_date: selectedDate,
            p_addons: addons,
            p_voucher_recipient_name: voucherRecipientName,
            p_location: location
        })

        if (createError) {
            console.error('Error creating voucher:', createError)
            return NextResponse.json({ error: 'Failed to create voucher record' }, { status: 500 })
        }

        console.log('[Voucher] Created voucher record:', voucherId)

        return NextResponse.json({
            success: true,
            voucherId
        })

    } catch (error) {
        console.error('Error generating voucher:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
