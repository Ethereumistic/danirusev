import { Clock, MapPin } from "lucide-react";
import type { DriftExperience } from "@/lib/drift-data";
import { getBgColor, getTextColor } from "@/lib/utils";

interface DriftProgramProps {
    program: { time: string; activity: string; description: string }[];
    themeColor: DriftExperience['themeColor'];
}

export function DriftProgram({ program, themeColor }: DriftProgramProps) {
    const dotColorClass = `group-hover:${getBgColor(themeColor)}`;
    const iconColorClass = getTextColor(themeColor);
    const bgColorClass = `${getBgColor(themeColor)}/10`;

    return (
        <div className="space-y-6">
            <div className="relative border-l border-slate-800 ml-3 space-y-8 py-2">
                {program.map((item, index) => (
                    <div key={index} className="relative pl-8 group">
                        {/* Dot */}
                        <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-600 ${dotColorClass} transition-colors ring-4 ring-slate-950`} />

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full w-fit border border-slate-700">
                                <Clock className={`w-3 h-3 ${iconColorClass}`} />
                                <span className="text-xs font-mono text-white font-bold">{item.time}</span>
                            </div>
                            <h4 className="text-lg font-bold text-white">{item.activity}</h4>
                        </div>

                        <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Location Section */}
            <div className={`mt-6 p-4 rounded-xl bg-slate-900 border-2 border-slate-800 ${bgColorClass}`}>
                <div className="flex items-start gap-3">
                    <div className="bg-slate-800 p-2 rounded-lg">
                        <MapPin className={`h-5 w-5 ${iconColorClass}`} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white mb-1">Локация</h4>
                        <p className="text-xs text-slate-400">
                            Писта Трявна - обезопасено трасе в близост до град Трявна
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}