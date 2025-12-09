"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, Flame } from "lucide-react";

const STEPS = [
    {
        icon: Search,
        title: "Избери Преживяване",
        description: "Разгледай нашите дрифт пакети и избери перфектния за теб",
        step: "01"
    },
    {
        icon: Calendar,
        title: "Резервирай Дата",
        description: "Запази своята сесия в удобна за теб дата и час",
        step: "02"
    },
    {
        icon: Flame,
        title: "Усети Адреналина",
        description: "Появи се на пистата и изживей незабравими моменти",
        step: "03"
    }
];

export function HowItWorks() {
    return (
        <section className="py-24 px-4 relative overflow-hidden bg-slate-950">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-4">
                            Как Работи <span className="text-main">Резервацията?</span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Три лесни стъпки те делят от най-лудото преживяване
                        </p>
                    </motion.div>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connection Lines (Desktop Only) */}
                    <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-main/30 to-transparent z-0" />

                    {STEPS.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.2 }}
                            className="relative z-10"
                        >
                            <Card className="bg-slate-900 border-slate-800 hover:border-main/50 transition-all h-full group">
                                <CardContent className="p-8 text-center">
                                    {/* Step Number */}
                                    <div className="absolute top-4 right-4 text-6xl font-black text-slate-800 group-hover:text-main/20 transition-colors">
                                        {step.step}
                                    </div>

                                    {/* Icon */}
                                    <div className="bg-main/10 border-2 border-main/30 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:border-main transition-all">
                                        <step.icon className="w-10 h-10 text-main" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-white mb-3 uppercase italic tracking-tight">
                                        {step.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-slate-400 leading-relaxed">
                                        {step.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
