import { createClient } from '@/utils/supabase/server'
import { CheckoutForm } from './checkout-form'
import { Profile } from '@/types/supabase'

export default async function CheckoutPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch the user's profile to pre-fill the form if authenticated
  let profile = null
  if (user) {
    const { data, error } = await supabase
      .rpc('get_user_profile', {})
      .returns<Profile>()
      .single()

    if (!error && data) {
      profile = data
    } else if (error) {
      console.error('Error fetching profile for checkout:', error.message)
    }
  }

  return (
    <div className=" bg-slate-950 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <CheckoutForm profile={profile} />
      </div>
    </div>
  )
}