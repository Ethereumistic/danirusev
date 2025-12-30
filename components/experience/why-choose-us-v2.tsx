"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { Flame, Shield, Video, ChevronRight, Zap, Users, Award } from "lucide-react";
import Image from "next/image";

interface FeatureBlock {
    id: string;
    tagline: string;
    title: string;
    titleAccent: string;
    description: string;
    stats: { value: string; label: string }[];
    images: string[];
    icon: React.ElementType;
    reversed?: boolean;
}

const FEATURES: FeatureBlock[] = [
    {
        id: "power",
        tagline: "Сила и Контрол",
        title: "Машини Създадени",
        titleAccent: "За Дрифт",
        description: "Нашият автомобил е участвал в множество състезания и мероприятия. Всеки детайл е настроен за перфектния дрифт — подготвен от професионални механици",
        stats: [
            { value: "400+", label: "к.с. мощност" },
            { value: "100%", label: "дрифт готови" },
        ],
        // TODO: Replace with actual car images when provided
        images: [
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/rent/1.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/rent/2.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/rent/3.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/rent/4.png",
        ],
        icon: Zap,
    },
    {
        id: "safety",
        tagline: "Безкомпромисна Сигурност",
        title: "Безопасност",
        titleAccent: "На Първо Място",
        description: "Всички изисквания за безопастност за подобен тип дейност са покрити - 4 точкови колани, седалки тип корито, пожарогасители на достъпни места в колата. Трасета, специално подбрани както за новобранци, така и за опитни рейсъри. Карай до лимита си знаейки, че всичко е под контрол.",
        stats: [
            { value: "0", label: "инцидента" },
            { value: "1:1", label: "инструктор" },
        ],
        images: [
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/mix/1.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/mix/2.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/mix/3.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/mix/4.png",
        ],
        icon: Shield,
        reversed: true,
    },
    {
        id: "memories",
        tagline: "Твоят Момент, Завинаги",
        title: "Незабравими",
        titleAccent: "Спомени",
        description: "Създаваме спомени, които се помнят цял живот. Можете да добавите към преживяването си GoPro кадри от автомобила, както и професионално монтирано видео перфектно за соц. мрежи или просто за да го гледаш отново и отново!",
        stats: [
            { value: "4K", label: "видео качество" },
            { value: "∞", label: "спомени" },
        ],
        images: [
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/reni.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/milena.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/janeta.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/elena.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/ivka.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/rado.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/mascota.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/dizel.png",
        ],
        icon: Video,
    },
];

function FeatureCarousel({ images, title }: { images: string[]; title: string }) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) return;

        setCurrent(api.selectedScrollSnap());
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    return (
        <div className="relative">
            <Carousel
                setApi={setApi}
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent>
                    {images.map((image, idx) => (
                        <CarouselItem key={idx}>
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                                <Image
                                    src={image}
                                    alt={`${title} - ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-4 bg-slate-900/80 hover:bg-slate-800 border-slate-700 hover:border-main/50 text-white" />
                <CarouselNext className="right-4 bg-slate-900/80 hover:bg-slate-800 border-slate-700 hover:border-main/50 text-white" />
            </Carousel>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-4">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => api?.scrollTo(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === current
                            ? "bg-main w-6"
                            : "bg-slate-600 hover:bg-slate-500"
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

function FeatureSection({ feature, index }: { feature: FeatureBlock; index: number }) {
    const Icon = feature.icon;

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div
                className={`relative flex flex-col ${feature.reversed ? "lg:flex-row-reverse" : "lg:flex-row"
                    } gap-8 lg:gap-16 py-16 lg:py-24 items-center`}
            >
                {/* Carousel Side */}
                <motion.div
                    initial={{ opacity: 0, x: feature.reversed ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full lg:w-1/2"
                >
                    <FeatureCarousel images={feature.images} title={feature.title} />

                    {/* Floating stat cards */}
                    {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className={`absolute -bottom-6 ${feature.reversed ? "right-4 lg:right-8" : "left-4 lg:left-8"
                            } flex gap-3 z-10`}
                    >
                        {feature.stats.map((stat, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl px-4 py-2.5 shadow-xl"
                            >
                                <div className="text-2xl font-black text-main">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-slate-400 uppercase tracking-wide">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div> */}
                </motion.div>

                {/* Content Side */}
                <motion.div
                    initial={{ opacity: 0, x: feature.reversed ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative w-full lg:w-1/2 mt-8 lg:mt-0"
                >
                    {/* Large background number */}
                    <div
                        className={`absolute ${feature.reversed ? "right-0" : "left-0"
                            } top-0 text-[12rem] font-black text-slate-900/30 pointer-events-none hidden lg:block leading-none -translate-y-12`}
                    >
                        0{index + 1}
                    </div>

                    <div className="relative z-10">
                        {/* Tagline Badge */}
                        <div className="inline-flex items-center gap-2 bg-main/10 border border-main/30 px-4 py-1.5 rounded-full mb-6">
                            <Icon className="w-4 h-4 text-main" />
                            <span className="text-main text-sm font-bold uppercase tracking-wider">
                                {feature.tagline}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter italic leading-none mb-6">
                            {feature.title}
                            <br />
                            <span className="text-main">{feature.titleAccent}</span>
                        </h3>

                        {/* Description */}
                        <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
                            {feature.description}
                        </p>

                        {/* CTA */}
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-main/50 text-main hover:text-main/80  font-bold uppercase tracking-wide group"
                            onClick={() => {
                                document
                                    .getElementById("drift-experiences")
                                    ?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            Виж Преживяванията
                            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Divider between sections (except last) */}
            {index < FEATURES.length - 1 && (
                <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
            )}
        </div>
    );
}

export function WhyChooseUsV2() {
    return (
        <section className="relative bg-slate-950 overflow-hidden">
            {/* Section Header */}
            <div className="relative z-10 pt-24 pb-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 bg-main/10 border border-main/30 px-6 py-2 rounded-full mb-6"
                    >
                        <Award className="w-4 h-4 text-main" />
                        <span className="text-main font-bold uppercase tracking-wider text-sm">
                            Защо Точно Ние
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter italic mb-6"
                    >
                        Не Просто <span className="text-main">Преживяване</span>
                        <br />
                        Цяло Дрифт Събитие
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-slate-400 max-w-3xl mx-auto"
                    >
                        Три неща, които ни правят различни от всички останали
                    </motion.p>

                    {/* Trust indicators */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-8 mt-12"
                    >
                        {[
                            { icon: Users, text: "500+ доволни клиента" },
                            { icon: Award, text: "Проф. инструктор" },
                            { icon: Flame, text: "Гарантиран адреналин" },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 text-slate-400"
                            >
                                <item.icon className="w-5 h-5 text-main" />
                                <span className="text-sm font-medium">{item.text}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Feature Blocks */}
            <div className="relative">
                {FEATURES.map((feature, index) => (
                    <FeatureSection key={feature.id} feature={feature} index={index} />
                ))}
            </div>

            {/* Bottom CTA */}
            {/* <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative z-10 py-24 px-4"
            >
                <div className="max-w-4xl mx-auto text-center">
                    <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-6">
                        Готов ли си да усетиш <span className="text-main">разликата</span>?
                    </h3>
                    <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                        Не чакай повече. Избери своето преживяване и стани част от
                        дрифт общността.
                    </p>
                    <Button
                        size="lg"
                        className="bg-main hover:bg-main/90 text-black font-extrabold uppercase tracking-wider h-16 px-12 text-lg rounded-xl group relative overflow-hidden shadow-[0_0_40px_-10px_rgba(16,185,129,0.6)]"
                        onClick={() => {
                            document
                                .getElementById("drift-experiences")
                                ?.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Избери Преживяване
                            <Flame className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </span>
                    </Button>
                </div>
            </motion.div> */}
        </section>
    );
}
