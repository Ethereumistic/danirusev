'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function AuthSuccessPage() {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-main/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex p-4 rounded-2xl bg-green-500/10 border-2 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)] mb-6"
          >
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none mb-4">
            Успешно <span className="text-main">Потвърждение</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] max-w-[280px] mx-auto leading-relaxed">
            Вашият имейл беше потвърден успешно. Вече сте част от нашия отбор!
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

          <div className="text-center space-y-6 relative z-10">
            <p className="text-slate-400 font-medium leading-relaxed">
              Благодарим ви, че се регистрирахте. Вашият акаунт е активен и готов за употреба.
            </p>

            <Button asChild className="w-full h-12 bg-main hover:bg-main/90 text-black font-black uppercase tracking-widest rounded-xl transition-all duration-300 group">
              <Link href="/sign-in" className="flex items-center justify-center gap-2">
                Влез в профила
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Support Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-10 text-[10px] text-slate-600 font-black uppercase tracking-widest"
        >
          Нуждаете се от помощ? <span className="text-slate-400">info@danirusev.com</span>
        </motion.p>
      </motion.div>
    </div>
  );
}
