import { createClient } from "@/utils/supabase/server"
import { redirect, notFound } from "next/navigation"
import { VoucherDetailClient } from "./voucher-detail-client"

interface VoucherDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function VoucherDetailPage({ params }: VoucherDetailPageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/sign-in")
    }

    // Get voucher details
    const { data: vouchers, error } = await supabase.rpc('get_voucher_by_id', {
        p_voucher_id: id
    })

    if (error || !vouchers || vouchers.length === 0) {
        console.error('Error fetching voucher:', error)
        notFound()
    }

    const voucher = vouchers[0]

    // Verify the voucher belongs to the current user
    if (voucher.user_id !== user.id) {
        notFound()
    }

    return <VoucherDetailClient voucher={voucher} />
}
