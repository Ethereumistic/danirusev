import { createClient } from "@/utils/supabase/server"
import { redirect, notFound } from "next/navigation"
import { VerifyVoucherClient } from "./verify-voucher-client"

interface VerifyVoucherPageProps {
    params: Promise<{ id: string }>
}

export default async function VerifyVoucherPage({ params }: VerifyVoucherPageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/sign-in")
    }

    // TODO: Add admin role check here
    // For now, any authenticated user can verify

    // Get voucher details
    const { data: vouchers, error } = await supabase.rpc('get_voucher_by_id', {
        p_voucher_id: id
    })

    if (error) {
        console.error('Error fetching voucher:', error)
        notFound()
    }

    if (!vouchers || vouchers.length === 0) {
        return <VerifyVoucherClient voucher={null} voucherId={id} />
    }

    const voucher = vouchers[0]

    return <VerifyVoucherClient voucher={voucher} voucherId={id} />
}
