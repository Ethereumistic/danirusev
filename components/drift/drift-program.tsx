import { Clock } from "lucide-react";
import type { DriftExperience } from "@/lib/drift-data";

interface DriftProgramProps {
    program: { time: string; activity: string; description: string }[];
    themeColor: DriftExperience['themeColor'];
}

export function DriftProgram({ program, themeColor }: DriftProgramProps) {
    const dotColorClass =
        themeColor === 'taxi' ? 'group-hover:bg-taxi' :
            themeColor === 'rent' ? 'group-hover:bg-rent' :
                themeColor === 'mix' ? 'group-hover:bg-mix' :
                    'group-hover:bg-main';

    const iconColorClass =
        themeColor === 'taxi' ? 'text-taxi' :
            themeColor === 'rent' ? 'text-rent' :
                themeColor === 'mix' ? 'text-mix' :
                    'text-main';

    return (
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
    );
}