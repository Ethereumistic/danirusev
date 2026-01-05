import { Skeleton } from "@/components/ui/skeleton"
import { Ticket } from "lucide-react"

export default function Loading() {
    return (
        <div className="bg-slate-950 min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-5xl">
                {/* Static Header Section */}
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

                {/* Dynamic Content Skeletons */}
                <div className="flex flex-col gap-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="relative rounded-[2rem] overflow-hidden border-2 border-slate-800 bg-slate-950/90 p-6 md:p-8 lg:p-10">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
                                {/* Column 1 */}
                                <div className="space-y-6">
                                    <Skeleton className="h-8 w-48 bg-slate-800" />
                                    <Skeleton className="w-full aspect-video lg:aspect-square rounded-[2rem] bg-slate-900" />
                                    <div className="space-y-4">
                                        <Skeleton className="h-16 w-full rounded-2xl bg-slate-900" />
                                        <Skeleton className="h-16 w-full rounded-2xl bg-slate-900" />
                                    </div>
                                </div>
                                {/* Column 2 */}
                                <div className="space-y-8 lg:pt-14">
                                    <div className="space-y-4">
                                        <Skeleton className="h-7 w-40 bg-slate-800" />
                                        <Skeleton className="h-4 w-32 bg-slate-900" />
                                        <Skeleton className="h-16 w-full rounded-xl bg-slate-900" />
                                    </div>
                                    <div className="space-y-4">
                                        <Skeleton className="h-4 w-32 bg-slate-900" />
                                        <div className="flex flex-wrap gap-2.5">
                                            <Skeleton className="h-8 w-24 rounded-xl bg-slate-900" />
                                            <Skeleton className="h-8 w-28 rounded-xl bg-slate-900" />
                                        </div>
                                    </div>
                                </div>
                                {/* Column 3 */}
                                <div className="flex flex-col h-full lg:items-end w-full lg:ml-auto space-y-6">
                                    <Skeleton className="h-7 w-32 bg-slate-800 ml-auto md:ml-0 lg:ml-auto" />
                                    <Skeleton className="h-64 w-full md:w-64 rounded-[2rem] bg-slate-900 ml-auto md:ml-0 lg:ml-auto" />
                                    <Skeleton className="h-14 w-full rounded-xl bg-slate-800 mt-auto" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
