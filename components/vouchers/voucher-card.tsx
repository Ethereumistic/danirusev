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
    Check,
    Video,
    Disc,
    Smartphone,
    Package
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
    'drift-day': 'Дрифт Ден',
}

const statusConfig: Record<string, { label: string; icon: any }> = {
    'active': { label: 'Активен', icon: CheckCircle },
    'pending': { label: 'Използван', icon: Clock },
    'expired': { label: 'Изтекъл', icon: AlertCircle },
}

// Icon mapping for addons (matching dash/columns.tsx)
const addonIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'GoPro Заснемане': Video,
    'Допълнителни Гуми': Disc,
    'Ваучер Дигитален': Smartphone,
    'Ваучер Физически': Gift,
    '30 мин': Clock,
    '60 мин': Clock,
    '90 мин': Clock,
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
        <div
            id={`voucher-${voucher.id}`}
            className={`relative rounded-[2rem] overflow-hidden border-2 ${theme.borderFaded} ${theme.shadow} transition-all w-full`}
        >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} pointer-events-none`} />

            {/* Left accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${theme.bg}`} />

            <div className="relative bg-slate-950/90 p-6 md:p-8 lg:p-10 ml-2">
                {/* Main Content Grid - Refactored to 2 columns for symmetry */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

                    {/* Column 1: Title, Image, Recipient, Dates & Addons */}
                    <div className="flex flex-col h-full space-y-6">
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                            {title}
                        </h2>

                        {/* Image with absolute badges */}
                        <div className={`relative w-full aspect-square rounded-2xl md:rounded-[2rem] overflow-hidden border-4 ${theme.border} ${theme.borderStyle} ${theme.shadow} bg-slate-900 ring-1 ring-white/5`}>
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

                        {/* Info Section: Recipient & Dates */}
                        <div className="space-y-4">
                            {voucher.voucher_recipient_name && (
                                <div className={`p-4 rounded-2xl border-2 ${theme.borderFaded} ${theme.bgFaded}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${theme.bgFaded} ${theme.text}`}>
                                            <Gift className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">Получател:</span>
                                            <span className={`font-black tracking-tight uppercase ${theme.text} leading-tight`}>
                                                {voucher.voucher_recipient_name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Selected Date - Matches Status styling with Theme Color */}
                            <div className={`p-4 rounded-2xl border-2 border-main/30 bg-main/5`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg bg-main/15 text-main`}>
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">Дата на преживяване:</span>
                                        <span className={`font-black uppercase tracking-tight leading-none text-main`}>
                                            {new Date(voucher.selected_date).toLocaleDateString('bg-BG', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Expiry Date - Matches Status styling with Event (Red) Color */}
                            <div className="p-4 rounded-2xl border-2 border-event/30 bg-event/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg bg-event/20 text-event">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">Валиден до:</span>
                                        <span className="font-black uppercase tracking-tight leading-none text-event">
                                            {new Date(voucher.expiry_date).toLocaleDateString('bg-BG', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Addons Section */}
                            {((voucher.addons && voucher.addons.length > 0)) && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {voucher.addons?.map((addon, idx) => {
                                        const AddonIcon = addonIcons[addon] || Package
                                        return (
                                            <Badge
                                                key={idx}
                                                className={`bg-slate-900 hover:bg-slate-800 text-[9px] font-black text-slate-300 border-2 ${theme.borderFaded} px-2.5 py-1.5 gap-2 rounded-xl h-auto shrink-0 shadow-lg`}
                                            >
                                                <AddonIcon className={`h-3 w-3 ${theme.text}`} />
                                                {addon}
                                            </Badge>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 2: QR, ID & Status / Download */}
                    <div className="flex flex-col h-full space-y-6">
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none lg:text-right">
                            Валидация
                        </h2>

                        <div className={`relative w-full aspect-square rounded-2xl md:rounded-[2rem] overflow-hidden border-4 ${theme.border} ${theme.borderStyle} ${theme.shadow} bg-white ring-1 ring-white/5 flex items-center justify-center p-2`}>
                            {qrDataUrl ? (
                                <img src={qrDataUrl} alt="Voucher QR Code" className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 rounded-2xl animate-pulse" />
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* Voucher ID Copy - Styled to match dates/recipient */}
                            <div
                                onClick={handleCopyId}
                                className={`p-4 rounded-2xl border-2 ${theme.borderFaded} ${theme.bgFaded} cursor-pointer hover:bg-white/5 transition-colors group w-full`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${theme.bgFaded} ${theme.text}`}>
                                        {copied ? (
                                            <Check className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <Copy className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">ID на ваучер:</span>
                                        <span className={`font-black tracking-tight uppercase ${theme.text} leading-tight font-mono `}>
                                            {voucher.id.slice(0, 12).toUpperCase()}...
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Section - Moved here */}
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

                            {/* Download Action Section */}
                            <Button
                                variant="default"
                                asChild
                                className={`w-full h-16 rounded-2xl ${theme.bg} text-black hover:${theme.bg} font-black uppercase text-xs tracking-widest gap-2 relative group overflow-hidden shadow-xl`}
                            >
                                <a href={`/api/vouchers/download/${voucher.id}`} download>
                                    <Download className="h-4 w-4" />
                                    Свали PDF
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-black/5"></div>
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
