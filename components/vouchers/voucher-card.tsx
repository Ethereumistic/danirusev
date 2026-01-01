'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Ticket,
    Calendar,
    MapPin,
    Clock,
    CheckCircle,
    AlertCircle,
    Download,
    Gift,
    Copy,
    Check
} from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import {
    getDriftThemeClasses,
    getExperienceThemeColor,
    getExperienceIcon,
    getExperienceThumbnail,
} from '@/lib/utils'
import Image from 'next/image'

export type Voucher = {
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

interface VoucherCardProps {
    voucher: Voucher
}

const productNames: Record<string, string> = {
    'drift-taxi': 'Дрифт Такси',
    'drift-rent': 'Наеми Дрифтачка',
    'drift-mix': 'Дрифт Микс',
    'drift-event': 'Дрифт Събитие',
}

const statusConfig: Record<string, { label: string; icon: any }> = {
    'active': { label: 'Активен', icon: CheckCircle },
    'pending': { label: 'Чакащ', icon: Clock },
    'redeemed': { label: 'Използван', icon: CheckCircle },
    'expired': { label: 'Изтекъл', icon: AlertCircle },
}

export function VoucherCard({ voucher }: VoucherCardProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleCopyId = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(voucher.id)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const title = productNames[voucher.product_slug] || voucher.product_slug
    const themeColor = getExperienceThemeColor(title)
    const theme = getDriftThemeClasses(themeColor)
    const thumbnail = getExperienceThumbnail(themeColor)

    const isExpired = new Date(voucher.expiry_date) < new Date()
    const displayStatus = isExpired ? 'expired' : voucher.status
    const statusInfo = statusConfig[displayStatus] || statusConfig['pending']
    const StatusIcon = statusInfo.icon

    // Generate QR code for display
    useEffect(() => {
        const generateQR = async () => {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
            const verifyUrl = `${baseUrl}/dash/verify/${voucher.id}`
            try {
                const dataUrl = await QRCode.toDataURL(verifyUrl, {
                    width: 400,
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
        <div className={`relative rounded-[2rem] overflow-hidden border-2 ${theme.borderFaded} ${theme.shadow} transition-all w-full`}>
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} pointer-events-none`} />

            {/* Left accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${theme.bg}`} />

            <div className="relative bg-slate-950/90 p-6 md:p-8 lg:p-10 ml-2">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

                    {/* Column 1: Title, Image, Recipient, Status */}
                    <div className="flex flex-col h-full">
                        <div className="space-y-6">
                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                                {title}
                            </h2>

                            {/* Image with absolute badges */}
                            <div className={`relative w-full aspect-video lg:aspect-square rounded-2xl md:rounded-[2rem] overflow-hidden border-4 ${theme.border} ${theme.borderStyle} ${theme.shadow} bg-slate-900 ring-1 ring-white/5`}>
                                <Image
                                    src={thumbnail}
                                    alt={title}
                                    fill
                                    className="object-cover scale-105"
                                />

                                <div className="absolute top-4 right-4">
                                    <Badge className={`text-[10px] font-black uppercase px-2 py-1 ${theme.bg} text-black border-none shadow-lg`}>
                                        Преживяване
                                    </Badge>
                                </div>

                                {/* Location Badge */}
                                {voucher.location && (
                                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                                        <MapPin className={`h-4 w-4 ${theme.text}`} />
                                        <span className="text-white text-[11px] font-black uppercase leading-none">
                                            {voucher.location}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recipient & Status - PUSHED TO BOTTOM */}
                        <div className="mt-8 space-y-4">
                            {voucher.voucher_recipient_name && (
                                <div className={`p-4 rounded-2xl ${theme.bgFaded} border border-white/5 flex items-center gap-4`}>
                                    <div className={`p-2.5 rounded-xl bg-black/40 border ${theme.borderFaded}`}>
                                        <Gift className={`h-5 w-5 ${theme.text}`} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">Получател:</span>
                                        <span className={`font-black tracking-tight ${theme.text} leading-tight`}>{voucher.voucher_recipient_name}</span>
                                    </div>
                                </div>
                            )}

                            <div className={`p-4 rounded-2xl border-2 ${displayStatus === 'active' ? 'border-main/30 bg-main/5' : 'border-red-500/30 bg-red-500/5'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${displayStatus === 'active' ? 'bg-main/20 text-main' : 'bg-red-500/20 text-red-500'}`}>
                                        <StatusIcon className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">Статус на ваучера:</span>
                                        <span className={`font-black uppercase tracking-tight leading-none ${displayStatus === 'active' ? 'text-main' : 'text-red-500'}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Date Header & Addons */}
                    <div className="flex flex-col h-full lg:pt-14">
                        <div className="space-y-8">
                            {/* Date Section */}
                            <div className="space-y-4">
                                <h4 className={`font-black text-xl text-white uppercase tracking-tight`}>
                                    {new Date(voucher.selected_date).toLocaleDateString('bg-BG', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <Clock className={`h-4 w-4 ${theme.text}`} />
                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Валидност на преживяването</span>
                                </div>
                                <div className="p-4 rounded-xl border border-white/5 bg-slate-900/50">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Валиден до:</span>
                                        <span className="text-sm font-black text-white">{new Date(voucher.expiry_date).toLocaleDateString('bg-BG')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Addons Section */}
                            {((voucher.addons && voucher.addons.length > 0)) && (
                                <div className="space-y-4">
                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Включени добавки</span>
                                    <div className="flex flex-wrap gap-2.5">
                                        {voucher.addons?.map((addon, idx) => (
                                            <div key={idx} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight ${theme.bgFaded} ${theme.text} border-2 ${theme.borderFaded} w-fit flex items-center gap-2`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${theme.bg} shadow-sm shadow-black`} />
                                                {addon}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 3: QR & Actions */}
                    <div className="flex flex-col h-full lg:items-end w-full lg:ml-auto">
                        {/* QR Code Section */}
                        <div className="w-full lg:w-fit space-y-6">
                            <h4 className={`font-black text-xl text-white uppercase tracking-tight lg:text-right w-full`}>
                                Валидация
                            </h4>

                            <div className={`relative rounded-[2rem] border-2 ${theme.borderFaded} bg-black/40 backdrop-blur-sm p-6 overflow-hidden shadow-2xl shadow-black/40 w-fit lg:ml-auto flex flex-col items-center gap-4`}>
                                <div className="bg-white p-4 rounded-3xl shadow-2xl">
                                    {qrDataUrl ? (
                                        <img src={qrDataUrl} alt="Voucher QR Code" className="w-40 h-40 md:w-52 md:h-52" />
                                    ) : (
                                        <div className="w-40 h-40 md:w-52 md:h-52 bg-slate-100 rounded-2xl animate-pulse" />
                                    )}
                                </div>

                                <div
                                    onClick={handleCopyId}
                                    className=" group flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-black/50 border border-white/5 cursor-pointer hover:bg-black transition-all active:scale-95"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-0.5">ID на ваучер</span>
                                        <span className="text-[10px] text-slate-300 font-mono tracking-wider">
                                            {voucher.id.slice(0, 13).toUpperCase()}...
                                        </span>
                                    </div>
                                    <div className={`p-1.5 rounded-lg ${copied ? 'bg-green-500/10' : 'bg-white/5 group-hover:bg-white/10'} transition-colors`}>
                                        {copied ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <Copy className="h-3 w-3 text-slate-500 group-hover:text-white transition-colors" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Download Section - PUSHED TO BOTTOM */}
                        <div className="mt-8 pt-8 w-full flex flex-col gap-3 lg:items-end border-t border-white/5 lg:border-none">
                            <Button
                                variant="default"
                                asChild
                                className={`w-full h-14 ${theme.bg} text-black hover:${theme.bg} font-black uppercase text-xs tracking-widest gap-2 relative group overflow-hidden shadow-xl`}
                            >
                                <a href={`/api/vouchers/download/${voucher.id}`} download>
                                    <Download className="h-4 w-4" />
                                    Свали PDF
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-black/5"></div>
                                </a>
                            </Button>

                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1 text-center lg:text-right">
                                За принтиране, препоръчваме A5.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
