"use client"
import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { Trophy, Clapperboard, Flame, Car, ChevronRight, Star, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

// --- FIXED VARIANTS ---

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

// Hero images constant
const HERO_IMAGES = [
    "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/hero/12.png",
    "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/hero/13.png",
    "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/hero/14.png",
    "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/hero/15.png",
    "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/hero/16.png",
    "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/hero/17.png"
];

// Carousel images constant
const CAROUSEL_IMAGES = [
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/reni.png",
        alt: "Reni"
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/milena.png",
        alt: "Milena"
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/elena.png",
        alt: "Elena"
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/janeta.png",
        alt: "Janeta"
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/rado.png",
        alt: "Rado"
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/mascota.png",
        alt: "Mascota"
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/dizel.png",
        alt: "Dizel"
    },
    {
        url: "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/bd/ivka.png",
        alt: "Ivka"
    }
];

export default function AboutPage() {
    const [currentSlide, setCurrentSlide] = React.useState(0);
    const [currentHeroSlide, setCurrentHeroSlide] = React.useState(0);
    const [api, setApi] = React.useState<any>();

    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    React.useEffect(() => {
        if (!api) return;

        api.on("select", () => {
            setCurrentSlide(api.selectedScrollSnap());
        });
    }, [api]);

    // Hero slider auto-play effect
    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroSlide((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans selection:bg-main selection:text-slate-950 -mt-20">

            {/* --- HERO SECTION --- */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                {/* Background Image Slider with Overlay */}
                <div className="absolute inset-0 z-0">
                    {HERO_IMAGES.map((image, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentHeroSlide ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <Image
                                src={image}
                                alt={`Hero background ${index + 1}`}
                                fill
                                className="object-cover opacity-60"
                                priority={index === 0}
                            />
                        </div>
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/60 to-slate-950" />

                    {/* Hero Slider Dots */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {HERO_IMAGES.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentHeroSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all ${currentHeroSlide === index
                                    ? 'bg-main w-8'
                                    : 'bg-white/50 hover:bg-white/80'
                                    }`}
                                aria-label={`Go to hero slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="container relative z-10 px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Badge className="mb-4 text-lg px-4 py-1 uppercase tracking-widest bg-main/80">
                            Dani Rusev Team
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
                            Изкуството на <span className="text-transparent bg-clip-text bg-main">Скоростта</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-light">
                            "Пистата е сцена, на която се раждат емоции и адреналин."
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- BIO SECTION --- */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Text Content */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-6 border-l-4 border-main pl-4">
                                Кои сме ние?
                            </motion.h2>
                            <motion.p variants={fadeInUp} className="text-lg text-slate-400 mb-6 leading-relaxed">
                                Ние сме екипът на <strong className="text-white">Дани Русев</strong> – професионален пилот и каскадьор, участвал в множество чуждестранни филми, реклами и автомобилни продукции. Зад волана той превръща скоростта в изкуство.
                            </motion.p>
                            <motion.p variants={fadeInUp} className="text-lg text-slate-400 mb-8 leading-relaxed">
                                Дани е шампион на България по <span className="text-white">гимкхана</span> и вицешампион по <span className="text-white">рали</span>. Опитът му зад волана и в киното му дава уникална перспектива върху контрола, динамиката и безопасността при екстремно шофиране.
                            </motion.p>

                            {/* Stats Grid */}
                            <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
                                <Card className="bg-slate-900 border-slate-800">
                                    <CardContent className="p-4 flex flex-col items-center text-center">
                                        <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
                                        <span className="font-bold text-white">Шампион</span>
                                        <span className="text-xs text-slate-500 uppercase">Гимкхана България</span>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-900 border-slate-800">
                                    <CardContent className="p-4 flex flex-col items-center text-center">
                                        <Clapperboard className="w-8 h-8 text-green-500 mb-2" />
                                        <span className="font-bold text-white">Каскадьор</span>
                                        <span className="text-xs text-slate-500 uppercase">Кино Продукции</span>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-900 border-slate-800">
                                    <CardContent className="p-4 flex flex-col items-center text-center">
                                        <Youtube className="w-8 h-8 text-red-500 mb-2" />
                                        <span className="font-bold text-white">Инфлуенсър</span>
                                        <span className="text-xs text-slate-500 uppercase">YouTube</span>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>

                        {/* Image Content */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative h-[600px] w-full rounded-xl overflow-hidden shadow-2xl shadow-main/20"
                        >
                            <Image
                                src="https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/dr-team.png"
                                alt="Dani Rusev Pilot Portrait"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent" />
                        </motion.div>

                    </div>
                </div>
            </section>


            {/* --- THE SHOW SECTION (Darker/Different Vibe) --- */}
            <section className="py-24  relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-main/5 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row-reverse gap-12 items-center">

                        <motion.div
                            className="w-full md:w-1/2"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="space-y-4">
                                <Carousel
                                    setApi={setApi}
                                    plugins={[plugin.current]}
                                    className="w-full"
                                    onMouseEnter={plugin.current.stop}
                                    onMouseLeave={plugin.current.reset}
                                >
                                    <CarouselContent>
                                        {CAROUSEL_IMAGES.map((image, index) => (
                                            <CarouselItem key={index}>
                                                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-black">
                                                    <Image
                                                        src={image.url}
                                                        alt={image.alt}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-4" />
                                    <CarouselNext className="right-4" />
                                </Carousel>

                                {/* Dot Indicators */}
                                <div className="flex justify-center gap-2">
                                    {CAROUSEL_IMAGES.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => api?.scrollTo(index)}
                                            className={`w-2 h-2 rounded-full transition-all ${currentSlide === index
                                                ? 'bg-main w-8'
                                                : 'bg-slate-600 hover:bg-slate-500'
                                                }`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="w-full md:w-1/2"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            <motion.div variants={fadeInUp} className="flex items-center space-x-2 mb-4">
                                <Star className="text-yellow-500 w-5 h-5" />
                                <span className="text-main font-bold uppercase tracking-widest text-sm">Drift & Talk</span>
                            </motion.div>

                            <motion.h3 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-6">
                                Скорост, Емоция и <span className="text-main">Откровение</span>
                            </motion.h3>

                            <motion.p variants={fadeInUp} className="text-slate-400 text-lg leading-relaxed mb-6">
                                Освен това, Дани води и специално предаване, в което вози известни личности на пистата, докато им задава неочаквани въпроси – комбинация, каквато няма никъде другаде.
                            </motion.p>

                            <motion.div variants={fadeInUp}>
                                <Button variant="outline" className="border-main text-main hover:bg-main hover:text-white transition-colors">
                                    Гледай Епизодите
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- MISSION / CTA SECTION --- */}
            <section className="py-24 px-4 relative ">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/about/hero/15.png"
                        alt="Track texture"
                        fill
                        className="object-cover opacity-10 grayscale"
                    />
                </div>

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <Flame className="w-12 h-12 text-main mx-auto mb-6" />
                        <h2 className="text-4xl md:text-5xl font-black uppercase mb-6">
                            При нас няма просто шофиране <br />
                            <span className="text-main">има преживяване</span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-10 leading-relaxed">
                            Нашата мисия е да споделим тази страст с теб. Независимо дали искаш да се научиш да дрифтиш като професионалист, или просто да изживееш усещането да бъдеш в колата с шампион.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button size="lg" className="bg-main hover:bg-main/80  font-bold text-lg px-8 py-6">
                                Запиши се за дрифт <ChevronRight className="ml-2 w-5 h-5" />
                            </Button>
                            <Button size="lg" className="bg-white text-slate-900 font-bold text-lg px-8 py-6 hover:bg-slate-200">
                                Купи Ваучер
                            </Button>
                        </div>

                    </motion.div>

                </div>
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-slate-950 to-transparent" />
            </section>

        </div>
    );
}