'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export default function ContactClient() {
    const contactDetails = [
        {
            icon: Mail,
            label: "Имейл",
            value: "contact@danirusev.com",
            href: "mailto:contact@danirusev.com",
        },
        {
            icon: Phone,
            label: "Телефон",
            value: "+359 88 272 6020",
            href: "tel:+359882726020",
        },
        {
            icon: MapPin,
            label: "Локация",
            value: "Автомобилен Пoлигон, гр. Трявна, България",
            href: "https://maps.app.goo.gl/pPgQekKHASUHBxY59",
        },
    ];

    return (
        <div className="bg-background text-foreground">
            <div className="container mx-auto max-w-6xl px-4 py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-gagalin text-main font-outline tracking-tight sm:text-5xl lg:text-6xl">
                        Свържете се с нас
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground">
                        Имате въпроси или искате да организирате нещо специално? Нашият екип е на Ваше разположение.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Contact Information */}
                    <div className="flex flex-col justify-center space-y-8">
                        <h2 className="text-3xl font-bold">Информация за контакт</h2>
                        <div className="space-y-6">
                            {contactDetails.map((detail) => (
                                <a
                                    key={detail.label}
                                    href={detail.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start p-4 rounded-lg transition-colors group hover:bg-muted/50"
                                >
                                    <div className="flex-shrink-0 bg-main text-alt p-3 rounded-full">
                                        <detail.icon className="h-6 w-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-lg font-semibold text-foreground">{detail.label}</p>
                                        <p className="text-muted-foreground group-hover:text-foreground transition-colors">{detail.value}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Изпратете ни запитване</CardTitle>
                                <CardDescription>Попълнете формата по-долу и ние ще се свържем с Вас възможно най-скоро.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ContactForm />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// "use client";

// import * as React from "react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Flame } from "lucide-react";

// // Components
// import { ExperiencesSection } from "@/components/drift/experiences-section";
// import { WhyChooseUs } from "@/components/drift/why-choose-us";
// import Hero from "@/components/hero/hero";

// export default function DriftExperiencesPage() {
//     return (
//         <main className="min-h-screen bg-slate-950">
//             {/* HERO SECTION - Full viewport height with aggressive CTA */}
//             <Hero />

//             {/* WHY CHOOSE US SECTION */}
//             <WhyChooseUs />

//             {/* EXPERIENCES SECTION */}
//             <ExperiencesSection />

//             {/* FINAL CTA SECTION */}
//             <section className="py-24 px-4 relative overflow-hidden">
//                 <div className="absolute inset-0 bg-gradient-to-r from-main/10 via-transparent to-taxi/10" />
//                 <div className="max-w-4xl mx-auto text-center relative z-10">
//                     <motion.div
//                         initial={{ opacity: 0, y: 30 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         viewport={{ once: true }}
//                         transition={{ duration: 0.8 }}
//                     >
//                         <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-6">
//                             Готов за<br />
//                             <span className="text-main">Дрифт?</span>
//                         </h2>
//                         <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
//                             Не чакай повече. Запази своята сесия сега и усети какво е истинската мощ на дрифта.
//                         </p>
//                         <Button
//                             size="lg"
//                             className="bg-main hover:bg-main/90 text-black font-extrabold uppercase tracking-wider h-16 px-12 text-lg rounded-xl shadow-[0_0_60px_-10px_rgba(16,185,129,0.6)] group"
//                             onClick={() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })}
//                         >
//                             <span className="relative z-10 flex items-center gap-2">
//                                 Избери Преживяване
//                                 <Flame className="w-5 h-5 group-hover:rotate-12 transition-transform" />
//                             </span>
//                         </Button>
//                     </motion.div>
//                 </div>
//             </section>
//         </main>
//     );
// }