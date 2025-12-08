import * as React from "react";

interface TyrePatternProps {
    className?: string;
}

export function TyrePattern({ className = "" }: TyrePatternProps) {
    return (
        <div className={`absolute inset-0 opacity-10 pointer-events-none ${className}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {/* Gradient mask for fade-out effect */}
                    <linearGradient id="tyre-fade" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>

                    <pattern
                        id="tyre-pattern"
                        x="0"
                        y="0"
                        width="60"
                        height="60"
                        patternUnits="userSpaceOnUse"
                    >
                        {/* Tyre tread marks - diagonal lines */}
                        <g stroke="#38b6ff" strokeWidth="2" fill="none">
                            {/* Top-left to bottom-right treads */}
                            <line x1="0" y1="15" x2="15" y2="0" />
                            <line x1="0" y1="30" x2="30" y2="0" />
                            <line x1="0" y1="45" x2="45" y2="0" />
                            <line x1="0" y1="60" x2="60" y2="0" />
                            <line x1="15" y1="60" x2="60" y2="15" />
                            <line x1="30" y1="60" x2="60" y2="30" />
                            <line x1="45" y1="60" x2="60" y2="45" />

                            {/* Additional texture - small dots */}
                            <circle cx="10" cy="10" r="1" fill="#38b6ff" />
                            <circle cx="30" cy="30" r="1" fill="#38b6ff" />
                            <circle cx="50" cy="50" r="1" fill="#38b6ff" />
                            <circle cx="20" cy="40" r="1" fill="#38b6ff" />
                            <circle cx="40" cy="20" r="1" fill="#38b6ff" />
                        </g>
                    </pattern>
                </defs>
                {/* Apply the pattern with the gradient mask */}
                <rect width="100%" height="100%" fill="url(#tyre-pattern)" mask="url(#tyre-fade-mask)" />

                {/* Mask definition */}
                <mask id="tyre-fade-mask">
                    <rect width="100%" height="100%" fill="url(#tyre-fade)" />
                </mask>
            </svg>
        </div>
    );
}
