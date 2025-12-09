"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flame, Gift, Clock } from "lucide-react";

export function UrgencyCTA() {
    return (
        <section className="py-24 px-4 relative overflow-hidden bg-slate-950">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-main/10 via-transparent to-taxi/10" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />

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
                        <Gift className="w-4 h-4 text-main" />
                        <span className="text-main font-bold uppercase tracking-wider text-sm">
                            Ограничена Оферта
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-tight">
                        Резервирай Тази Седмица -<br />
                        <span className="text-main">Получи Безплатно Видео!</span>
                    </h2>

                    {/* Description */}
                    <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        GoPro заснемане от всички ъгли на стойност <span className="text-main font-bold">150 лв</span> - напълно безплатно при резервация тази седмица
                    </p>

                    {/* Urgency Indicators */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-400">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-main" />
                            <span className="font-medium">Офертата важи до неделя</span>
                        </div>
                        <div className="hidden sm:block w-1 h-1 bg-slate-700 rounded-full" />
                        <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-main" />
                            <span className="font-medium">Само 3 свободни места останаха</span>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4">
                        <Button
                            size="lg"
                            className="bg-main hover:bg-emerald-400 text-black font-extrabold uppercase tracking-wider h-16 px-12 text-lg rounded-xl shadow-[0_0_60px_-10px_rgba(16,185,129,0.6)] group transition-all hover:scale-105"
                            onClick={() => {
                                // Scroll to experiences section
                                document.getElementById('drift-experiences')?.scrollIntoView({
                                    behavior: 'smooth'
                                });
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Резервирай Сега
                                <Flame className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </span>
                        </Button>
                    </div>

                    {/* Trust Badge */}
                    <p className="text-sm text-slate-500 pt-4">
                        * Видеото се предоставя в рамките на 48 часа след сесията
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
