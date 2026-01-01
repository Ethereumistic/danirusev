import { createClient } from '@/utils/supabase/server'
import { OrdersDataTable } from './data-table'
import { columns } from './columns'
import { redirect } from 'next/navigation'
import { LayoutDashboard, QrCode, Clock, Truck, CheckCircle } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-950 pt-28 pb-12 px-4">
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

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            {
              label: 'Общо поръчки',
              value: nonNullOrders.length,
              icon: LayoutDashboard,
              color: 'text-white',
              borderColor: 'border-slate-800',
              bgColor: 'bg-slate-900/50'
            },
            {
              label: 'Чакащи',
              value: nonNullOrders.filter((o: any) => o.status?.toLowerCase() === 'pending').length,
              icon: Clock,
              color: 'text-yellow-400',
              borderColor: 'border-yellow-400/20',
              bgColor: 'bg-yellow-400/5'
            },
            {
              label: 'Изпратени',
              value: nonNullOrders.filter((o: any) => o.status === 'shipped').length,
              icon: Truck,
              color: 'text-purple-400',
              borderColor: 'border-purple-400/20',
              bgColor: 'bg-purple-400/5'
            },
            {
              label: 'Приключени',
              value: nonNullOrders.filter((o: any) => o.status === 'delivered').length,
              icon: CheckCircle,
              color: 'text-green-400',
              borderColor: 'border-green-400/20',
              bgColor: 'bg-green-400/5'
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden group bg-slate-900/40 backdrop-blur-xl border-2 ${stat.borderColor} rounded-2xl p-6 transition-all hover:scale-[1.02] hover:bg-slate-900/60`}
            >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bgColor} border border-white/5`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              {/* Subtle accent gradient */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${stat.color.replace('text', 'bg')}`} />
            </div>
          ))}
        </div>

        <OrdersDataTable columns={columns} data={nonNullOrders} />
      </div>
    </div>
  )
}