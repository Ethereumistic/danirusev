"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Hero = () => {

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
        <h1 className="text-4xl z-30 font-gagalin md:text-6xl text-white dark:font-outline">Life is too short for slow cars<br></br> and basic women</h1>
        <Button size='lg' className="z-30 mt-8 text-xl bg-main hover:bg-main/80 font-gagalin text-outline-md text-alt">
          <Link href="/experiences">Резервирай сега</Link>
        </Button>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/60 to-slate-950" />

      </div>

    </div>
  );
};

export default Hero;