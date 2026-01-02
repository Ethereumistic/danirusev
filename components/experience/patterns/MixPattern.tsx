import * as React from "react";

interface MixPatternProps {
    className?: string;
}

export function MixPattern({ className = "" }: MixPatternProps) {
    return (
        <div className={`absolute inset-0 opacity-10 pointer-events-none ${className}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="mix-fade" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>

                    <pattern
                        id="mix-pattern"
                        x="0"
                        y="0"
                        width="80"
                        height="80"
                        patternUnits="userSpaceOnUse"
                    >
                        {/* Dual nature represented by intersecting or parallel diagonal paths */}
                        <g stroke="currentColor" strokeWidth="2" className="text-mix" fill="none">
                            {/* Main diagonal thick line */}
                            <line x1="0" y1="0" x2="80" y2="80" strokeWidth="4" opacity="0.8" />
                            {/* Parallel accent lines */}
                            <line x1="0" y1="20" x2="60" y2="80" strokeWidth="1" opacity="0.4" />
                            <line x1="20" y1="0" x2="80" y2="60" strokeWidth="1" opacity="0.4" />

                            {/* Reverse diagonals (dotted/dashed) to show the "mix" or cross-over */}
                            <line x1="80" y1="0" x2="0" y2="80" strokeDasharray="4 4" opacity="0.3" />
                        </g>

                        {/* Mixed geometric shapes */}
                        <circle cx="20" cy="60" r="3" fill="currentColor" className="text-mix" opacity="0.5" />
                        <rect x="55" y="15" width="6" height="6" transform="rotate(45 58 18)" fill="currentColor" className="text-mix" opacity="0.5" />

                        {/* Small tech-like dots */}
                        <circle cx="10" cy="10" r="1" fill="currentColor" className="text-mix" />
                        <circle cx="70" cy="70" r="1" fill="currentColor" className="text-mix" />
                        <circle cx="70" cy="10" r="1" fill="currentColor" className="text-mix" />
                        <circle cx="10" cy="70" r="1" fill="currentColor" className="text-mix" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mix-pattern)" mask="url(#mix-fade-mask)" />

                <mask id="mix-fade-mask">
                    <rect width="100%" height="100%" fill="url(#mix-fade)" />
                </mask>
            </svg>
        </div>
    );
}
