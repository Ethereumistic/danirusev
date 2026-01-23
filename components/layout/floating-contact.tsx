'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function FloatingContact() {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = React.useState(false);

    // Only show on root page and experience pages
    const shouldShow = pathname === '/' || pathname?.startsWith('/experience/') || pathname === '/checkout';

    if (!shouldShow) return null;

    return (
        <motion.div
            className="fixed bottom-2 left-2 z-[100]"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.5,
                delay: 1, // Appear after page load animations
                ease: [0.23, 1, 0.32, 1]
            }}
        >
            <motion.a
                layout
                href="tel:+359882726020"
                className="flex items-center bg-main text-black font-bold h-14 rounded-full shadow-[0_8px_32px_rgba(var(--main),0.4)] border border-white/20 backdrop-blur-md overflow-hidden relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                transition={{
                    layout: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                    }
                }}
            >
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 fill-current" />
                </div>

                <AnimatePresence>
                    {isHovered && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-sm tracking-tighter whitespace-nowrap pr-8"
                        >
                            +359 88 272 6020
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.a>

            {/* Subtle glow effect beneath */}
            <div className="absolute inset-0 bg-main/20 blur-2xl -z-10 rounded-full" />
        </motion.div>
    );
}
