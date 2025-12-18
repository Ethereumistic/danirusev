import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { VouchersClient } from "./vouchers-client"

export default async function VouchersPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/sign-in")
    }

    // Get user's vouchers
    const { data: vouchers, error } = await supabase.rpc('get_user_vouchers')

    if (error) {
        console.error('Error fetching vouchers:', error)
    }

    return <VouchersClient vouchers={vouchers || []} />
}
