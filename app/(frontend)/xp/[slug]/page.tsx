import * as React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, MapPin, Gauge, Car, CarTaxiFront, ArrowLeft, Quote } from "lucide-react";

// Data & Types
import { DRIFT_EXPERIENCES, DriftExperience } from "@/lib/drift-data";

// Components
import { DriftGallery } from "@/components/drift/DriftGallery"; // Reusing Gallery logic
import { DriftBookingSidebar } from "@/components/drift/drift-booking-sidebar";
import { DriftStatsGrid } from "@/components/drift/drift-stats-grid";
import { DriftProgram } from "@/components/drift/drift-program";
import { DriftIncluded } from "@/components/drift/DriftIncluded"; // Reusing generic Included component

// Helper function to get the correct icon component
function getIconComponent(iconName: DriftExperience['iconName'], themeColor: DriftExperience['themeColor']) {
    const colorClass = themeColor === 'taxi' ? 'text-taxi' :
        themeColor === 'rent' ? 'text-rent' :
            themeColor === 'mix' ? 'text-mix' :
                'text-main';

    const iconMap = {
        CarTaxiFront: <CarTaxiFront className={`w-12 h-12 ${colorClass}`} />,
        Car: <Car className={`w-12 h-12 ${colorClass}`} />,
        Gauge: <Gauge className={`w-12 h-12 ${colorClass}`} />,
    };
    return iconMap[iconName];
}

// Mock function to simulate data fetching
async function getDriftExperienceBySlug(slug: string) {
    return DRIFT_EXPERIENCES.find((xp) => xp.slug === slug);
}

export default async function DriftExperiencePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const experience = await getDriftExperienceBySlug(slug);

    if (!experience) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-12 pt-4 md:pt-8">
            {/* Back Button - Outside container on desktop, left-aligned */}
            <div className="max-w-7xl mx-auto px-4 mb-6">
                <Link href="/xp">
                    <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-white group"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        Назад към преживявания
                    </Button>
                </Link>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                {/* Header with Title and Icon */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={`p-4 bg-slate-900 rounded-2xl border-2 ${experience.themeColor === 'taxi' ? 'border-taxi' :
                        experience.themeColor === 'rent' ? 'border-rent' :
                            experience.themeColor === 'mix' ? 'border-mix' :
                                'border-main'
                        }`}>
                        {getIconComponent(experience.iconName, experience.themeColor)}
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tight text-white">
                            {experience.title}
                        </h1>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                    {/* LEFT COLUMN - GALLERY */}
                    <div className="lg:col-span-5 space-y-2 lg:sticky lg:top-20 lg:self-start">
                        <DriftGallery
                            imageUrls={experience.images}
                            title={experience.title}
                            subtitle={experience.subtitle}
                            themeColor={experience.themeColor}
                        />
                        <DriftStatsGrid experience={experience} />
                    </div>

                    {/* RIGHT COLUMN - ALL CONTENT */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Description - Styled as a Quote */}
                        <div className={`relative bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-2xl border-2 ${experience.themeColor === 'taxi' ? 'border-taxi/30' :
                            experience.themeColor === 'rent' ? 'border-rent/30' :
                                experience.themeColor === 'mix' ? 'border-mix/30' :
                                    'border-main/30'
                            } overflow-hidden group`}>
                            {/* Quote Icon Background */}
                            <Quote className={`absolute -top-4 -right-4 w-32 h-32 opacity-5 ${experience.themeColor === 'taxi' ? 'text-taxi' :
                                experience.themeColor === 'rent' ? 'text-rent' :
                                    experience.themeColor === 'mix' ? 'text-mix' :
                                        'text-main'
                                }`} />

                            {/* Content */}
                            <div className="relative z-10">
                                <p className="text-xl md:text-2xl font-medium text-white leading-relaxed italic">
                                    "{experience.description}"
                                </p>
                                <div className={`mt-4 h-1 w-20 rounded-full ${experience.themeColor === 'taxi' ? 'bg-taxi' :
                                    experience.themeColor === 'rent' ? 'bg-rent' :
                                        experience.themeColor === 'mix' ? 'bg-mix' :
                                            'bg-main'
                                    }`} />
                            </div>
                        </div>

                        {/* Tabs System */}
                        <div className="relative">
                            <Tabs defaultValue="program" className="w-full">
                                <TabsList className="w-full justify-start self-start bg-slate-900 p-1 rounded-lg border border-slate-800 z-30">
                                    <TabsTrigger
                                        value="program"
                                        className={
                                            experience.themeColor === 'taxi' ? 'data-[state=active]:!bg-taxi data-[state=active]:!text-black text-slate-400' :
                                                experience.themeColor === 'rent' ? 'data-[state=active]:!bg-rent data-[state=active]:!text-black text-slate-400' :
                                                    experience.themeColor === 'mix' ? 'data-[state=active]:!bg-mix data-[state=active]:!text-black text-slate-400' :
                                                        'data-[state=active]:!bg-main data-[state=active]:!text-black text-slate-400'
                                        }
                                    >
                                        Програма
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="included"
                                        className={
                                            experience.themeColor === 'taxi' ? 'data-[state=active]:!bg-taxi data-[state=active]:!text-black text-slate-400' :
                                                experience.themeColor === 'rent' ? 'data-[state=active]:!bg-rent data-[state=active]:!text-black text-slate-400' :
                                                    experience.themeColor === 'mix' ? 'data-[state=active]:!bg-mix data-[state=active]:!text-black text-slate-400' :
                                                        'data-[state=active]:!bg-main data-[state=active]:!text-black text-slate-400'
                                        }
                                    >
                                        Условия
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="location"
                                        className={
                                            experience.themeColor === 'taxi' ? 'data-[state=active]:!bg-taxi data-[state=active]:!text-black text-slate-400' :
                                                experience.themeColor === 'rent' ? 'data-[state=active]:!bg-rent data-[state=active]:!text-black text-slate-400' :
                                                    experience.themeColor === 'mix' ? 'data-[state=active]:!bg-mix data-[state=active]:!text-black text-slate-400' :
                                                        'data-[state=active]:!bg-main data-[state=active]:!text-black text-slate-400'
                                        }
                                    >
                                        Локация
                                    </TabsTrigger>
                                </TabsList>

                                <div className="mt-6 space-y-6">
                                    {/* Tab: Program */}
                                    <TabsContent value="program">
                                        <DriftProgram program={experience.program} themeColor={experience.themeColor} />
                                    </TabsContent>

                                    {/* Tab: Included/Excluded */}
                                    <TabsContent value="included">
                                        <DriftIncluded
                                            included={experience.included.map(t => ({ text: t }))}
                                            notIncluded={experience.notIncluded.map(t => ({ text: t }))}
                                            themeColor={experience.themeColor}
                                        />
                                    </TabsContent>

                                    {/* Tab: Location */}
                                    <TabsContent value="location">
                                        <Card className="bg-slate-900 border-slate-800">
                                            <CardContent className="pt-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="bg-slate-800 p-3 rounded-full">
                                                        <MapPin className={`h-6 w-6 text-${experience.themeColor}`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white">Писта Трявна</h4>
                                                        <p className="text-slate-400 mt-2">
                                                            Всички дрифт преживявания се провеждат на обезопасено трасе в близост до град Трявна.
                                                            Локацията предлага перфектна комбинация от технични завои и безопасни зони.
                                                        </p>
                                                        <div className="mt-4 h-64 w-full bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                                                            {/* You can embed a Google Map Iframe here */}
                                                            [Map Placeholder]
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>

                        {/* Booking Sidebar */}
                        <DriftBookingSidebar experience={experience} />
                    </div>
                </div>
            </div>
        </div>
    );
}