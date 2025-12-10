"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Flame,
  Trophy,
  Timer,
  Star,
  ShieldCheck,
  Video
} from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden mt-[-4rem]">
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-10"
          src="/bg.mp4"
          onCanPlay={() => console.log('Video can play')}
        >
          <source src="/bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white bg-black/60" />

        {/* Animated accent overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-main/20 via-transparent to-taxi/10 mix-blend-overlay"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
        {/* Pre-title badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 bg-main/10 border border-main/30 px-6 py-2 rounded-full backdrop-blur-md"
        >
          <Flame className="w-4 h-4 text-main" />
          <span className="text-main font-bold uppercase tracking-wider text-sm">
            Оригинални Дрифт Преживявания
          </span>
        </motion.div>

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
          Професионални дрифт сесии с <span className="text-main font-bold">Дани Русев</span> —
          твоят път към майсторството на занеса.
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
              document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Избери Преживяване
              <Flame className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-slate-700 hover:border-main bg-slate-950/50 hover:bg-slate-900 text-white font-bold uppercase tracking-wider h-16 px-10 text-lg rounded-xl backdrop-blur-md"
          >
            <Video className="mr-2 w-5 h-5" />
            Виж Видео
          </Button>
        </motion.div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { icon: Trophy, value: "500+", label: "Доволни Клиенти" },
            { icon: Timer, value: "1000+", label: "Дрифт Сесии" },
            { icon: Star, value: "5.0", label: "Рейтинг" },
            { icon: ShieldCheck, value: "100%", label: "Безопасност" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-4">
              <stat.icon className="w-6 h-6 text-main mb-2 mx-auto" />
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-main/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-2 bg-main rounded-full" />
        </div>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/60 to-slate-950" />

    </section>
  );
};

export default Hero;