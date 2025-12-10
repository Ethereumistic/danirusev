"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Gauge, ShieldCheck, Sparkles } from "lucide-react";

export function WhyChooseUs() {
    return (
        <section className="py-24 px-4 relative overflow-hidden bg-slate-950">
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
    );
}
