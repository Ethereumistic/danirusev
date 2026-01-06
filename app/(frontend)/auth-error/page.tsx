'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const description = searchParams.get('description');

  const getErrorTitle = (err: string | null) => {
    switch (err) {
      case 'access_denied': return 'Достъпът е отказан';
      case 'verification_failed': return 'Верификацията неуспешна';
      default: return 'Грешка при Удостоверяване';
    }
  };

  const getErrorMessage = (desc: string | null, err: string | null) => {
    if (desc) return desc;
    switch (err) {
      case 'access_denied': return 'Не беше предоставен достъп за завършване на процеса.';
      case 'verification_failed': return 'Връзката за потвърждение е невалидна или е изтекла.';
      case 'exchange_error': return 'Възникна проблем при свързването с вашия профил.';
      default: return 'Възникна неочаквана грешка по време на входа. Моля, опитайте отново.';
    }
  };

  return (
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
          className="inline-flex p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)] mb-6"
        >
          <AlertCircle className="h-8 w-8 text-red-500" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none mb-4">
          Опа! <span className="text-red-500">Грешка</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] max-w-[280px] mx-auto leading-relaxed">
          {getErrorTitle(error)}
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

        <div className="text-center space-y-6 relative z-10">
          <p className="text-slate-400 font-medium leading-relaxed">
            {getErrorMessage(description, error)}
          </p>

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full h-12 bg-main hover:bg-main/90 text-black font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,107,0,0.2)] group">
              <Link href="/sign-in" className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                Опитай отново
              </Link>
            </Button>

            <Button variant="ghost" asChild className="w-full h-12 text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest rounded-xl transition-all duration-300">
              <Link href="/" className="flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Към Начало
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-10 text-[10px] text-slate-600 font-black uppercase tracking-widest"
      >
        Имате нужда от съдействие? <span className="text-slate-400">contact@danirusev.com</span>
      </motion.p>
    </motion.div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-main/5 blur-[100px] rounded-full pointer-events-none" />

      <Suspense fallback={
        <div className="flex items-center gap-3 text-slate-500 font-black uppercase tracking-widest animate-pulse">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Зареждане...
        </div>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
