import { Skeleton } from "@/components/ui/skeleton"

export function WhyChooseUsV2Skeleton() {
    return (
        <section className="relative bg-slate-950 overflow-hidden py-24">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <Skeleton className="h-8 w-48 mx-auto mb-6 bg-slate-800" />
                    <Skeleton className="h-16 w-2/3 mx-auto mb-6 bg-slate-800" />
                    <Skeleton className="h-6 w-1/2 mx-auto bg-slate-800" />
                </div>

                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col lg:flex-row gap-8 lg:gap-16 py-12 items-center">
                        <div className="w-full lg:w-1/2">
                            <Skeleton className="aspect-[4/3] rounded-2xl bg-slate-800" />
                        </div>
                        <div className="w-full lg:w-1/2 space-y-6">
                            <Skeleton className="h-8 w-40 bg-slate-800" />
                            <Skeleton className="h-12 w-3/4 bg-slate-800" />
                            <Skeleton className="h-24 w-full bg-slate-800" />
                            <Skeleton className="h-12 w-48 bg-slate-800" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
