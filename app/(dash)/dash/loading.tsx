import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-main" />
                <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] animate-pulse">
                    Зареждане на таблото...
                </p>
            </div>
        </div>
    )
}
