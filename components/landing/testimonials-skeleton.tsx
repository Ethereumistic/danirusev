import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function TestimonialsSkeleton() {
    return (
        <section className="py-24 px-4 bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-main/5 to-transparent" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Skeleton */}
                <div className="text-center mb-16">
                    <Skeleton className="h-12 w-2/3 md:w-1/2 mx-auto mb-4 bg-slate-800" />
                    <Skeleton className="h-6 w-1/2 md:w-1/3 mx-auto bg-slate-800" />
                </div>

                {/* Carousel Items Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="bg-slate-900/50 backdrop-blur-md border-slate-800 h-64">
                            <CardContent className="px-6 py-6 flex flex-col h-full">
                                <div className="flex items-start gap-4 mb-4">
                                    <Skeleton className="size-20 rounded-full bg-slate-800" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-6 w-3/4 bg-slate-800" />
                                        <Skeleton className="h-4 w-1/2 bg-slate-800" />
                                    </div>
                                </div>
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Skeleton key={s} className="size-4 bg-slate-800" />
                                    ))}
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-full bg-slate-800" />
                                    <Skeleton className="h-4 w-5/6 bg-slate-800" />
                                    <Skeleton className="h-4 w-4/5 bg-slate-800" />
                                </div>
                                <Skeleton className="h-3 w-1/4 mt-4 bg-slate-800" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
