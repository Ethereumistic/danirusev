'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    Ticket, Calendar, MapPin, Clock, CheckCircle, AlertCircle,
    ArrowLeft, User, Phone, Mail, XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Voucher = {
    id: string
    order_item_id: number
    user_id: string
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
    customer_name: string | null
    customer_email: string | null
    customer_phone: string | null
}

interface VerifyVoucherClientProps {
    voucher: Voucher | null
    voucherId: string
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
    'active': { color: 'text-green-400', bgColor: 'bg-green-400/10 border-green-400/30', label: 'Активен - Може да се използва', icon: CheckCircle },
    'pending': { color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/30', label: 'Чакащ', icon: Clock },
    'redeemed': { color: 'text-blue-400', bgColor: 'bg-blue-400/10 border-blue-400/30', label: 'Вече използван', icon: CheckCircle },
    'expired': { color: 'text-red-400', bgColor: 'bg-red-400/10 border-red-400/30', label: 'Изтекъл', icon: AlertCircle },
}

const productNames: Record<string, string> = {
    'drift-taxi': 'Drift Taxi',
    'drift-rent': 'Наеми Дрифтачка',
    'drift-mix': 'Drift Mix',
}

export function VerifyVoucherClient({ voucher, voucherId }: VerifyVoucherClientProps) {
    const router = useRouter()
    const [isRedeeming, setIsRedeeming] = useState(false)
    const [redeemError, setRedeemError] = useState<string | null>(null)
    const [redeemSuccess, setRedeemSuccess] = useState(false)

    // Voucher not found
    if (!voucher) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Button asChild variant="ghost" className="mb-6 text-slate-400 hover:text-white">
                    <Link href="/dash/verify">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Назад към сканера
                    </Link>
                </Button>

                <Card className="bg-slate-900 border-red-500/30">
                    <CardContent className="py-12 text-center">
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Ваучерът не е намерен</h2>
                        <p className="text-slate-400 mb-2">ID: {voucherId}</p>
                        <p className="text-slate-500 text-sm">
                            Този ваучер не съществува или е невалиден.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const isExpired = new Date(voucher.expiry_date) < new Date()
    const displayStatus = isExpired ? 'expired' : voucher.status
    const status = statusConfig[displayStatus] || statusConfig['pending']
    const StatusIcon = status.icon
    const canRedeem = displayStatus === 'active'

    const handleRedeem = async () => {
        setIsRedeeming(true)
        setRedeemError(null)

        try {
            const response = await fetch('/api/vouchers/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voucherId: voucher.id })
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to redeem voucher')
            }

            setRedeemSuccess(true)
        } catch (error) {
            setRedeemError(error instanceof Error ? error.message : 'Грешка при маркиране на ваучера')
        } finally {
            setIsRedeeming(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Button asChild variant="ghost" className="mb-6 text-slate-400 hover:text-white">
                <Link href="/dash/verify">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Назад към сканера
                </Link>
            </Button>

            {/* Success message */}
            {redeemSuccess && (
                <Card className="bg-green-500/10 border-green-500/30 mb-6">
                    <CardContent className="py-6 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-green-400">Ваучерът е успешно маркиран като използван!</h3>
                    </CardContent>
                </Card>
            )}

            <Card className={`bg-slate-900 ${canRedeem ? 'border-green-500/30' : 'border-slate-800'}`}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${canRedeem ? 'bg-green-500/20' : 'bg-slate-800'}`}>
                                <Ticket className={`h-6 w-6 ${canRedeem ? 'text-green-500' : 'text-slate-500'}`} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-white">
                                    {productNames[voucher.product_slug] || voucher.product_slug}
                                </CardTitle>
                                <p className="text-xs text-slate-500 mt-1">#{voucher.id}</p>
                            </div>
                        </div>
                        <Badge className={`${status.bgColor} ${status.color} border`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {status.label}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Separator className="bg-slate-800" />

                    {/* Customer info */}
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                        <h4 className="text-sm font-bold text-slate-400 uppercase">Информация за клиента</h4>
                        {voucher.customer_name && (
                            <div className="flex items-center gap-2 text-white">
                                <User className="h-4 w-4 text-main" />
                                <span>{voucher.customer_name}</span>
                            </div>
                        )}
                        {voucher.voucher_recipient_name && voucher.voucher_recipient_name !== voucher.customer_name && (
                            <div className="flex items-center gap-2 text-slate-300 text-sm">
                                <span className="text-slate-500">Получател:</span>
                                <span>{voucher.voucher_recipient_name}</span>
                            </div>
                        )}
                        {voucher.customer_phone && (
                            <div className="flex items-center gap-2 text-slate-400">
                                <Phone className="h-4 w-4" />
                                <span>{voucher.customer_phone}</span>
                            </div>
                        )}
                        {voucher.customer_email && (
                            <div className="flex items-center gap-2 text-slate-400">
                                <Mail className="h-4 w-4" />
                                <span>{voucher.customer_email}</span>
                            </div>
                        )}
                    </div>

                    {/* Date and location */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                <Calendar className="h-3 w-3" />
                                <span>Дата</span>
                            </div>
                            <p className="text-white font-bold">
                                {new Date(voucher.selected_date).toLocaleDateString('bg-BG', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                        {voucher.location && (
                            <div className="bg-slate-800/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>Локация</span>
                                </div>
                                <p className="text-white font-bold">{voucher.location}</p>
                            </div>
                        )}
                    </div>

                    {/* Expiry */}
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-500">Валиден до:</span>
                        <span className={isExpired ? 'text-red-400' : 'text-slate-300'}>
                            {new Date(voucher.expiry_date).toLocaleDateString('bg-BG')}
                        </span>
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

                    {/* Redeemed info */}
                    {voucher.status === 'redeemed' && voucher.redeemed_at && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
                            <p className="text-blue-400">
                                Използван на: {new Date(voucher.redeemed_at).toLocaleString('bg-BG')}
                            </p>
                        </div>
                    )}

                    {/* Error message */}
                    {redeemError && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                            <p className="text-red-400 text-sm">{redeemError}</p>
                        </div>
                    )}

                    <Separator className="bg-slate-800" />

                    {/* Redeem button */}
                    {canRedeem && !redeemSuccess && (
                        <Button
                            onClick={handleRedeem}
                            disabled={isRedeeming}
                            className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white"
                        >
                            {isRedeeming ? 'Маркиране...' : 'Маркирай като използван'}
                        </Button>
                    )}

                    {/* Scan another */}
                    <Button asChild variant="outline" className="w-full border-slate-700 hover:bg-slate-800">
                        <Link href="/dash/verify">
                            Сканирай друг ваучер
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
