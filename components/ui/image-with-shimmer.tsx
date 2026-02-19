"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageWithShimmerProps {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
    priority?: boolean;
    width?: number;
    height?: number;
}

export function ImageWithShimmer({
    src,
    alt,
    fill,
    sizes,
    className,
    priority,
    width,
    height,
}: ImageWithShimmerProps) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="relative w-full h-full">
            {isLoading && (
                <div className="absolute inset-0 bg-slate-800 animate-pulse rounded-2xl z-10" />
            )}
            <Image
                src={src}
                alt={alt}
                fill={fill}
                width={width}
                height={height}
                sizes={sizes}
                className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                priority={priority}
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
}
