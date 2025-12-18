'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Ticket, Calendar, MapPin, Clock, CheckCircle, AlertCircle, Download, ArrowLeft, Gift, QrCode } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

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

interface VoucherDetailClientProps {
    voucher: Voucher
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
    'active': { color: 'text-green-400', bgColor: 'bg-green-400/10 border-green-400/30', label: 'Активен', icon: CheckCircle },
    'pending': { color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/30', label: 'Чакащ', icon: Clock },
    'redeemed': { color: 'text-blue-400', bgColor: 'bg-blue-400/10 border-blue-400/30', label: 'Използван', icon: CheckCircle },
    'expired': { color: 'text-red-400', bgColor: 'bg-red-400/10 border-red-400/30', label: 'Изтекъл', icon: AlertCircle },
}

const productNames: Record<string, string> = {
    'drift-taxi': 'Drift Taxi',
    'drift-rent': 'Наеми Дрифтачка',
    'drift-mix': 'Drift Mix',
}

export function VoucherDetailClient({ voucher }: VoucherDetailClientProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

    const isExpired = new Date(voucher.expiry_date) < new Date()
    const displayStatus = isExpired ? 'expired' : voucher.status
    const status = statusConfig[displayStatus] || statusConfig['pending']
    const StatusIcon = status.icon

    // Generate QR code for display
    useEffect(() => {
        const generateQR = async () => {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
            const verifyUrl = `${baseUrl}/dash/verify/${voucher.id}`
            try {
                const dataUrl = await QRCode.toDataURL(verifyUrl, {
                    width: 200,
                    margin: 2,
                    color: { dark: '#000000', light: '#FFFFFF' }
                })
                setQrDataUrl(dataUrl)
            } catch (err) {
                console.error('Error generating QR:', err)
            }
        }
        generateQR()
    }, [voucher.id])

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Back button */}
            <Button asChild variant="ghost" className="mb-6 text-slate-400 hover:text-white">
                <Link href="/vouchers">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Назад към ваучерите
                </Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main voucher info */}
                <div className="lg:col-span-2">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-main/20">
                                        <Ticket className="h-6 w-6 text-main" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-black text-white">
                                            {productNames[voucher.product_slug] || voucher.product_slug}
                                        </CardTitle>
                                        <p className="text-sm text-slate-400 mt-1">Ваучер #{voucher.id.slice(0, 8)}</p>
                                    </div>
                                </div>
                                <Badge className={`${status.bgColor} ${status.color} border text-sm px-3 py-1`}>
                                    <StatusIcon className="h-4 w-4 mr-1" />
                                    {status.label}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Separator className="bg-slate-800" />

                            {/* Date and Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <Calendar className="h-4 w-4 text-main" />
                                        <span className="text-sm font-medium">Дата на преживяването</span>
                                    </div>
                                    <p className="text-white font-bold text-lg">
                                        {new Date(voucher.selected_date).toLocaleDateString('bg-BG', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {voucher.location && (
                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                                            <MapPin className="h-4 w-4 text-main" />
                                            <span className="text-sm font-medium">Локация</span>
                                        </div>
                                        <p className="text-white font-bold text-lg">{voucher.location}</p>
                                    </div>
                                )}
                            </div>

                            {/* Expiry */}
                            <div className="flex items-center gap-2 text-slate-400">
                                <Clock className="h-4 w-4" />
                                <span>Валиден до: <span className={isExpired ? 'text-red-400' : 'text-white'}>
                                    {new Date(voucher.expiry_date).toLocaleDateString('bg-BG', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span></span>
                            </div>

                            {/* Addons */}
                            {voucher.addons && voucher.addons.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">Допълнения</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {voucher.addons.map((addon, idx) => (
                                            <Badge key={idx} className="bg-slate-800 text-slate-300 border-slate-700">
                                                {addon}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recipient */}
                            {voucher.voucher_recipient_name && (
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <Gift className="h-4 w-4 text-main" />
                                        <span className="text-sm font-medium">Получател на ваучера</span>
                                    </div>
                                    <p className="text-white font-bold">{voucher.voucher_recipient_name}</p>
                                </div>
                            )}

                            <Separator className="bg-slate-800" />

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button asChild className="flex-1 bg-main hover:bg-main/90 text-black font-bold">
                                    <a href={`/api/vouchers/download/${voucher.id}`} download>
                                        <Download className="h-4 w-4 mr-2" />
                                        Изтегли PDF
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* QR Code Card */}
                <div className="lg:col-span-1">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <QrCode className="h-5 w-5 text-main" />
                                QR Код за проверка
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            {qrDataUrl ? (
                                <div className="bg-white p-4 rounded-lg">
                                    <img src={qrDataUrl} alt="Voucher QR Code" className="w-48 h-48" />
                                </div>
                            ) : (
                                <div className="w-48 h-48 bg-slate-800 rounded-lg animate-pulse" />
                            )}
                            <p className="text-xs text-slate-500 text-center mt-4">
                                Покажете този QR код на персонала при пристигане
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
