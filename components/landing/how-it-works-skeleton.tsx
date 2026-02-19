import { Skeleton } from "@/components/ui/skeleton"

export function HowItWorksSkeleton() {
    return (
        <section className="py-24 px-4 bg-slate-950">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <Skeleton className="h-14 w-2/3 mx-auto mb-4 bg-slate-800" />
                    <Skeleton className="h-6 w-1/2 mx-auto bg-slate-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-8">
                            <Skeleton className="h-20 w-20 rounded-2xl mx-auto mb-6 bg-slate-800" />
                            <Skeleton className="h-8 w-3/4 mx-auto mb-3 bg-slate-800" />
                            <Skeleton className="h-16 w-full bg-slate-800" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
