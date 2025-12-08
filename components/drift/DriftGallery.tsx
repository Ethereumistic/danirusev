"use client";

import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";



// Helper component for Image with loading state
const ImageWithLoader = ({
    src,
    alt,
    priority = false,
    className,
}: {
    src: string;
    alt: string;
    priority?: boolean;
    className?: string;
}) => {
    const [isLoading, setIsLoading] = React.useState(true);

    return (
        <>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}
            <Image
                src={src}
                alt={alt}
                fill
                className={className}
                priority={priority}
                onLoad={() => setIsLoading(false)}
            />
        </>
    );
};

export function DriftGallery({
    imageUrls,
    title,
    subtitle,
    themeColor
}: {
    imageUrls: string[];
    title: string;
    subtitle: string;
    themeColor: 'taxi' | 'rent' | 'mix' | 'main';
}) {
    const [mainCarouselApi, setMainCarouselApi] = React.useState<CarouselApi>();
    const [mainImageIndex, setMainImageIndex] = React.useState(0);

    // Convert string URLs to the format expected by the component
    const allImages = React.useMemo(() => {
        return imageUrls.map((url, index) => ({
            id: `img-${index}`,
            image: url,
        }));
    }, [imageUrls]);

    const mainImage = allImages[0];

    React.useEffect(() => {
        if (!mainCarouselApi) return;

        mainCarouselApi.on("select", () => {
            setMainImageIndex(mainCarouselApi.selectedScrollSnap());
        });
    }, [mainCarouselApi]);

    if (!mainImage) return null;

    return (
        <div className="space-y-3">
            {/* Main Carousel Image - Full Width */}
            <div className="relative w-full ">
                <Carousel setApi={setMainCarouselApi} className="w-full -mb-1">
                    <CarouselContent>
                        {allImages.map((img, idx) => (
                            <CarouselItem key={img.id || idx}>
                                <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg bg-slate-100">
                                    <ImageWithLoader
                                        src={img.image || "/placeholder.svg"}
                                        alt={`${title} ${idx + 1}`}
                                        priority={idx === 0}
                                        className="object-cover"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Navigation Arrows */}
                    <CarouselPrevious variant="ghost" className="left-4 bg-white/20 hover:bg-white/40 border-0 text-white backdrop-blur-sm" />
                    <CarouselNext variant="ghost" className="right-4 bg-white/20 hover:bg-white/40 border-0 text-white backdrop-blur-sm" />

                    {/* Subtitle Badge - Top Right */}
                    <div className="absolute top-3 right-3 z-10">
                        <Badge
                            variant="glass"
                        >
                            {subtitle}
                        </Badge>
                    </div>

                    {/* Counter Badge */}
                    {allImages.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                            <Badge variant="secondary" className="bg-black/50 text-white hover:bg-black/60 backdrop-blur-md border-0">
                                {mainImageIndex + 1} / {allImages.length}
                            </Badge>
                        </div>
                    )}
                </Carousel>
            </div>

            {/* Thumbnails Grid - 4 smaller square images */}
            {allImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {allImages.slice(0, 4).map((img, idx) => (
                        <button
                            key={img.id || idx}
                            onClick={() => mainCarouselApi?.scrollTo(idx)}
                            className="relative w-full aspect-square overflow-hidden group cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-slate-100 rounded-lg"
                        >
                            <ImageWithLoader
                                src={img.image || "/placeholder.svg"}
                                alt={`${title} thumbnail ${idx + 1}`}
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}