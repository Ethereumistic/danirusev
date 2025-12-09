"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const TESTIMONIALS = [
    {
        "name": "Елена Сергова",
        "experience": "Дрифт Такси",
        "rating": 5,
        "quote": "Мислех, че в 'Ергенът' има адреналин, но това с Дани беше на съвсем друго ниво! Едновременно страшно и супер вълнуващо. Излязох от колата с треперещи крака и огромна усмивка.",
        "location": "София",
        "avatar": "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/testimonials/elena.png"
    },
    {
        "name": "Боряна Лекова",
        "experience": "Дрифт Такси",
        "rating": 5,
        "quote": "Ако си мислите, че сте живели на ръба... не сте се возили при Дани Русев! Тотален крейзи момент! Препоръчвам на всеки, който иска да се почувства жив (и леко замаян от кеф).",
        "location": "Бухово",
        "avatar": "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/testimonials/boryana.png"
    },
    {
        "name": "Ренета Георгиева",
        "experience": "Дрифт Такси",
        "rating": 5,
        "quote": "ОМГ! Това беше брутално! Сузи ще ме убие, че пробвах без нея, но си заслужаваше всеки писък. Дани кара така, че гримът ми едва оцеля, но емоцията е 10/10!",
        "location": "Бухово",
        "avatar": "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/testimonials/reneta.png"
    },
    {
        "name": "Рада Копрева",
        "experience": "Дрифт Микс",
        "rating": 5,
        "quote": "Винаги търся нови преживявания и естетика, но тук намерих чист екшън. Дани е супер търпелив инструктор, дори когато се опитвах аз да въртя волана. Уникален вайб!",
        "location": "Бухово",
        "avatar": "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/testimonials/rada.png"
    },
    {
        "name": "Милена Джоргова",
        "experience": "Дрифт Такси",
        "rating": 5,
        "quote": "Най-якото стори за Инстаграм се получи в колата на Дани! Не вярвах, че кола може да се движи по този начин настрани и да е толкова контролирано. Must try experience!",
        "location": "Бухово",
        "avatar": "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/testimonials/milena.png"
    },
    {
        "name": "Жанета Осипова",
        "experience": "Дрифт Такси",
        "rating": 5,
        "quote": "Почувствах се като във филм! Дани е истински кавалер, дори когато гумите пушат и летим по завоите. Имаше много емоция, малко страх и страшно много класа в шофирането му.",
        "location": "Бухово",
        "avatar": "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/testimonials/janeta.png"
    },
    {
        "name": "Ивка Бейбе",
        "experience": "Дрифт Такси",
        "rating": 5,
        "quote": "Скандално добро! Дани, ти си топ! Вдигна ми адреналина повече от най-горещия и неудобен въпрос в подкаста ми. Хора, ако не сте го пробвали, губите много!",
        "location": "София",
        "avatar": "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/testimonials/ivka.png"
    },
    {
        "name": "DJ Mascota",
        "experience": "Дрифт Микс",
        "rating": 5,
        "quote": "Перфектен ритъм в завоите. Както аз миксирам траковете, така Дани миксира предавките и съединителя. Усещането за контрол и флоу е уникално. Голям професионалист!",
        "location": "София",
        "avatar": "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/testimonials/mascota.png"
    },
    {
        "name": "Иван Ванов",
        "experience": "Рент-а-Дрифт",
        "rating": 5,
        "quote": "Дизел бегачка няма, ама на Дани бегачките вървят на смърт! Евала на момчето, колите са подготвени брутално. Който разбира от мотори, ще оцени какво прави Дани.",
        "location": "София",
        "avatar": "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/testimonials/ivan.png"
    },
    {
        "name": "Радо Шишарката",
        "experience": "Дрифт Такси",
        "rating": 5,
        "quote": "Бели птици и куршуми! Голям кеф! Дани е тигър, вози ме като началник. Това момче има талант, който трябва да се види. Поздрави на всички фенове на високите скорости!",
        "location": "София",
        "avatar": "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/testimonials/rado.png"
    },
    {
        "name": "Костадин Щерев",
        "experience": "Дрифт Микс",
        "rating": 5,
        "quote": "Като колега мога само да сваля шапка. Техниката на Дани е безупречна, а колите му за рент са настроени много грамотно. Идеално място за тренировка и за удоволствие.",
        "location": "Писта Сапарева Баня",
        "avatar": "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/testimonials/kostadin.png"
    },
    {
        "name": "Виктория Григорова",
        "experience": "Дрифт Такси",
        "rating": 5,
        "quote": "Мислех, че на Арената е тежко, но при Дани натоварването е друго! Обичам адреналина и тук го получих в максимални дози. За хора със силен характер!",
        "location": "София",
        "avatar": "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/testimonials/victoria.png"
    },
    {
        "name": "Цветемира Коева",
        "experience": "Дрифт Микс",
        "rating": 5,
        "quote": "Вкъщи е мил, ама на пистата не си поплюва! Хаха, щом успя мен да научи да дрифтя (има го в YouTube!), значи може да научи всеки. Гордея се с него, най-добрият е!",
        "location": "Трявна",
        "avatar": "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/testimonials/cura.png"
    }
];

export function TestimonialsCarousel() {
    return (
        <section className="py-24 px-4 bg-slate-950 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-main/5 to-transparent" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-4">
                        Какво Казват <span className="text-main">Клиентите?</span>
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Реални истории от реални дрифт ентусиасти
                    </p>
                </div>

                {/* Carousel */}
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {TESTIMONIALS.map((testimonial, index) => (
                            <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-[30%]">
                                <Card className="bg-slate-900/50 backdrop-blur-md border-slate-800 hover:border-main/30 transition-all h-full">
                                    <CardContent className="px-6 py-6 flex flex-col h-full">
                                        {/* Header with Avatar and Info */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <Avatar className="size-20 border-2 border-main/30">
                                                <AvatarImage
                                                    src={testimonial.avatar}
                                                    alt={testimonial.name}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="bg-slate-800 text-main font-bold">
                                                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-bold text-lg truncate">
                                                    {testimonial.name}
                                                </h3>
                                                <p className="text-slate-400 text-sm truncate">
                                                    {testimonial.experience}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stars */}
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-main text-main" />
                                            ))}
                                        </div>

                                        {/* Quote */}
                                        <blockquote className="text-slate-300 text-sm leading-relaxed flex-1 mb-4">
                                            "{testimonial.quote}"
                                        </blockquote>

                                        {/* Location */}
                                        <p className="text-xs text-slate-500">
                                            {testimonial.location}
                                        </p>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex -left-12 bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-main/50 text-white" />
                    <CarouselNext className="hidden md:flex -right-12 bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-main/50 text-white" />
                </Carousel>
            </div>
        </section>
    );
}
