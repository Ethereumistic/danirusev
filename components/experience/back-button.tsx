'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

export function BackButton() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleBack = () => {
        startTransition(() => {
            router.back()
        })
    }

    return (
        <Button
            variant="ghost"
            onClick={handleBack}
            disabled={isPending}
            className={`text-slate-400 hover:text-white group transition-opacity ${isPending ? 'opacity-70 cursor-wait' : ''}`}
        >
            {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            )}
            Назад към преживявания
        </Button>
    )
}
