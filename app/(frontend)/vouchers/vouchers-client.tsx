'use client'

import { Ticket, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { VoucherCard, type Voucher } from '@/components/vouchers/voucher-card'
import { motion } from 'framer-motion'

interface VouchersClientProps {
    vouchers: Voucher[]
}

export function VouchersClient({ vouchers }: VouchersClientProps) {
    return (
        <div className="bg-slate-950 min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-main/10 rounded-2xl border-2 border-main/20 shadow-[0_0_20px_rgba(255,107,0,0.1)]">
                            <Ticket className="h-10 w-10 text-main" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                                Моите Ваучери
                            </h1>
                            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em] mt-2">
                                Управлявайте вашите дрифт преживявания
                            </p>
                        </div>
                    </div>
                </div>

                {vouchers.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-900/30 backdrop-blur-sm">
                        <div className="relative inline-block mb-6">
                            <Ticket className="h-20 w-20 text-slate-800 mx-auto" />
                            <div className="absolute -top-2 -right-2 bg-main w-6 h-6 rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Нямате налични ваучери</h2>
                        <p className="text-slate-500 mb-10 max-w-md mx-auto font-medium">
                            Когато закупите преживяване и датата бъде потвърдена, вашите уникални ваучери ще се генерират тук веднага!
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Button asChild className="bg-main hover:bg-main/90 text-black font-black px-10 h-14 rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-main/20">
                                <Link href="/#drift-experiences">Разгледай към преживявания</Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {vouchers.map((voucher) => (
                            <VoucherCard
                                key={voucher.id}
                                voucher={voucher}
                            />
                        ))}
                    </div>
                )}


            </div>
            {/* Information Footer */}
            {vouchers.length > 0 && (
                <section className="relative w-full py-24 px-4 overflow-hidden mt-8 ">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-main/5 to-transparent" />

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto text-center relative z-10"
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-6">
                            Имате въпроси за <span className="text-main">Ваучера</span>?
                        </h2>
                        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                            Не чакайте повече. Свържете се с нас днес и ние ще Ви съдействаме с Вашия ваучер или резервация!
                        </p>

                        {/* Quick contact buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <a
                                href="tel:+359882726020"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-main hover:bg-main/90 text-black font-black uppercase tracking-widest h-16 px-10 text-sm rounded-2xl shadow-[0_0_40px_-10px_rgba(255,107,0,0.4)] transition-all hover:scale-105 active:scale-95"
                            >
                                <Phone className="w-5 h-5 fill-current" />
                                Обади се сега
                            </a>
                            <a
                                href="mailto:contact@danirusev.com"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 border-2 border-main/30 text-main hover:text-white hover:bg-main/10 font-black uppercase tracking-widest h-16 px-10 text-sm rounded-2xl transition-all hover:border-main active:scale-95"
                            >
                                <Mail className="w-5 h-5" />
                                Изпрати имейл
                            </a>
                        </div>
                    </motion.div>
                </section>
            )}
        </div>
    )
}
