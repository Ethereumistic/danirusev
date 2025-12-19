import * as React from "react";

interface TaxiCheckerPatternProps {
    className?: string;
}

export function TaxiCheckerPattern({ className = "" }: TaxiCheckerPatternProps) {
    return (
        <div className={`absolute inset-0 opacity-10 pointer-events-none ${className}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {/* Gradient mask for fade-out effect */}
                    <linearGradient id="taxi-fade" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>

                    <pattern
                        id="taxi-checker"
                        x="0"
                        y="0"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                    >
                        {/* Black square */}
                        <rect x="0" y="0" width="20" height="20" fill="#000000" />
                        {/* Vibrant taxi yellow square */}
                        <rect x="20" y="0" width="20" height="20" fill="#FFC107" />
                        {/* Vibrant taxi yellow square */}
                        <rect x="0" y="20" width="20" height="20" fill="#FFC107" />
                        {/* Black square */}
                        <rect x="20" y="20" width="20" height="20" fill="#000000" />
                    </pattern>
                </defs>
                {/* Apply the pattern with the gradient mask */}
                <rect width="100%" height="100%" fill="url(#taxi-checker)" mask="url(#taxi-fade-mask)" />

                {/* Mask definition */}
                <mask id="taxi-fade-mask">
                    <rect width="100%" height="100%" fill="url(#taxi-fade)" />
                </mask>
            </svg>
        </div>
    );
}
