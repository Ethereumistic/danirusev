'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const router = useRouter();
    const supabase = createClient();
    const searchParams = useSearchParams();

    useEffect(() => {
        const verifyToken = async () => {
            const tokenHash = searchParams.get('token_hash');

            if (tokenHash) {
                // Verify the hash directly on the page
                const { error } = await supabase.auth.verifyOtp({
                    token_hash: tokenHash,
                    type: 'recovery',
                });

                if (error) {
                    console.error('Verification error:', error);
                    toast.error('Линкът е невалиден или вече е използван.');
                }
            } else {
                // If no token_hash, check if we already have a session
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    toast.error('Липсва активна сесия. Моля, поискайте нов линк за нулиране.');
                }
            }
            setIsCheckingSession(false);
        };

        verifyToken();
    }, [supabase.auth, searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Паролите не съвпадат');
            return;
        }

        if (password.length < 6) {
            toast.error('Паролата трябва да бъде поне 6 символа');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setIsSuccess(true);
            toast.success('Паролата е променена успешно!');

            // Redirect to sign-in or dashboard after a short delay
            setTimeout(() => {
                router.push('/sign-in');
            }, 3000);
        } catch (error: any) {
            toast.error(error.message || 'Възникна грешка при промяна на паролата');
        } finally {
            setIsLoading(false);
        }
    };


    if (isCheckingSession) {
        return (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-main" />
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">
                    Проверка на сесията...
                </p>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
            >
                <div className="mx-auto w-16 h-16 bg-main/20 rounded-full flex items-center justify-center mb-6 border-2 border-main/50 shadow-[0_0_20px_rgba(255,107,0,0.2)]">
                    <Lock className="h-8 w-8 text-main" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Паролата е Променена!</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest max-w-[240px] mx-auto">
                    Вашата парола беше обновена успешно. Ще бъдете пренасочени към вход след малко.
                </p>
                <div className="pt-4">
                    <Button
                        onClick={() => router.push('/sign-in')}
                        className="w-full h-12 bg-main hover:bg-main/90 text-black font-black uppercase tracking-widest rounded-xl transition-all duration-300"
                    >
                        Към Вход
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label
                        htmlFor="password"
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1"
                    >
                        Нова Парола
                    </Label>
                    <div className="relative group">
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="bg-white/5 border-white/10 h-12 rounded-xl px-4 text-white placeholder:text-slate-600 focus:border-main/50 focus:ring-main/20 transition-all duration-300"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label
                        htmlFor="confirmPassword"
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1"
                    >
                        Потвърди Парола
                    </Label>
                    <div className="relative group">
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="bg-white/5 border-white/10 h-12 rounded-xl px-4 text-white placeholder:text-slate-600 focus:border-main/50 focus:ring-main/20 transition-all duration-300"
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-main hover:bg-main/90 text-black font-black uppercase tracking-widest rounded-xl transition-all duration-300 disabled:opacity-50 group"
            >
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <span className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                        Запази Новата Парола
                    </span>
                )}
            </Button>
        </form>
    );
}
