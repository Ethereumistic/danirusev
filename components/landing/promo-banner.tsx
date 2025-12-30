"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PromoBanner as PromoBannerType } from "@/types/payload-types";

// Dynamic icon component
function DynamicIcon({
    name,
    className
}: {
    name: string;
    className?: string
}) {
    // Type-safe lookup for Lucide icons
    const icons = LucideIcons as unknown as Record<string, LucideIcon>;
    const IconComponent = icons[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in lucide-react`);
        return null;
    }

    return <IconComponent className={className} />;
}

// Check if banner should be visible based on dates
function isBannerVisible(banner: PromoBannerType): boolean {
    if (!banner.isActive) return false;

    const now = new Date();

    // Check start date
    if (banner.startDate) {
        const startDate = new Date(banner.startDate);
        if (now < startDate) return false;
    }

    // Check expiry date
    if (banner.expiryDate) {
        const expiryDate = new Date(banner.expiryDate);
        if (now > expiryDate) return false;
    }

    return true;
}

interface PromoBannerProps {
    banner: PromoBannerType;
}

export function PromoBanner({ banner }: PromoBannerProps) {
    // Don't render if banner is not visible
    if (!isBannerVisible(banner)) {
        return null;
    }

    return (
        <section className="py-24 px-4 relative overflow-hidden bg-slate-950">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-main/10 to-transparent" />

            <div className="max-w-5xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-main/10 border border-main/30 px-6 py-2 rounded-full backdrop-blur-md">
                        <DynamicIcon name={banner.badgeIcon} className="w-4 h-4 text-main" />
                        <span className="text-main font-bold uppercase tracking-wider text-sm">
                            {banner.badgeText}
                        </span>
                    </div>

                    {/* Main Headline - Title Segments */}
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-tight">
                        {banner.titleSegments.map((segment, index) => (
                            <span
                                key={segment.id || index}
                                className={segment.color === 'main' ? 'text-main' : 'text-white'}
                            >
                                {segment.text}
                            </span>
                        ))}
                    </h2>

                    {/* Description - Subtitle Segments */}
                    <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        {banner.subtitleSegments.map((segment, index) => (
                            <span
                                key={segment.id || index}
                                className={segment.strikethrough ? 'text-main line-through font-bold' : ''}
                            >
                                {segment.text}
                            </span>
                        ))}
                    </p>

                    {/* Key Points / Urgency Indicators */}
                    {banner.keyPoints && banner.keyPoints.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-400">
                            {banner.keyPoints.map((keyPoint, index) => (
                                <React.Fragment key={keyPoint.id || index}>
                                    <div className="flex items-center gap-2">
                                        <DynamicIcon name={keyPoint.icon} className="w-5 h-5 text-main" />
                                        <span className="font-medium">{keyPoint.text}</span>
                                    </div>
                                    {/* Separator dot between items (not after last) */}
                                    {index < banner.keyPoints!.length - 1 && (
                                        <div className="hidden sm:block w-1 h-1 bg-slate-700 rounded-full" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* CTA Button */}
                    <div className="pt-4">
                        <Button
                            size="lg"
                            className="bg-main hover:bg-main/90 text-black font-extrabold uppercase tracking-wider h-16 px-12 text-lg rounded-xl shadow-[0_0_60px_-10px_rgba(16,185,129,0.6)] group transition-all hover:scale-105"
                            onClick={() => {
                                // Scroll to experiences section
                                document.getElementById('drift-experiences')?.scrollIntoView({
                                    behavior: 'smooth'
                                });
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {banner.ctaButtonText}
                                {banner.ctaButtonIcon && (
                                    <DynamicIcon
                                        name={banner.ctaButtonIcon}
                                        className="w-5 h-5 group-hover:rotate-12 transition-transform"
                                    />
                                )}
                            </span>
                        </Button>
                    </div>

                    {/* Note / Trust Badge */}
                    {banner.noteText && (
                        <p className="text-sm text-slate-500 pt-4">
                            {banner.noteText}
                        </p>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
