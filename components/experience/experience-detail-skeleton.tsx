import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function ExperienceGallerySkeleton() {
    return (
        <div className="space-y-3">
            <div className="relative w-full">
                <Skeleton className="w-full aspect-square rounded-xl bg-slate-800" />
            </div>
            <div className="grid grid-cols-4 gap-2">
                <Skeleton className="w-full aspect-square rounded-lg bg-slate-800" />
                <Skeleton className="w-full aspect-square rounded-lg bg-slate-800" />
                <Skeleton className="w-full aspect-square rounded-lg bg-slate-800" />
                <Skeleton className="w-full aspect-square rounded-lg bg-slate-800" />
            </div>
        </div>
    )
}

export function ExperienceStatsGridSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-slate-900 border-slate-800 shadow-lg aspect-square items-center justify-center">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <Skeleton className="w-8 h-8 rounded bg-slate-800 mb-2" />
                        <Skeleton className="h-3 w-12 bg-slate-800 mb-1" />
                        <Skeleton className="h-5 w-16 bg-slate-800" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function ExperienceQuoteSkeleton() {
    return (
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-2xl border-2 border-slate-800 overflow-hidden">
            <div className="relative z-10 space-y-3">
                <Skeleton className="h-7 w-full bg-slate-800" />
                <Skeleton className="h-7 w-5/6 bg-slate-800" />
                <Skeleton className="h-7 w-4/6 bg-slate-800" />
                <Skeleton className="mt-4 h-1 w-20 rounded-full bg-slate-800" />
            </div>
        </div>
    )
}

export function ExperienceTabsSkeleton() {
    return (
        <div className="relative">
            <div className="sticky top-16 z-30 backdrop-blur-md rounded-lg border-b border-transparent mb-6 transition-all duration-300">
                <div className="inline-flex items-center justify-start bg-slate-900/30 p-1 rounded-lg border border-slate-800 w-full">
                    <Skeleton className="flex-1 h-9 rounded-md bg-slate-800 mx-1" />
                    <Skeleton className="flex-1 h-9 rounded-md bg-slate-800 mx-1" />
                    <Skeleton className="flex-1 h-9 rounded-md bg-slate-800 mx-1" />
                </div>
            </div>
            <div className="space-y-12 pb-8">
                <div className="scroll-mt-40">
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="w-2 h-8 rounded-full bg-slate-800" />
                        <Skeleton className="h-6 w-32 bg-slate-800" />
                    </div>
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <Skeleton className="w-4 h-4 rounded-full bg-slate-800" />
                                    {i < 3 && <Skeleton className="w-0.5 h-12 bg-slate-800" />}
                                </div>
                                <div className="flex-1 pb-4">
                                    <Skeleton className="h-5 w-3/4 bg-slate-800 mb-2" />
                                    <Skeleton className="h-4 w-1/2 bg-slate-800" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="scroll-mt-40 border-t border-slate-800 pt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="w-2 h-8 rounded-full bg-slate-800" />
                        <Skeleton className="h-6 w-40 bg-slate-800" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
                            <Skeleton className="h-5 w-24 bg-slate-800 mb-2" />
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Skeleton className="w-4 h-4 rounded bg-slate-800" />
                                    <Skeleton className="h-4 w-32 bg-slate-800" />
                                </div>
                            ))}
                        </div>
                        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
                            <Skeleton className="h-5 w-28 bg-slate-800 mb-2" />
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Skeleton className="w-4 h-4 rounded bg-slate-800" />
                                    <Skeleton className="h-4 w-36 bg-slate-800" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="scroll-mt-40 border-t border-slate-800 pt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="w-2 h-8 rounded-full bg-slate-800" />
                        <Skeleton className="h-6 w-44 bg-slate-800" />
                    </div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-slate-800 bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-lg bg-slate-800" />
                                    <Skeleton className="h-5 w-28 bg-slate-800" />
                                </div>
                                <Skeleton className="h-5 w-16 bg-slate-800" />
                            </div>
                        ))}
                        <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
                            <Skeleton className="h-5 w-24 bg-slate-800 mb-3" />
                            <Skeleton className="h-12 w-full bg-slate-800 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function ExperienceBookingSkeleton() {
    return (
        <div className="mt-4">
            <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl overflow-hidden relative">
                <div className="pt-6 pb-4 border-b border-slate-800 bg-slate-950/50 relative">
                    <div className="px-6 space-y-3">
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-4 w-20 bg-slate-800" />
                            <Skeleton className="h-4 w-24 bg-slate-800" />
                        </div>
                        <Skeleton className="h-7 w-48 bg-slate-800" />
                        <Skeleton className="h-4 w-32 bg-slate-800" />
                    </div>
                </div>
                <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-20 bg-slate-800" />
                            <Skeleton className="h-8 w-24 bg-slate-800" />
                        </div>
                        <Skeleton className="h-6 w-16 bg-slate-800 rounded" />
                    </div>
                    <Skeleton className="h-px w-full bg-slate-800" />
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-28 bg-slate-800" />
                        <Skeleton className="h-9 w-20 bg-slate-800" />
                    </div>
                    <Skeleton className="h-px w-full bg-slate-800" />
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-24 bg-slate-800" />
                            <Skeleton className="h-10 w-32 bg-slate-800" />
                        </div>
                        <Skeleton className="h-4 w-16 bg-slate-800 ml-auto" />
                    </div>
                    <Skeleton className="h-14 w-full rounded-lg bg-slate-800" />
                    <div className="p-5 rounded-xl border-2 border-slate-800 bg-slate-900 space-y-4">
                        <div className="flex items-center gap-2 justify-center">
                            <Skeleton className="w-5 h-5 rounded bg-slate-800" />
                            <Skeleton className="h-4 w-32 bg-slate-800" />
                        </div>
                        <Skeleton className="h-5 w-full bg-slate-800" />
                        <Skeleton className="h-4 w-40 bg-slate-800 mx-auto" />
                        <Skeleton className="h-10 w-36 bg-slate-800 rounded-xl mx-auto" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export function ExperienceDetailSkeleton() {
    return (
        <div className="min-h-screen bg-slate-950 pb-12 pt-4 md:pt-8">
            <div className="max-w-7xl mx-auto px-4 mb-6">
                <Skeleton className="h-10 w-48 bg-slate-800 rounded-md" />
            </div>
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="w-16 h-16 rounded-2xl bg-slate-800" />
                    <Skeleton className="h-12 w-64 md:w-80 lg:w-96 bg-slate-800" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                    <div className="lg:col-span-5 space-y-2 lg:sticky lg:top-17.5 lg:self-start">
                        <ExperienceGallerySkeleton />
                        <ExperienceStatsGridSkeleton />
                    </div>
                    <div className="lg:col-span-5 space-y-4">
                        <ExperienceQuoteSkeleton />
                        <ExperienceTabsSkeleton />
                        <ExperienceBookingSkeleton />
                    </div>
                </div>
            </div>
        </div>
    )
}
