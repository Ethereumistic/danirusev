import * as React from "react";

interface DayPatternProps {
    className?: string;
}

export function DayPattern({ className = "" }: DayPatternProps) {
    return (
        <div className={`absolute inset-0 opacity-10 pointer-events-none ${className}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="day-fade" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>

                    <pattern
                        id="day-pattern"
                        x="0"
                        y="0"
                        width="80"
                        height="80"
                        patternUnits="userSpaceOnUse"
                    >
                        {/* Sun-like shape at center */}
                        <circle cx="40" cy="40" r="4" fill="currentColor" className="text-day" />
                        <g stroke="currentColor" strokeWidth="1.5" className="text-day">
                            <line x1="40" y1="32" x2="40" y2="26" />
                            <line x1="40" y1="48" x2="40" y2="54" />
                            <line x1="32" y1="40" x2="26" y2="40" />
                            <line x1="48" y1="40" x2="54" y2="40" />

                            <line x1="34" y1="34" x2="30" y2="30" />
                            <line x1="46" y1="34" x2="50" y2="30" />
                            <line x1="34" y1="46" x2="30" y2="50" />
                            <line x1="46" y1="46" x2="50" y2="50" />
                        </g>

                        {/* Smaller secondary elements */}
                        <circle cx="15" cy="15" r="2" fill="currentColor" className="text-day" opacity="0.6" />
                        <circle cx="65" cy="65" r="1.5" fill="currentColor" className="text-day" opacity="0.4" />
                        <rect x="10" y="60" width="4" height="4" transform="rotate(20 12 62)" fill="currentColor" className="text-day" opacity="0.5" />
                        <rect x="65" y="10" width="3" height="3" transform="rotate(-15 66.5 11.5)" fill="currentColor" className="text-day" opacity="0.3" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#day-pattern)" mask="url(#day-fade-mask)" />

                <mask id="day-fade-mask">
                    <rect width="100%" height="100%" fill="url(#day-fade)" />
                </mask>
            </svg>
        </div>
    );
}
