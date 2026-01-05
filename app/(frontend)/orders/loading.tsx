import { Skeleton } from "@/components/ui/skeleton"
import { Package } from "lucide-react"

export default function Loading() {
    return (
        <div className="bg-slate-950 py-8 px-4 min-h-screen">
            <div className="container mx-auto max-w-4xl">
                {/* Static Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-main/10 rounded-xl">
                        <Package className="h-8 w-8 text-main" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase">Моите поръчки</h1>
                        <p className="text-slate-400 text-sm">Следете статуса на вашите поръчки и покупки</p>
                    </div>
                </div>

                {/* Dynamic Content Skeletons */}
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-slate-900 border-2 border-slate-800 rounded-xl overflow-hidden p-5 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-[200px]">
                                <Skeleton className="h-11 w-11 rounded-xl bg-slate-800" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32 bg-slate-800" />
                                    <Skeleton className="h-4 w-24 bg-slate-900" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-6 w-20 rounded-full bg-slate-800" />
                                <div className="space-y-1 text-right">
                                    <Skeleton className="h-7 w-16 bg-slate-800" />
                                    <Skeleton className="h-3 w-8 bg-slate-900 ml-auto" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
