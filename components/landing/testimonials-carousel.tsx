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

import type { Testimonial } from "@/types/payload-types";

interface TestimonialsCarouselProps {
    testimonials: Testimonial[];
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
    if (!testimonials || testimonials.length === 0) return null;

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
                        loop: testimonials.length > 1,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {testimonials.map((testimonial) => {
                            // Handle avatar URL from Payload group
                            let avatarUrl = "";
                            if (testimonial.avatar?.type === 'url') {
                                avatarUrl = testimonial.avatar.url || "";
                            } else if (testimonial.avatar?.type === 'upload' && testimonial.avatar.media) {
                                const media = testimonial.avatar.media as any;
                                avatarUrl = media.url || "";
                            }

                            return (
                                <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-[30%]">
                                    <Card className="bg-slate-900/50 backdrop-blur-md border-slate-800 hover:border-main/30 transition-all h-full">
                                        <CardContent className="px-6 py-6 flex flex-col h-full">
                                            {/* Header with Avatar and Info */}
                                            <div className="flex items-start gap-4 mb-4">
                                                <Avatar className="size-20 border-2 border-main/30">
                                                    <AvatarImage
                                                        src={avatarUrl}
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
                                                    {testimonial.experience && (
                                                        <p className="text-slate-400 text-sm truncate">
                                                            {testimonial.experience}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Stars */}
                                            <div className="flex gap-1 mb-4">
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-main text-main" />
                                                ))}
                                            </div>

                                            {/* Quote */}
                                            <blockquote className="text-slate-300 text-sm leading-relaxed flex-1 mb-4 whitespace-pre-line">
                                                {testimonial.quote}
                                            </blockquote>

                                            {/* Location */}
                                            {testimonial.location && (
                                                <p className="text-xs text-slate-500">
                                                    {testimonial.location}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex -left-12 bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-main/50 text-white" />
                    <CarouselNext className="hidden md:flex -right-12 bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-main/50 text-white" />
                </Carousel>
            </div>
        </section>
    );
}
