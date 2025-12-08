import { Card, CardContent } from "@/components/ui/card";
import { Clock, Gauge, Disc, Car } from "lucide-react";
import type { DriftExperience } from "@/lib/drift-data";

export function DriftStatsGrid({ experience }: { experience: DriftExperience }) {
    const iconColorClass =
        experience.themeColor === 'taxi' ? 'text-taxi' :
            experience.themeColor === 'rent' ? 'text-rent' :
                experience.themeColor === 'mix' ? 'text-mix' :
                    'text-main';

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sq">
            {/* Duration */}
            <Card className="bg-slate-900 border-slate-800 shadow-lg aspect-square items-center justify-center">
                <CardContent className="flex flex-col items-center justify-center text-center ">
                    <Clock className={`w-8 h-8 ${iconColorClass} mb-2`} />
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Време</span>
                    <span className="text-base md:text-lg font-bold text-white">{experience.duration}</span>
                </CardContent>
            </Card>

            {/* Car Model */}
            <Card className="bg-slate-900 border-slate-800 shadow-lg aspect-square items-center justify-center">
                <CardContent className="flex flex-col items-center justify-center text-center ">
                    <Car className={`w-8 h-8 ${iconColorClass} mb-2`} />
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Автомобил</span>
                    <span className="text-base md:text-lg font-bold text-white text-nowrap">{experience.carModel}</span>
                </CardContent>
            </Card>

            {/* Horsepower */}
            <Card className="bg-slate-900 border-slate-800 shadow-lg aspect-square items-center justify-center ">
                <CardContent className=" flex flex-col items-center justify-center text-center ">
                    <Gauge className={`w-8 h-8 ${iconColorClass} mb-2`} />
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Мощност</span>
                    <span className="text-base md:text-lg font-bold text-white">{experience.horsePower} HP</span>
                </CardContent>
            </Card>

            {/* Tires */}
            <Card className="bg-slate-900 border-slate-800 shadow-lg aspect-square items-center justify-center">
                <CardContent className="flex flex-col items-center justify-center text-center ">
                    <Disc className={`w-8 h-8 ${iconColorClass} mb-2 animate-spin-slow`} />
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Гуми</span>
                    <span className="text-base md:text-lg font-bold text-white">~ {experience.tires} бр.</span>
                </CardContent>
            </Card>
        </div>
    );
}
