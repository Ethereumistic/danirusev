"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const QUOTES = [
  {
    text: "Животът е твърде кратък за бавни ",
    highlight: "коли ",
    text2: " и обикновени ",
    highlight2: " жени"
  },
  {
    text: "Истинските мъже",
    highlight: " дрифтят",
    text2: ", останалите само ",
    highlight2: "гледат"
  },
  {
    text: "Адреналинът е ",
    highlight: "зависимост",
    text2: ", дрифтът е ",
    highlight2: "лекарство"
  },
  {
    text: "Гумите се ",
    highlight: "палят",
    text2: ", спомените остават ",
    highlight2: "завинаги"
  }
];

const Hero = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % QUOTES.length);
    }, 7000); // Change quote every 7 seconds

    return () => clearInterval(interval);
  }, []);

  const currentQuote = QUOTES[currentQuoteIndex];

  return (
    <div className="relative h-screen w-full overflow-hidden mt-[-4rem]">

      <video
        autoPlay
        loop
        muted
        playsInline // Important for mobile
        className="absolute top-0 left-0 w-full h-full object-cover z-10"
        src="/bg.mp4"
        onCanPlay={() => console.log('Video can play')}
      >
        <source src="/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.

      </video>
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white bg-black/50">
        <div className="relative h-32 md:h-40 flex items-center justify-center px-4 max-w-2xl md:max-w-6xl w-full">
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentQuoteIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl z-30 font-black uppercase tracking-tighter italic text-white absolute leading-tight"
            >
              {currentQuote.text}
              <span className="text-main">{currentQuote.highlight}</span>
              {currentQuote.text2}
              <span className="text-main">{currentQuote.highlight2}</span>
            </motion.h1>
          </AnimatePresence>
        </div>
        <Button size='lg' className="z-30 mt-8 text-xl bg-main hover:bg-main/80 font-gagalin text-outline-md text-alt">
          <Link href="/xp">Резервирай сега</Link>
        </Button>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/60 to-slate-950" />

      </div>

    </div>
  );
};

export default Hero;