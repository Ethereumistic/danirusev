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
import { Mail, Loader2, Send, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Невалиден имейл адрес'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      await resetPassword(data.email);
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
                Изпрати линк
                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/5"></div>
          </Button>
        </motion.div>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center text-sm"
      >
        <Link href="/sign-in" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Върнете се към Вход
        </Link>
      </motion.div>
    </div>
  );
}
