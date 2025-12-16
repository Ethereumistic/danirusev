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

// import * as React from "react";
// import { notFound } from "next/navigation";
// import Link from "next/link";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Info, MapPin, Gauge, Car, CarTaxiFront, ArrowLeft, Quote } from "lucide-react";

// // Data & Types
// import { DRIFT_EXPERIENCES, DriftExperience } from "@/lib/drift-data";

// // Components
// import { DriftGallery } from "@/components/drift/DriftGallery"; // Reusing Gallery logic
// import { DriftStatsGrid } from "@/components/drift/drift-stats-grid";
// import { DriftProgram } from "@/components/drift/drift-program";
// import { DriftIncluded } from "@/components/drift/DriftIncluded"; // Reusing generic Included component
// import { DriftAdditionalItems } from "@/components/drift/DriftAdditionalItems";
// import { DriftBookingSidebar } from "@/components/drift/drift-booking-sidebar";

// // Helper function to get the correct icon component
// function getIconComponent(iconName: DriftExperience['iconName'], themeColor: DriftExperience['themeColor']) {
//     const colorClass = themeColor === 'taxi' ? 'text-taxi' :
//         themeColor === 'rent' ? 'text-rent' :
//             themeColor === 'mix' ? 'text-mix' :
//                 'text-main';

//     const iconMap = {
//         CarTaxiFront: <CarTaxiFront className={`w-12 h-12 ${colorClass}`} />,
//         Car: <Car className={`w-12 h-12 ${colorClass}`} />,
//         Gauge: <Gauge className={`w-12 h-12 ${colorClass}`} />,
//     };
//     return iconMap[iconName];
// }

// // Mock function to simulate data fetching
// async function getDriftExperienceBySlug(slug: string) {
//     return DRIFT_EXPERIENCES.find((xp) => xp.slug === slug);
// }

// export default async function DriftExperiencePage({
//     params,
// }: {
//     params: Promise<{ slug: string }>;
// }) {
//     const { slug } = await params;
//     const experience = await getDriftExperienceBySlug(slug);

//     if (!experience) {
//         notFound();
//     }

//     return (
//         <div className="min-h-screen bg-slate-950 pb-12 pt-4 md:pt-8">
//             {/* Back Button - Outside container on desktop, left-aligned */}
//             <div className="max-w-7xl mx-auto px-4 mb-6">
//                 <Link href="/xp">
//                     <Button
//                         variant="ghost"
//                         className="text-slate-400 hover:text-white group"
//                     >
//                         <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
//                         Назад към преживявания
//                     </Button>
//                 </Link>
//             </div>

//             <div className="max-w-6xl mx-auto px-4">
//                 {/* Header with Title and Icon */}
//                 <div className="flex items-center gap-4 mb-8">
//                     <div className={`p-4 bg-slate-900 rounded-2xl border-2 ${experience.themeColor === 'taxi' ? 'border-taxi' :
//                         experience.themeColor === 'rent' ? 'border-rent' :
//                             experience.themeColor === 'mix' ? 'border-mix' :
//                                 'border-main'
//                         }`}>
//                         {getIconComponent(experience.iconName, experience.themeColor)}
//                     </div>
//                     <div>
//                         <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tight text-white">
//                             {experience.title}
//                         </h1>
//                     </div>
//                 </div>

//                 {/* Main Content Grid */}
//                 <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
//                     {/* LEFT COLUMN - GALLERY */}
//                     <div className="lg:col-span-5 space-y-2 lg:sticky lg:top-20 lg:self-start">
//                         <DriftGallery
//                             imageUrls={experience.images}
//                             title={experience.title}
//                             subtitle={experience.subtitle}
//                             themeColor={experience.themeColor}
//                         />
//                         <DriftStatsGrid experience={experience} />
//                     </div>

//                     {/* RIGHT COLUMN - ALL CONTENT */}
//                     <div className="lg:col-span-5 space-y-4">
//                         {/* Description - Styled as a Quote */}
//                         <div className={`relative bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-2xl border-2 ${experience.themeColor === 'taxi' ? 'border-taxi/30' :
//                             experience.themeColor === 'rent' ? 'border-rent/30' :
//                                 experience.themeColor === 'mix' ? 'border-mix/30' :
//                                     'border-main/30'
//                             } overflow-hidden group`}>
//                             {/* Quote Icon Background */}
//                             <Quote className={`absolute -top-4 -right-4 w-32 h-32 opacity-5 ${experience.themeColor === 'taxi' ? 'text-taxi' :
//                                 experience.themeColor === 'rent' ? 'text-rent' :
//                                     experience.themeColor === 'mix' ? 'text-mix' :
//                                         'text-main'
//                                 }`} />

//                             {/* Content */}
//                             <div className="relative z-10">
//                                 <p className="text-xl md:text-2xl font-medium text-white leading-relaxed italic">
//                                     "{experience.description}"
//                                 </p>
//                                 <div className={`mt-4 h-1 w-20 rounded-full ${experience.themeColor === 'taxi' ? 'bg-taxi' :
//                                     experience.themeColor === 'rent' ? 'bg-rent' :
//                                         experience.themeColor === 'mix' ? 'bg-mix' :
//                                             'bg-main'
//                                     }`} />
//                             </div>
//                         </div>

//                         {/* Tabs System */}
//                         <div className="relative">
//                             <Tabs defaultValue="program" className="w-full">
//                                 <TabsList className="w-full justify-start self-start bg-slate-900 p-1 rounded-lg border border-slate-800 z-30">
//                                     <TabsTrigger
//                                         value="program"
//                                         className={
//                                             experience.themeColor === 'taxi' ? 'data-[state=active]:!bg-taxi data-[state=active]:!text-black text-slate-400' :
//                                                 experience.themeColor === 'rent' ? 'data-[state=active]:!bg-rent data-[state=active]:!text-black text-slate-400' :
//                                                     experience.themeColor === 'mix' ? 'data-[state=active]:!bg-mix data-[state=active]:!text-black text-slate-400' :
//                                                         'data-[state=active]:!bg-main data-[state=active]:!text-black text-slate-400'
//                                         }
//                                     >
//                                         Програма
//                                     </TabsTrigger>
//                                     <TabsTrigger
//                                         value="included"
//                                         className={
//                                             experience.themeColor === 'taxi' ? 'data-[state=active]:!bg-taxi data-[state=active]:!text-black text-slate-400' :
//                                                 experience.themeColor === 'rent' ? 'data-[state=active]:!bg-rent data-[state=active]:!text-black text-slate-400' :
//                                                     experience.themeColor === 'mix' ? 'data-[state=active]:!bg-mix data-[state=active]:!text-black text-slate-400' :
//                                                         'data-[state=active]:!bg-main data-[state=active]:!text-black text-slate-400'
//                                         }
//                                     >
//                                         Условия
//                                     </TabsTrigger>
//                                     <TabsTrigger
//                                         value="additional"
//                                         className={
//                                             experience.themeColor === 'taxi' ? 'data-[state=active]:!bg-taxi data-[state=active]:!text-black text-slate-400' :
//                                                 experience.themeColor === 'rent' ? 'data-[state=active]:!bg-rent data-[state=active]:!text-black text-slate-400' :
//                                                     experience.themeColor === 'mix' ? 'data-[state=active]:!bg-mix data-[state=active]:!text-black text-slate-400' :
//                                                         'data-[state=active]:!bg-main data-[state=active]:!text-black text-slate-400'
//                                         }
//                                     >
//                                         Допълнения
//                                     </TabsTrigger>
//                                 </TabsList>

//                                 <div className="mt-2">
//                                     {/* Tab: Program */}
//                                     <TabsContent value="program">
//                                         <DriftProgram program={experience.program} themeColor={experience.themeColor} />
//                                     </TabsContent>

//                                     {/* Tab: Included/Excluded */}
//                                     <TabsContent value="included">
//                                         <DriftIncluded
//                                             included={experience.included.map(t => ({ text: t }))}
//                                             notIncluded={experience.notIncluded.map(t => ({ text: t }))}
//                                             themeColor={experience.themeColor}
//                                         />
//                                     </TabsContent>

//                                     {/* Tab: Additional Items */}
//                                     <TabsContent value="additional">
//                                         {experience.additionalItems && experience.additionalItems.length > 0 ? (
//                                             <DriftAdditionalItems
//                                                 items={experience.additionalItems}
//                                                 themeColor={experience.themeColor}
//                                                 experienceId={experience.id}
//                                             />
//                                         ) : (
//                                             <p className="text-slate-400 text-center py-8">Няма налични допълнения за този пакет.</p>
//                                         )}
//                                     </TabsContent>
//                                 </div>
//                             </Tabs>
//                         </div>

//                         {/* Booking Sidebar */}
//                         <DriftBookingSidebar experience={experience} />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }