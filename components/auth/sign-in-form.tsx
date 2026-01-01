'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/providers/supabase-auth-provider';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Невалиден имейл адрес'),
  password: z.string().min(1, 'Паролата е задължителна'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      setIsLoading(true);
      await signIn(data.email, data.password);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="email" className="text-slate-400 font-bold uppercase text-[10px] tracking-widest ml-1">
            Имейл Адрес
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-main transition-colors">
              <Mail className="h-5 w-5" />
            </div>
            <Input
              id="email"
              placeholder="vashat_email@mail.com"
              type="email"
              className="pl-12 h-14 bg-slate-900/50 border-slate-800 focus:border-main/50 focus:ring-main/20 rounded-xl text-white placeholder:text-slate-600 transition-all"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between px-1">
            <Label htmlFor="password" className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              Парола
            </Label>
            <Link
              href="/forgot-password"
              className="text-[10px] font-bold text-main uppercase tracking-wider hover:underline"
            >
              Забравена парола?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-main transition-colors">
              <Lock className="h-5 w-5" />
            </div>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              className="pl-12 h-14 bg-slate-900/50 border-slate-800 focus:border-main/50 focus:ring-main/20 rounded-xl text-white placeholder:text-slate-600 transition-all"
              autoComplete="current-password"
              disabled={isLoading}
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            size='lg'
            type="submit"
            disabled={isLoading}
            className='w-full h-16 bg-main hover:bg-main/90 text-black font-black uppercase tracking-widest rounded-xl text-sm shadow-lg shadow-main/10 group overflow-hidden relative'
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Вход в профила
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/5"></div>
          </Button>
        </motion.div>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center text-sm"
      >
        <span className="text-slate-500">Нямате профил?</span>{' '}
        <Link href="/sign-up" className="text-white font-bold hover:text-main transition-colors underline underline-offset-4 decoration-main/30 hover:decoration-main">
          Създайте го тук
        </Link>
      </motion.div>
    </div>
  );
}
