"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";



import { useRouter, useSearchParams } from "next/navigation";



export function PageSlider({
    images,
    title,
    subtitle,
    icon,
    className,

}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    // --- Background Image Rotation ---
    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);









    return (
        <div
            className={cn(
                // Use min-h to allow growth on mobile, but fix height on desktop if needed.
                // Added 'relative' to container.
                "relative w-full overflow-hidden flex items-center -mt-20",
                className || "min-h-[600px]"
            )}
        >
            {/* Background Images */}
            <div className="absolute inset-0 z-0">
                {images.map((img, index) => (
                    <div
                        key={img}
                        className={cn(
                            "absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out",
                            index === currentImageIndex ? "opacity-100" : "opacity-0"
                        )}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/60 to-slate-950" />

            </div>

            {/* Content Grid 
         ADDED: 'pt-28' (padding-top: 7rem). 
         This pushes the content down so it isn't hidden behind the Navbar 
         if you use -mt-20 or a fixed header.
      */}
            <div className="container relative z-10 mx-auto px-4 pt-20 ">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-center">

                    {/* LEFT COLUMN: Title */}
                    <div className="flex flex-col justify-center text-white animate-in fade-in slide-in-from-left-5 duration-700">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 shrink-0">
                                {icon}
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-white italic uppercase tracking-tight">
                                {title}
                            </h2>
                        </div>
                        <p className="hidden md:flex text-lg text-gray-100 md:text-xl max-w-lg drop-shadow-sm leading-relaxed">
                            {subtitle}
                        </p>
                    </div>



                </div>
            </div>
        </div>
    );
}