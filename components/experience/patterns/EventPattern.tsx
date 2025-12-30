import * as React from "react";

interface EventPatternProps {
    className?: string;
}

export function EventPattern({ className = "" }: EventPatternProps) {
    return (
        <div className={`absolute inset-0 opacity-10 pointer-events-none ${className}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="event-fade" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>

                    <pattern
                        id="event-pattern"
                        x="0"
                        y="0"
                        width="60"
                        height="60"
                        patternUnits="userSpaceOnUse"
                    >
                        {/* Confetti / Party shapes */}
                        <circle cx="10" cy="10" r="3" fill="currentColor" className="text-event" />
                        <rect x="30" y="5" width="6" height="6" transform="rotate(45 33 8)" fill="currentColor" className="text-event" />
                        <circle cx="50" cy="25" r="4" fill="currentColor" stroke="currentColor" strokeWidth="1" fillOpacity="0" className="text-event" />
                        <rect x="15" y="40" width="8" height="2" transform="rotate(-30 19 41)" fill="currentColor" className="text-event" />
                        <circle cx="40" cy="50" r="2" fill="currentColor" className="text-event" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#event-pattern)" mask="url(#event-fade-mask)" />

                <mask id="event-fade-mask">
                    <rect width="100%" height="100%" fill="url(#event-fade)" />
                </mask>
            </svg>
        </div>
    );
}
