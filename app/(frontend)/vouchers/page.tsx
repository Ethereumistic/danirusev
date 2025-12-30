import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { VouchersClient } from "./vouchers-client"
import { Ticket } from "lucide-react"

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
        return (
            <div className="bg-slate-950 py-8 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-main/10 rounded-xl">
                            <Ticket className="h-8 w-8 text-main" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase">Моите Ваучери</h1>
                    </div>
                    <div className="text-center py-12 bg-slate-900 border-2 border-red-900/50 rounded-xl">
                        <p className="text-red-400 font-medium">Не успяхме да заредим ваучери. Моля опитайте по-късно!</p>
                    </div>
                </div>
            </div>
        )
    }

    return <VouchersClient vouchers={vouchers || []} />
}
