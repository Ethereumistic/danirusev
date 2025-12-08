"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, ArrowUpRight } from "lucide-react";

// Image URLs - Paste your individual image URLs here
const images = [
    "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/2.png", // Drift Taxi
    "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/6.png", // Rent a Drift Car
    "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/5.png", // Drift MIX
];

const experiences = [
    {
        id: 1,
        title: "Дрифт Такси",
        subtitle: "Пасажерско Изживяване",
        price: "325 лв",
        duration: "1 час",
        location: "Трявна",
        isPopular: false,
    },
    {
        id: 2,
        title: "Наеми Дрифтачка",
        subtitle: "Карай Сам",
        price: "649 лв",
        duration: "60 мин",
        location: "Трявна",
        isPopular: true,
    },
    {
        id: 3,
        title: "Дрифт МИКС",
        subtitle: "Най-доброто от двата свята",
        price: "589 лв",
        duration: "40 мин",
        location: "Трявна",
        isPopular: false,
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

export default function DriftExperiences() {
    return (
        <section className="min-h-screen bg-slate-950 py-24 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-left mb-12">
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">
                        ИЗБЕРИ СВОЯ <span className="text-main text-transparent bg-clip-text bg-gradient-to-r from-main to-emerald-500">АДРЕНАЛИН</span>
                    </h2>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    {experiences.map((exp) => (
                        <motion.div key={exp.id} variants={cardVariants} className="h-full">
                            {/* Main Card Container */}
                            <div
                                className={`group relative h-[500px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 transition-all duration-500 hover:border-main/60 ${exp.isPopular ? "ring-2 ring-main ring-offset-2 ring-offset-slate-950 shadow-[0_0_40px_-10px_rgba(var(--main),0.4)]" : ""
                                    }`}
                            >
                                {/* Popular Badge */}
                                {exp.isPopular && (
                                    <Badge className="absolute top-4 left-4 z-30 bg-main text-black hover:bg-main font-bold uppercase tracking-wider rounded-md">
                                        Най-Търсен
                                    </Badge>
                                )}

                                {/* Price Badge - Top Right */}
                                <div className="absolute top-4 right-4 z-30 bg-slate-950/80 backdrop-blur-md border border-slate-700/50 text-main font-black text-xl px-4 py-2 rounded-lg">
                                    {exp.price}
                                </div>

                                {/* Image Background with Zoom effect */}
                                <div className="absolute inset-0 w-full h-full z-0">
                                    <Image
                                        src={images[exp.id - 1]}
                                        alt={exp.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Aggressive Gradient Overlay to ensure text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-950/90 to-transparent opacity-90 z-10" />
                                    {/* Green tint on hover */}
                                    <div className="absolute inset-0 bg-main/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay" />
                                </div>

                                {/* Content Overlay - Positioned at bottom */}
                                <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                                    <div className="space-y-2 mb-4 transform transition-transform duration-500 group-hover:-translate-y-2">
                                        <p className="text-main font-bold tracking-widest uppercase text-sm">
                                            {exp.subtitle}
                                        </p>
                                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">
                                            {exp.title}
                                        </h3>
                                    </div>

                                    {/* Quick Specs */}
                                    <div className="flex items-center gap-4 mb-6 text-slate-300 text-sm transform transition-transform duration-500 group-hover:-translate-y-2">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-main" />
                                            <span>{exp.duration}</span>
                                        </div>
                                        <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-main" />
                                            <span>{exp.location}</span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full bg-main text-black font-extrabold uppercase tracking-wider h-14 text-lg rounded-xl group relative overflow-hidden transition-all hover:bg-white hover:text-black"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            Виж повече <ArrowUpRight className="w-5 h-5" />
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}