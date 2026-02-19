"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Preload video after LCP image is ready
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden mt-[-4rem]">
      {/* Background - IMAGE FIRST for LCP, video loads after */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        {/* LCP Image - loads immediately */}
        <Image
          src="/hero-poster.webp"
          alt="Dani Rusev Drift Experience"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className={`object-cover transition-opacity duration-700 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => {
            // Start video loading after image is displayed
            if (videoRef.current) {
              videoRef.current.play().catch(() => { });
            }
          }}
        />

        {/* Video loads in background, swaps when ready */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none" // Don't preload until image is ready
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: 'translateZ(0)' }}
        >
          <source
            src="https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets@main/opt/hero/hero.mp4"
            type="video/mp4"
          />
        </video>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-slate-950/20 z-10" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-20 text-center">
        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter italic mb-6 leading-none"
        >
          Усети<br />
          <span className="text-main">
            Истинския
          </span>
          <br />
          Адреналин
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          Професионални дрифт сесии с <span className="text-main font-bold">Дани Русев</span> — твоят път към майсторството над волана.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button
            size="lg"
            className="bg-main hover:bg-main/90 text-black font-extrabold uppercase tracking-wider h-16 px-10 text-lg rounded-xl group relative overflow-hidden shadow-[0_0_40px_-10px_rgba(16,185,129,0.6)]"
            onClick={() => {
              document.getElementById('drift-experiences')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Избери Преживяване
              <Flame className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </span>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-main/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-2 bg-main rounded-full" />
        </div>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/60 to-slate-950 pointer-events-none" />
    </section>
  );
};

export default Hero;