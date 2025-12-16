'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { getThemeClasses, type ThemeColor } from "./types"

interface ExperienceIncludedProps {
    included: Array<{ item: string; id?: string }>
    notIncluded: Array<{ item: string; id?: string }>
    themeColor?: ThemeColor
}

export function ExperienceIncluded({
    included,
    notIncluded,
    themeColor = 'main'
}: ExperienceIncludedProps) {
    const theme = getThemeClasses(themeColor)

    return (
        <div className="grid md:grid-cols-2 gap-4">
            {/* Included */}
            {included && included.length > 0 && (
                <Card className="border-slate-800 bg-slate-900/50 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <CheckCircle2 className={`h-6 w-6 ${theme.text}`} />
                            Цената включва
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {included.map((item, idx) => (
                                <div
                                    key={item.id || idx}
                                    className="flex items-start gap-3 text-sm text-slate-300"
                                >
                                    <CheckCircle2 className={`h-4 w-4 ${theme.text} mt-0.5 shrink-0`} />
                                    <span>{item.item}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Not Included - RED ICONS */}
            {notIncluded && notIncluded.length > 0 && (
                <Card className="border-slate-800 bg-slate-900/50 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <XCircle className="h-6 w-6 text-red-500" />
                            Цената не включва
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {notIncluded.map((item, idx) => (
                                <div
                                    key={item.id || idx}
                                    className="flex items-start gap-3 text-sm text-slate-300"
                                >
                                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>{item.item}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
