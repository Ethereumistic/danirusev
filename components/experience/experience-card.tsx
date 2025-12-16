'use client'

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, ArrowUpRight, Gauge, CarTaxiFront, Car } from "lucide-react"
import { getThemeClasses, getImageUrl, type ThemeColor } from "./types"
import type { ExperienceProduct } from "@/types/payload-types"

interface ExperienceCardProps {
    experience: ExperienceProduct
    index?: number
    linkPrefix?: string
}

// Helper function to get the correct icon component
function getIconComponent(iconName?: 'CarTaxiFront' | 'Car' | 'Gauge') {
    const iconMap = {
        CarTaxiFront: CarTaxiFront,
        Car: Car,
        Gauge: Gauge,
    }
    return iconMap[iconName || 'Car']
}

export function ExperienceCard({
    experience,
    index = 0,
    linkPrefix = "/experience",
}: ExperienceCardProps) {
    const themeColor = (experience.visuals?.themeColor || 'main') as ThemeColor
    const IconComponent = getIconComponent(experience.visuals?.iconName)
    const theme = getThemeClasses(themeColor)

    // Get first image from gallery
    const firstImage = experience.gallery?.[0]
    const imageUrl = firstImage ? getImageUrl(firstImage) : '/placeholder-drift.jpg'

    // Get locations for rotating display
    const locations = experience.locations || []
    const [currentLocationIndex, setCurrentLocationIndex] = React.useState(0)

    // Rotate locations every 5 seconds
    React.useEffect(() => {
        if (locations.length <= 1) return

        const interval = setInterval(() => {
            setCurrentLocationIndex((prev) => (prev + 1) % locations.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [locations.length])

    const currentLocation = locations[currentLocationIndex]?.city || 'Трявна'

    // Border style with hover effect
    const borderStyleClass =
        themeColor === 'taxi' ? 'border-solid hover:border-dashed' :
            themeColor === 'rent' ? 'border-solid hover:border-double' :
                themeColor === 'mix' ? 'border-solid hover:border-dotted' :
                    'border-solid'

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
        >
            <Link href={`${linkPrefix}/${experience.slug}`}>
                <div
                    className={`group relative h-[550px] rounded-2xl overflow-hidden border hover:border-3 bg-slate-900 transition-all duration-300 hover:scale-[1.01] ${borderStyleClass} ${theme.border}`}
                >
                    {/* Price Badge */}
                    <div className={`absolute top-4 right-4 z-30 bg-slate-950/90 backdrop-blur-md border border-slate-700/50 ${theme.text} ${theme.shadow} font-black text-xl px-4 py-2 rounded-lg`}>
                        {experience.price} BGN
                    </div>

                    {/* Image Background */}
                    <div className="absolute inset-0 w-full h-full z-0">
                        <Image
                            src={imageUrl}
                            alt={experience.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-950/90 to-transparent opacity-90 z-10" />
                        {/* Theme color tint on hover */}
                        <div className={`absolute inset-0 ${theme.bgFaded} opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay`} />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                        {/* Icon */}
                        <div className="mb-4 transform transition-transform duration-500 group-hover:-translate-y-2">
                            <div className={`inline-flex p-3 bg-slate-900 rounded-xl border-2 ${theme.border}`}>
                                <IconComponent className={`w-8 h-8 ${theme.text}`} />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-2 mb-4 transform transition-transform duration-500 group-hover:-translate-y-2">
                            <p className={`font-bold tracking-widest uppercase text-sm ${theme.text}`}>
                                {experience.subtitle || ''}
                            </p>
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">
                                {experience.title}
                            </h3>
                            <p className="text-slate-300 text-sm line-clamp-2">
                                {experience.description || ''}
                            </p>
                        </div>

                        {/* Quick Specs with rotating location */}
                        <div className="flex items-center gap-4 mb-6 text-slate-300 text-sm transform transition-transform duration-500 group-hover:-translate-y-2">
                            <div className="flex items-center gap-1.5">
                                <Clock className={`w-4 h-4 ${theme.text}`} />
                                <span>{experience.duration || '60 мин'}</span>
                            </div>
                            <div className="w-1 h-1 bg-slate-700 rounded-full" />
                            <div className="flex items-center gap-1.5 min-w-[80px]">
                                <MapPin className={`w-4 h-4 ${theme.text}`} />
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={currentLocation}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {currentLocation}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                            <div className="w-1 h-1 bg-slate-700 rounded-full" />
                            <div className="flex items-center gap-1.5">
                                <Gauge className={`w-4 h-4 ${theme.text}`} />
                                <span>{experience.techSpecs?.horsePower || 400} HP</span>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <Button
                            className={`w-full font-extrabold uppercase tracking-wider h-14 text-lg rounded-xl group relative overflow-hidden transition-all ${theme.bg} ${theme.hover} text-black`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Виж Повече <ArrowUpRight className="w-5 h-5" />
                            </span>
                        </Button>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
