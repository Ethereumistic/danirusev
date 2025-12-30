import { Clock, MapPin } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { getThemeClasses, type ThemeColor } from "./types"
import type { ProgramItem, ExperienceLocation } from "@/types/payload-types"

interface ExperienceProgramProps {
    program: ProgramItem[]
    locations?: ExperienceLocation[]
    themeColor?: ThemeColor
}

/**
 * Get Lucide icon component by name
 */
function getIconByName(iconName: string) {
    const Icon = (LucideIcons as any)[iconName]
    return Icon || MapPin
}

export function ExperienceProgram({
    program,
    locations = [],
    themeColor = 'main'
}: ExperienceProgramProps) {
    const theme = getThemeClasses(themeColor)

    return (
        <div className="space-y-6">
            {/* Program Timeline */}
            <div className="relative border-l border-slate-800 ml-3 space-y-8 py-2">
                {program.map((item, index) => (
                    <div key={item.id || index} className="relative pl-8 group">
                        {/* Dot */}
                        <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-600 group-hover:${theme.bg} transition-colors ring-4 ring-slate-950`} />

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full w-fit border border-slate-700">
                                {(() => {
                                    // Dynamic icon rendering
                                    // @ts-ignore - icon exists in schema but types need regeneration
                                    const iconName = (item as any).icon
                                    const IconComponent = iconName ? getIconByName(iconName) : Clock
                                    return <IconComponent className={`w-3 h-3 ${theme.text}`} />
                                })()}
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

            {/* Locations Section - All cities in one card separated by slash */}
            {locations.length > 0 && (
                <div className={`p-4 rounded-xl bg-slate-900 border-2 border-slate-800 ${theme.bgFaded}`}>
                    <div className="flex items-start gap-3">
                        <div className="bg-slate-800 p-2 rounded-lg">
                            <MapPin className={`h-5 w-5 ${theme.text}`} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">Локация</h4>
                            <p className="text-xs text-slate-400">
                                {locations.map(loc => loc.city).join(' / ')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Fallback if no locations */}
            {locations.length === 0 && (
                <div className={`p-4 rounded-xl bg-slate-900 border-2 border-slate-800 ${theme.bgFaded}`}>
                    <div className="flex items-start gap-3">
                        <div className="bg-slate-800 p-2 rounded-lg">
                            <MapPin className={`h-5 w-5 ${theme.text}`} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">Локация</h4>
                            <p className="text-xs text-slate-400">
                                Моля, свържете се с нас за информация
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
