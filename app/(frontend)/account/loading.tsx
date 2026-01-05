import { Skeleton } from "@/components/ui/skeleton"
import { UserCircle, Package, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Loading() {
    return (
        <div className="bg-slate-950 py-8 px-4 min-h-screen">
            <div className="mx-auto max-w-5xl relative z-10">
                {/* Static Header */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <div className="p-4 rounded-2xl bg-main/10 border-2 border-main/20 shadow-[0_0_20px_rgba(255,107,0,0.1)]">
                        <UserCircle className="h-10 w-10 text-main" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none mb-2">
                            Вашият <span className="text-main">Профил</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                            Управлявайте вашите данни и настройки
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* User Info Sidebar Skeleton */}
                    <div className="lg:col-span-4 h-[400px]">
                        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[2rem] h-full flex flex-col items-center relative overflow-hidden">
                            <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-800 mb-4" />
                            <Skeleton className="h-6 w-32 bg-slate-800 mb-2" />
                            <Skeleton className="h-3 w-24 bg-slate-900 mb-8" />

                            <div className="w-full space-y-6">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-11 w-11 rounded-xl bg-slate-800" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-2 w-16 bg-slate-900" />
                                        <Skeleton className="h-4 w-32 bg-slate-800" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-11 w-11 rounded-xl bg-slate-800" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-2 w-16 bg-slate-900" />
                                        <Skeleton className="h-4 w-24 bg-slate-800" />
                                    </div>
                                </div>
                            </div>

                            {/* Static Buttons at the bottom of sidebar */}
                            <Button variant="main" className=" bg-main absolute bottom-8 left-8 " asChild>
                                <Link href="/orders" className="flex items-center text-black gap-2"><Package className="h-4 w-4 " />Поръчки</Link>
                            </Button>
                            <Button variant="main" className="bg-main absolute bottom-8 right-8 " asChild>
                                <Link href="/vouchers" className="flex items-center text-black gap-2"><Ticket className="h-4 w-4" />Ваучери</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Shipping Info Form Skeleton */}
                    <div className="lg:col-span-8 h-[600px]">
                        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] h-full">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Информация за доставка</h2>
                            <p className="text-sm text-slate-500 font-medium mb-8">Тези данни се използват за вашите поръчки и доставка на физически продукти.</p>

                            <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-6">
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Skeleton className="h-3 w-24 bg-slate-900" />
                                    <Skeleton className="h-12 w-full rounded-xl bg-slate-800" />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Skeleton className="h-3 w-24 bg-slate-900" />
                                    <Skeleton className="h-12 w-full rounded-xl bg-slate-800" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Skeleton className="h-3 w-24 bg-slate-900" />
                                    <Skeleton className="h-12 w-full rounded-xl bg-slate-800" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 col-span-2 gap-x-4 md:gap-x-8 gap-y-6">
                                    <div className="space-y-2 col-span-1">
                                        <Skeleton className="h-3 w-16 bg-slate-900" />
                                        <Skeleton className="h-12 w-full rounded-xl bg-slate-800" />
                                    </div>
                                    <div className="space-y-2 col-span-1">
                                        <Skeleton className="h-3 w-16 bg-slate-900" />
                                        <Skeleton className="h-12 w-full rounded-xl bg-slate-800" />
                                    </div>
                                    <div className="space-y-2 col-span-2 lg:col-span-1">
                                        <Skeleton className="h-3 w-16 bg-slate-900" />
                                        <Skeleton className="h-12 w-full rounded-xl bg-slate-800" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-white/5 flex justify-end">
                                <Skeleton className="h-12 w-48 bg-slate-800 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
