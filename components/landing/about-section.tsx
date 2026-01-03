"use client"

import React from 'react';
import Image from 'next/image';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Trophy, Clapperboard, Youtube, Star, ChevronRight, Fuel, Timer, Award, PersonStanding, BookHeart, Venus, Disc, Flame, Aperture, Baby, Shield, Car, FireExtinguisher, PartyPopper, Mars, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from 'embla-carousel-autoplay';

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const CAROUSEL_IMAGES = [
    { url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/reni.png", alt: "Reni" },
    { url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/milena.png", alt: "Milena" },
    { url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/elena.png", alt: "Elena" },
    { url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/janeta.png", alt: "Janeta" },
    { url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/rado.png", alt: "Rado" },
    { url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/mascota.png", alt: "Mascota" },
    { url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/dizel.png", alt: "Dizel" },
    { url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/ivka.png", alt: "Ivka" }
];

const BIO_IMAGES = [
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/driver_dr11.png",
        alt: "Дани Русев рали пилот",
        badge: {
            icon: Trophy,
            color: "bg-taxi",
            title: "Шампионски Дух",
            subtitle: "Победа след победа",
            href: ""
        }
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/driver1.jpg",
        alt: "Дани Русев рали пилот",
        badge: {
            icon: Trophy,
            color: "bg-taxi",
            title: "Шампионски Дух",
            subtitle: "Победа след победа",
            href: ""
        }
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/dr-team.png",
        alt: "Екипа на Дани Русев",
        badge: {
            icon: PersonStanding,
            color: "bg-main",
            title: "Екипът на Дани Русев",
            subtitle: "Съвместно усилие",
            href: "",

        }
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/sex.JPG",
        alt: "Дани Русев съпруга",
        badge: {
            icon: BookHeart,
            color: "bg-gradient-to-b from-red-500 via-pink-500 to-purple-500",
            title: "Трудни моменти",
            subtitle: "Плащане в натура",
            href: "https://www.youtube.com/watch?v=jDJcROfinJk",
            target: "_blank"
        }
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/tb/elza.png",
        alt: "Дани Русев и Елза Парини",
        badge: {
            icon: Mars,
            color: "bg-[linear-gradient(to_bottom,#E40303,#FF8C00,#FFED00,#008026,#004DFF,#750787)]",
            title: "Семейни Стойности",
            subtitle: "Подкрепа и любов",
            href: "https://www.youtube.com/watch?v=04c0vfsG1lE",
            target: "_blank"
        }
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/tb/djanti.png",
        alt: "Дани Русев кара по джанти",
        badge: {
            icon: Flame,
            color: "bg-gradient-to-b from-red-500 via-orange-500 to-yellow-500",
            title: "Карам по джанти",
            subtitle: "Живот на ръба",
            href: "https://www.youtube.com/watch?v=phkej7NxEcA",
            target: "_blank"
        }
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/tb/dongfeng.png",
        alt: "Ревю на Донгфенг",
        badge: {
            icon: Aperture,
            color: "bg-red-500",
            title: "Донгфенг",
            subtitle: "Първият пилот",
            href: "https://www.youtube.com/watch?v=GyKVZwEyDf8",
            target: "_blank"
        }
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/tb/bremenna.png",
        alt: "Дани Русев е бременен",
        badge: {
            icon: Baby,
            color: "bg-pink-300",
            title: "Заченаха ме",
            subtitle: "Бременен",
            href: "https://www.youtube.com/watch?v=p2EuG2v37BU",
            target: "_blank"
        }
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/tb/tesla.png",
        alt: "Кара тесла от тавана",
        badge: {
            icon: Shield,
            color: "bg-rent",
            title: "Балкан Тесла",
            subtitle: "Илън Мъск ряпа да яде",
            href: "https://www.youtube.com/watch?v=p2EuG2v37BU",
            target: "_blank"
        }
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/tb/bmw-3000.png",
        alt: "Купих BMW за 3000 лева",
        badge: {
            icon: Car,
            color: "bg-main",
            title: "BMW 3000 кожи",
            subtitle: "голяма грешка",
            href: "https://www.youtube.com/watch?v=p2EuG2v37BU",
            target: "_blank"
        }
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/tb/bmw-fireworks.png",
        alt: "Малки пиромани гърмят заря от BMW",
        badge: {
            icon: PartyPopper,
            color: "bg-gradient-to-b from-indigo-500 via-red-500 to-yellow-500",
            title: "Гърмим заря от BMW",
            subtitle: "Малки пиромани",
            href: "https://www.youtube.com/watch?v=hKlbfe0XrdQ",
            target: "_blank"
        }
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/tb/women.png",
        alt: "Магазин за женски облекла",
        badge: {
            icon: Venus,
            color: "bg-gradient-to-b from-pink-300 via-pink-400 to-pink-700",
            title: "ЖЕНА КАРА КОЛА !!!",
            subtitle: "ПО-РЯДКО ОТ ЕКЗОДИЯ",
            href: "https://www.youtube.com/watch?v=A1ClOjmH8j0",
            target: "_blank"
        }
    },
];

const BadgeContent = ({ badge }: { badge: any }) => (
    <>
        <div className={`w-10 h-10 rounded-full ${badge.color} flex items-center justify-center text-slate-950 shrink-0`}>
            {React.createElement(badge.icon, { className: "w-5 h-5" })}
        </div>
        <div className="pr-2 text-left">
            <div className="text-white font-black uppercase tracking-tight text-xs leading-none mb-1 transition-colors">
                {badge.title}
            </div>
            <div className="text-slate-400 text-[10px] uppercase tracking-widest leading-none">
                {badge.subtitle}
            </div>
        </div>
        {badge.href && (
            <div className="absolute top-2 right-2">
                <ExternalLink className="w-2 h-2 text-main/40 group-hover/badge:text-main transition-colors" />
            </div>
        )}
    </>
);

export function AboutSection() {
    const [api, setApi] = React.useState<any>();
    const [current, setCurrent] = React.useState(0);
    const [bioApi, setBioApi] = React.useState<any>();
    const [bioCurrent, setBioCurrent] = React.useState(0);

    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    );

    const bioPlugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    React.useEffect(() => {
        if (!api) return;
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    React.useEffect(() => {
        if (!bioApi) return;
        bioApi.on("select", () => {
            setBioCurrent(bioApi.selectedScrollSnap());
        });
    }, [bioApi]);

    return (
        <section id="about" className="relative py-24 overflow-hidden bg-slate-950 scroll-mt-12">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-main/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-main/10 rounded-full blur-[120px]" />
            </div>

            <div className="container relative z-10 mx-auto px-4">
                <div className="max-w-6xl mx-auto">

                    {/* Part 1: Hero Bio */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className=""
                        >
                            <motion.div variants={fadeInUp} className="mb-6 px-4">
                                <Badge variant="outline" className="border-main/50 text-main px-4 py-1.5 uppercase tracking-widest text-xs font-bold mb-4">
                                    Историята на Дани Русев
                                </Badge>
                                <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                                    Превръщаме Скоростта <br />
                                    <span className="text-main">
                                        В Изкуство
                                    </span>
                                </motion.h2>
                            </motion.div>
                            <motion.p variants={fadeInUp} className="text-lg text-slate-400 mb-6 leading-relaxed px-4">
                                Дани Русев не е просто пилот. Той е визионер в света на моторните спортове, чиято кариера обхваща шампионски титли,
                                каскадьорски роли в холивудски продукции и създаването на едно от най-влиятелните автомобилни общества в България.
                            </motion.p>
                            <motion.p variants={fadeInUp} className="text-lg text-slate-400 mb-8 leading-relaxed px-4">
                                Като шампион на България по гимкхана и вицешампион по рали, Дани съчетава прецизността на състезателя
                                с атрактивността на шоумена, предлагайки преживяване, което остава в паметта завинаги.
                            </motion.p>

                            <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4 mb-8">
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm group hover:border-main/30 transition-colors">
                                    <Trophy className="w-8 h-8 text-taxi mb-3 group-hover:scale-110 transition-transform" />
                                    <div className="font-bold text-white text-sm uppercase">Шампион</div>
                                    <div className="text-[10px] text-slate-500 uppercase">Гимкхана България</div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm group hover:border-main/30 transition-colors">
                                    <Clapperboard className="w-8 h-8 text-main mb-3 group-hover:scale-110 transition-transform" />
                                    <div className="font-bold text-white text-sm uppercase">Каскадьор</div>
                                    <div className="text-[10px] text-slate-500 uppercase">Кино Продукции</div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm group hover:border-main/30 transition-colors">
                                    <Youtube className="w-8 h-8 text-event mb-3 group-hover:scale-110 transition-transform" />
                                    <div className="font-bold text-white text-sm uppercase">Инфлуенсър</div>
                                    <div className="text-[10px] text-slate-500 uppercase">Ютубер</div>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 40, rotate: 2 }}
                            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-main/20 group/bio">
                                <Carousel
                                    setApi={setBioApi}
                                    plugins={[bioPlugin.current]}
                                    className="w-full"
                                    onMouseEnter={() => bioPlugin.current.stop()}
                                    onMouseLeave={() => bioPlugin.current.reset()}
                                >
                                    <CarouselContent className="ml-0">
                                        {BIO_IMAGES.map((image, index) => (
                                            <CarouselItem key={index} className="pl-0 basis-full relative">
                                                <div className="relative aspect-[4/5] w-full">
                                                    <Image
                                                        src={image.url}
                                                        alt={image.alt}
                                                        fill
                                                        className="object-cover"
                                                        priority={index === 0}
                                                    />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-4 opacity-0 group-hover/bio:opacity-100 transition-opacity bg-slate-900/50 border-white/10 text-white z-20" />
                                    <CarouselNext className="right-4 opacity-0 group-hover/bio:opacity-100 transition-opacity bg-slate-900/50 border-white/10 text-white z-20" />
                                </Carousel>

                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none z-10" />

                                <div className="absolute bottom-6 left-6 right-6 z-20 min-h-[64px] flex items-end">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={bioCurrent}
                                            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                        >
                                            {BIO_IMAGES[bioCurrent].badge.href ? (
                                                <Link
                                                    href={BIO_IMAGES[bioCurrent].badge.href}
                                                    target={BIO_IMAGES[bioCurrent].badge.target || (BIO_IMAGES[bioCurrent].badge.href.startsWith('http') ? '_blank' : '_self')}
                                                    className="inline-flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10 hover:bg-slate-900/60 transition-colors group/badge cursor-pointer relative"
                                                >
                                                    <BadgeContent badge={BIO_IMAGES[bioCurrent].badge} />
                                                </Link>
                                            ) : (
                                                <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10 group/badge select-none relative">
                                                    <BadgeContent badge={BIO_IMAGES[bioCurrent].badge} />
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Progress dots for bio carousel */}
                                <div className="absolute bottom-5 right-5  flex gap-1.5 p-2 rounded-sm border border-white/10 bg-gradient-to-t from-slate-950/5 via-transparent to-transparent backdrop-blur-md z-20">
                                    {BIO_IMAGES.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`size-1.5 rounded-full transition-all duration-300 ${bioCurrent === index ? 'bg-main w-6' : 'bg-white/30'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-main rounded-full mix-blend-overlay blur-3xl opacity-50" />
                        </motion.div>
                    </div>


                </div>
            </div>
        </section>
    );
}
