import { Card, CardContent } from "@/components/ui/card"
import { Clock, Gauge, Disc, Car } from "lucide-react"
import { getThemeClasses, type ThemeColor } from "./types"
import type { ExperienceProduct } from "@/types/payload-types"

interface ExperienceStatsGridProps {
    experience: ExperienceProduct
}

export function ExperienceStatsGrid({ experience }: ExperienceStatsGridProps) {
    const themeColor = (experience.visuals?.themeColor || 'main') as ThemeColor
    const theme = getThemeClasses(themeColor)

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* Duration */}
            <Card className="bg-slate-900 border-slate-800 shadow-lg aspect-square items-center justify-center">
                <CardContent className="flex flex-col items-center justify-center text-center ">
                    <Clock className={`w-8 h-8 ${theme.text} mb-2`} />
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Време</span>
                    <span className="text-base md:text-lg font-bold text-nowrap text-white">{experience.duration || '60 мин'}</span>
                </CardContent>
            </Card>

            {/* Car Model */}
            <Card className="bg-slate-900 border-slate-800 shadow-lg aspect-square items-center justify-center">
                <CardContent className="flex flex-col items-center justify-center text-center ">
                    <Car className={`w-8 h-8 ${theme.text} mb-2`} />
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Автомобил</span>
                    <span className="text-base md:text-lg font-bold text-white text-nowrap">{experience.techSpecs?.carModel || 'BMW E46'}</span>
                </CardContent>
            </Card>

            {/* Horsepower */}
            <Card className="bg-slate-900 border-slate-800 shadow-lg aspect-square items-center justify-center ">
                <CardContent className=" flex flex-col items-center justify-center text-center ">
                    <Gauge className={`w-8 h-8 ${theme.text} mb-2`} />
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Мощност</span>
                    <span className="text-base md:text-lg font-bold text-white">{experience.techSpecs?.horsePower || 400} HP</span>
                </CardContent>
            </Card>

            {/* Tires */}
            <Card className="bg-slate-900 border-slate-800 shadow-lg aspect-square items-center justify-center">
                <CardContent className="flex flex-col items-center justify-center text-center ">
                    <Disc className={`w-8 h-8 ${theme.text} mb-2 animate-spin-slow`} />
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Гуми</span>
                    <span className="text-base md:text-lg font-bold text-white">{experience.techSpecs?.tiresBurned || '4'}</span>
                </CardContent>
            </Card>
        </div>
    )
}
