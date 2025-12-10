"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Clock,
    MapPin,
    ArrowUpRight,
    Gauge,
    CarTaxiFront,
    Car,
} from "lucide-react";
import { DriftExperience } from "@/lib/drift-data";
import { getBorderColor, getTextColor, getBgColor, getBorderStyle } from "@/lib/utils";

// Helper function to get the correct icon component
function getIconComponent(iconName: 'CarTaxiFront' | 'Car' | 'Gauge') {
    const iconMap = {
        CarTaxiFront: CarTaxiFront,
        Car: Car,
        Gauge: Gauge,
    };
    return iconMap[iconName];
}

interface ExperienceCardProps {
    experience: DriftExperience;
    index?: number;
}

export function ExperienceCard({
    experience,
    index = 0,
}: ExperienceCardProps) {
    const IconComponent = getIconComponent(experience.iconName);

    const themeColorClass =
        experience.themeColor === 'taxi' ? 'text-taxi border-taxi/60 shadow-[0_0_40px_-10px_rgba(234,179,8,0.4)]' :
            experience.themeColor === 'rent' ? 'text-rent border-rent/60 shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)]' :
                experience.themeColor === 'mix' ? 'text-mix border-mix/60 shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]' :
                    'text-main border-main/60 shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]';

    // Border style with hover effect - solid by default, special style on hover
    const borderStyleClass =
        experience.themeColor === 'taxi' ? 'border-solid hover:border-dashed' :
            experience.themeColor === 'rent' ? 'border-solid hover:border-double' :
                experience.themeColor === 'mix' ? 'border-solid hover:border-dotted' :
                    'border-solid';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
        >
            <Link href={`/xp/${experience.slug}`}>
                <div
                    className={`group relative h-[550px] rounded-2xl overflow-hidden border hover:border-3 bg-slate-900 transition-all duration-300 hover:scale-[1.01] ${borderStyleClass} ${getBorderColor(experience.themeColor)}`}
                >

                    {/* Price Badge */}
                    <div className={`absolute top-4 right-4 z-30 bg-slate-950/90 backdrop-blur-md border border-slate-700/50 ${themeColorClass} font-black text-xl px-4 py-2 rounded-lg`}>
                        {experience.price} {experience.currency}
                    </div>

                    {/* Image Background */}
                    <div className="absolute inset-0 w-full h-full z-0">
                        <Image
                            src={experience.images[0]}
                            alt={experience.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-950/90 to-transparent opacity-90 z-10" />
                        {/* Theme color tint on hover */}
                        <div className={`absolute inset-0 bg-${experience.themeColor}/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay`} />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                        {/* Icon */}
                        <div className="mb-4 transform transition-transform duration-500 group-hover:-translate-y-2">
                            <div className={`inline-flex p-3 bg-slate-900 rounded-xl border-2 ${getBorderColor(experience.themeColor)}`}>
                                <IconComponent className={`w-8 h-8 ${getTextColor(experience.themeColor)}`} />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-2 mb-4 transform transition-transform duration-500 group-hover:-translate-y-2">
                            <p className={`font-bold tracking-widest uppercase text-sm ${getTextColor(experience.themeColor)}`}>
                                {experience.subtitle}
                            </p>
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">
                                {experience.title}
                            </h3>
                            <p className="text-slate-300 text-sm line-clamp-2">
                                {experience.description}
                            </p>
                        </div>

                        {/* Quick Specs */}
                        <div className="flex items-center gap-4 mb-6 text-slate-300 text-sm transform transition-transform duration-500 group-hover:-translate-y-2">
                            <div className="flex items-center gap-1.5">
                                <Clock className={`w-4 h-4 ${getTextColor(experience.themeColor)}`} />
                                <span>{experience.duration}</span>
                            </div>
                            <div className="w-1 h-1 bg-slate-700 rounded-full" />
                            <div className="flex items-center gap-1.5">
                                <MapPin className={`w-4 h-4 ${getTextColor(experience.themeColor)}`} />
                                <span>Трявна</span>
                            </div>
                            <div className="w-1 h-1 bg-slate-700 rounded-full" />
                            <div className="flex items-center gap-1.5">
                                <Gauge className={`w-4 h-4 ${getTextColor(experience.themeColor)}`} />
                                <span>{experience.horsePower} HP</span>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <Button
                            className={`w-full font-extrabold uppercase tracking-wider h-14 text-lg rounded-xl group relative overflow-hidden transition-all ${getBgColor(experience.themeColor)} ${experience.themeColor === 'taxi' ? 'hover:bg-taxi/90' : experience.themeColor === 'rent' ? 'hover:bg-rent/90' : experience.themeColor === 'mix' ? 'hover:bg-mix/90' : 'hover:bg-emerald-400'} text-black`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Виж Повече <ArrowUpRight className="w-5 h-5" />
                            </span>
                        </Button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
