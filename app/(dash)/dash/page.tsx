import { createClient } from '@/utils/supabase/server'
import { OrdersDataTable } from './data-table'
import { columns } from './columns'
import { redirect } from 'next/navigation'
import { LayoutDashboard, QrCode } from 'lucide-react'
import Link from 'next/link'

export default async function DashPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  const { data: orders, error } = await supabase.rpc(
    'get_all_orders_with_details'
  )

  if (error) {
    console.error('Error fetching orders:', error)
  }

  const nonNullOrders = orders || []

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-main/10 rounded-xl">
              <LayoutDashboard className="h-8 w-8 text-main" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase">Админ панел</h1>
              <p className="text-slate-500">Управление на поръчки</p>
            </div>
          </div>
          <Link
            href="/dash/verify"
            className="flex items-center gap-2 px-4 py-3 bg-main hover:bg-main/90 text-black font-bold rounded-xl transition-colors"
          >
            <QrCode className="h-5 w-5" />
            Сканирай ваучер
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-500 uppercase font-bold">Общо поръчки</p>
            <p className="text-3xl font-black text-white mt-1">{nonNullOrders.length}</p>
          </div>
          <div className="bg-slate-900 border-2 border-yellow-400/20 rounded-xl p-4">
            <p className="text-sm text-yellow-400 uppercase font-bold">Изчакващи</p>
            <p className="text-3xl font-black text-yellow-400 mt-1">
              {nonNullOrders.filter((o: { status: string }) => o.status === 'Pending' || o.status === 'pending').length}
            </p>
          </div>
          <div className="bg-slate-900 border-2 border-purple-400/20 rounded-xl p-4">
            <p className="text-sm text-purple-400 uppercase font-bold">Изпратени</p>
            <p className="text-3xl font-black text-purple-400 mt-1">
              {nonNullOrders.filter((o: { status: string }) => o.status === 'shipped').length}
            </p>
          </div>
          <div className="bg-slate-900 border-2 border-green-400/20 rounded-xl p-4">
            <p className="text-sm text-green-400 uppercase font-bold">Доставени</p>
            <p className="text-3xl font-black text-green-400 mt-1">
              {nonNullOrders.filter((o: { status: string }) => o.status === 'delivered').length}
            </p>
          </div>
        </div>

        <OrdersDataTable columns={columns} data={nonNullOrders} />
      </div>
    </div>
  )
}