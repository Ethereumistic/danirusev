import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CheckoutForm } from './checkout-form'
import { Profile } from '@/types/supabase'

export default async function CheckoutPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to sign-in page, but add a redirect URL to come back here
    const redirectTo = '/checkout'
    redirect(`/sign-in?redirect_to=${encodeURIComponent(redirectTo)}`)
  }

  // Fetch the user's profile to pre-fill the form
  // We use the verified RPC function and provide the correct return type
  const { data: profile, error } = await supabase
    .rpc('get_user_profile', {})
    .returns<Profile>()
    .single()

  if (error) {
    console.error('Error fetching profile for checkout:', error.message)
    // We can still proceed, the form will just be empty
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-3">
            Информация преди заплащане
          </h1>
          <p className="text-slate-400 text-lg">
            Още една крачка до вашето незабравимо преживяване
          </p>
        </div>
        <CheckoutForm profile={profile} />
      </div>
    </div>
  )
}