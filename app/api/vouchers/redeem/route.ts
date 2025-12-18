import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const body = await request.json()
        const { voucherId } = body

        if (!voucherId) {
            return NextResponse.json({ error: 'Voucher ID is required' }, { status: 400 })
        }

        // Call RPC function to redeem voucher
        const { data, error } = await supabase.rpc('redeem_voucher', {
            p_voucher_id: voucherId
        })

        if (error) {
            console.error('Error redeeming voucher:', error)
            return NextResponse.json({ error: 'Failed to redeem voucher' }, { status: 500 })
        }

        // The RPC returns a JSONB object with success and error/message
        if (!data.success) {
            return NextResponse.json({
                success: false,
                error: data.error
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            message: data.message
        })

    } catch (error) {
        console.error('Error in redeem voucher API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
