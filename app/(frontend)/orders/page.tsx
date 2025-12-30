import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { OrdersList } from './orders-list'
import { Package } from 'lucide-react'

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in?redirect_to=/orders')
  }

  // Fetch orders using the RPC call
  const { data: orders, error } = await supabase.rpc(
    'get_user_orders_with_items'
  )

  if (error) {
    console.error('Error fetching orders:', error.message)
    return (
      <div className="bg-slate-950 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-main/10 rounded-xl">
              <Package className="h-8 w-8 text-main" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase">Моите поръчки</h1>
              <p className="text-slate-400 text-sm">Следете статуса на вашите поръчки и покупки</p>
            </div>
          </div>
          <div className="text-center py-12 bg-slate-900 border-2 border-red-900/50 rounded-xl">
            <p className="text-red-400 font-medium">Не успяхме да заредим поръчки. Моля опитайте по-късно!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-950 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-main/10 rounded-xl">
            <Package className="h-8 w-8 text-main" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase">Моите поръчки</h1>
            <p className="text-slate-400 text-sm">Следете статуса на вашите поръчки и покупки</p>
          </div>
        </div>
        <OrdersList orders={orders} />
      </div>
    </div>
  )
}
