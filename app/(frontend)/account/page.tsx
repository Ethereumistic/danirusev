import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { AccountForm } from "./account-form"
import { Profile } from "@/types/supabase"
import { UserCircle } from "lucide-react"

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const { data: profile, error } = await supabase
    .rpc('get_user_profile', {})
    .returns<Profile>()
    .single()

  if (error) {
    console.error('Error fetching profile:', error.message)
  }

  return (
    <div className=" bg-slate-950 py-8 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}


      <div className=" mx-auto max-w-5xl relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="p-4 rounded-2xl bg-main/10 border-2 border-main/20 shadow-[0_0_20px_rgba(255,107,0,0.1)]">
            <UserCircle className="h-10 w-10 text-main" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none mb-2">
              Вашият <span className="text-main">Профил</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
              Управлявайте вашите данни и настройки
            </p>
          </div>
        </div>

        <AccountForm user={user} profile={profile} />
      </div>
    </div>
  )
}
