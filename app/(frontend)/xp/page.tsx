"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Flame,
    Trophy,
    Star,
    Gauge,
    ShieldCheck,
    Video,
    Timer,
    Sparkles,
} from "lucide-react";

// Data
import { DRIFT_EXPERIENCES } from "@/lib/drift-data";

// Components
import { ExperiencesSection } from "@/components/drift/experiences-section";

export default function DriftExperiencesPage() {
    return (
        <main className="min-h-screen bg-slate-950">
            {/* HERO SECTION - Full viewport height with aggressive CTA */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background Video/Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/hero/12.png"
                        alt="Drift Experience Hero"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950" />

                    {/* Animated accent overlay */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-tr from-main/20 via-transparent to-taxi/10 mix-blend-overlay"
                        animate={{
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
                    {/* Pre-title badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-6 inline-flex items-center gap-2 bg-main/10 border border-main/30 px-6 py-2 rounded-full backdrop-blur-md"
                    >
                        <Flame className="w-4 h-4 text-main" />
                        <span className="text-main font-bold uppercase tracking-wider text-sm">
                            Оригинални Дрифт Преживявания
                        </span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter italic mb-6 leading-none"
                    >
                        Усети<br />
                        <span className="text-main">
                            Истинския
                        </span>
                        <br />
                        Адреналин
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
                    >
                        Професионални дрифт сесии с <span className="text-main font-bold">Дани Русев</span> —
                        твоят път към майсторството на занеса.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                    >
                        <Button
                            size="lg"
                            className="bg-main hover:bg-emerald-400 text-black font-extrabold uppercase tracking-wider h-16 px-10 text-lg rounded-xl group relative overflow-hidden shadow-[0_0_40px_-10px_rgba(16,185,129,0.6)]"
                            onClick={() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Избери Преживяване
                                <Flame className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </span>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-slate-700 hover:border-main bg-slate-950/50 hover:bg-slate-900 text-white font-bold uppercase tracking-wider h-16 px-10 text-lg rounded-xl backdrop-blur-md"
                        >
                            <Video className="mr-2 w-5 h-5" />
                            Виж Видео
                        </Button>
                    </motion.div>

                    {/* Social Proof Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
                    >
                        {[
                            { icon: Trophy, value: "500+", label: "Доволни Клиенти" },
                            { icon: Timer, value: "1000+", label: "Дрифт Сесии" },
                            { icon: Star, value: "5.0", label: "Рейтинг" },
                            { icon: ShieldCheck, value: "100%", label: "Безопасност" },
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-4">
                                <stat.icon className="w-6 h-6 text-main mb-2 mx-auto" />
                                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-400 uppercase tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 border-2 border-main/50 rounded-full flex items-start justify-center p-2">
                        <div className="w-1.5 h-2 bg-main rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* WHY CHOOSE US SECTION */}
            <section className="py-24 px-4 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-4">
                            Защо Точно <span className="text-main">Ние?</span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Не просто преживяване — цяло дрифт събитие създадено за теб
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Gauge,
                                title: "Професионална Подготовка",
                                description: "Подготвени автомобили специално за дрифт с над 400 к.с. мощност"
                            },
                            {
                                icon: ShieldCheck,
                                title: "100% Безопасност",
                                description: "Обезопасено трасе, професионална екипировка и опитен инструктор"
                            },
                            {
                                icon: Sparkles,
                                title: "Незабравими Спомени",
                                description: "GoPro заснемане от всеки ъгъл - вземи си видеото за спомен"
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                            >
                                <Card className="bg-slate-900 border-slate-800 hover:border-main/50 transition-all h-full group">
                                    <CardContent className="p-8">
                                        <div className="bg-main/10 border border-main/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <feature.icon className="w-8 h-8 text-main" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                                        <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* EXPERIENCES SECTION */}
            <ExperiencesSection />

            {/* FINAL CTA SECTION */}
            <section className="py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-main/10 via-transparent to-taxi/10" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-6">
                            Готов за<br />
                            <span className="text-main">Дрифт?</span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                            Не чакай повече. Запази своята сесия сега и усети какво е истинската мощ на дрифта.
                        </p>
                        <Button
                            size="lg"
                            className="bg-main hover:bg-emerald-400 text-black font-extrabold uppercase tracking-wider h-16 px-12 text-lg rounded-xl shadow-[0_0_60px_-10px_rgba(16,185,129,0.6)] group"
                            onClick={() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Избери Преживяване
                                <Flame className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </span>
                        </Button>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}