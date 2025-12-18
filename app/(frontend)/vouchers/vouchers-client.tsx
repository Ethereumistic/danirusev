'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ticket, Calendar, MapPin, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react'
import Link from 'next/link'

type Voucher = {
    id: string
    order_item_id: number
    product_slug: string
    selected_date: string
    expiry_date: string
    addons: string[] | null
    voucher_recipient_name: string | null
    location: string | null
    pdf_url: string | null
    status: string
    redeemed_at: string | null
    created_at: string
}

interface VouchersClientProps {
    vouchers: Voucher[]
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
    'active': { color: 'text-green-400', bgColor: 'bg-green-400/10 border-green-400/30', icon: CheckCircle },
    'pending': { color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/30', icon: Clock },
    'redeemed': { color: 'text-blue-400', bgColor: 'bg-blue-400/10 border-blue-400/30', icon: CheckCircle },
    'expired': { color: 'text-red-400', bgColor: 'bg-red-400/10 border-red-400/30', icon: AlertCircle },
}

const productNames: Record<string, string> = {
    'drift-taxi': 'Drift Taxi',
    'drift-rent': 'Наеми Дрифтачка',
    'drift-mix': 'Drift Mix',
}

export function VouchersClient({ vouchers }: VouchersClientProps) {
    if (vouchers.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center py-20">
                    <Ticket className="mx-auto h-16 w-16 text-slate-600 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Нямате ваучери</h2>
                    <p className="text-slate-400 mb-6">
                        Когато закупите и потвърдите дрифт преживяване, вашите ваучери ще се появят тук.
                    </p>
                    <Button asChild className="bg-main hover:bg-main/90 text-black font-bold">
                        <Link href="/experiences">Разгледай преживяванията</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Моите Ваучери</h1>
                <p className="text-slate-400">Управлявайте и преглеждайте вашите дрифт ваучери</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vouchers.map((voucher) => {
                    const status = statusConfig[voucher.status] || statusConfig['pending']
                    const StatusIcon = status.icon
                    const isExpired = new Date(voucher.expiry_date) < new Date()
                    const displayStatus = isExpired ? 'expired' : voucher.status
                    const finalStatus = statusConfig[displayStatus] || statusConfig['pending']
                    const FinalIcon = finalStatus.icon

                    return (
                        <Card key={voucher.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Ticket className="h-5 w-5 text-main" />
                                        <CardTitle className="text-lg font-bold text-white">
                                            {productNames[voucher.product_slug] || voucher.product_slug}
                                        </CardTitle>
                                    </div>
                                    <Badge className={`${finalStatus.bgColor} ${finalStatus.color} border`}>
                                        <FinalIcon className="h-3 w-3 mr-1" />
                                        {displayStatus === 'active' ? 'Активен' :
                                            displayStatus === 'redeemed' ? 'Използван' :
                                                displayStatus === 'expired' ? 'Изтекъл' : 'Чакащ'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Date info */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Calendar className="h-4 w-4 text-main" />
                                        <span>
                                            {new Date(voucher.selected_date).toLocaleDateString('bg-BG', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    {voucher.location && (
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin className="h-4 w-4" />
                                            <span>{voucher.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                        <Clock className="h-3 w-3" />
                                        <span>Валиден до: {new Date(voucher.expiry_date).toLocaleDateString('bg-BG')}</span>
                                    </div>
                                </div>

                                {/* Addons */}
                                {voucher.addons && voucher.addons.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {voucher.addons.map((addon, idx) => (
                                            <Badge key={idx} className="text-xs bg-slate-800 text-slate-300 border-slate-700">
                                                {addon}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Recipient name */}
                                {voucher.voucher_recipient_name && (
                                    <p className="text-sm text-slate-400">
                                        Получател: <span className="text-white font-semibold">{voucher.voucher_recipient_name}</span>
                                    </p>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-2 pt-2">
                                    <Button asChild variant="outline" className="flex-1 border-slate-700 hover:bg-slate-800">
                                        <Link href={`/vouchers/${voucher.id}`}>
                                            Преглед
                                        </Link>
                                    </Button>
                                    <Button asChild className="flex-1 bg-main hover:bg-main/90 text-black font-bold">
                                        <a href={`/api/vouchers/download/${voucher.id}`} download>
                                            <Download className="h-4 w-4 mr-1" />
                                            PDF
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
