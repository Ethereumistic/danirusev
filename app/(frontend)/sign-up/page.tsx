'use client';

import SignUpForm from '@/components/auth/sign-up-form';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-main/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

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
            className="inline-flex p-4 rounded-2xl bg-main/10 border-2 border-main/20 shadow-[0_0_20px_rgba(255,107,0,0.1)] mb-6"
          >
            <UserPlus className="h-8 w-8 text-main" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none mb-4">
            Нов <span className="text-main">Профил</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] max-w-[280px] mx-auto leading-relaxed">
            Присъединете се към дрифт общността и започнете вашето приключение
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

          <SignUpForm />
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