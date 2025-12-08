"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DriftExperience } from "@/lib/drift-data";
import { PATTERN_COMPONENTS } from "@/components/drift/patterns";

interface DriftBookingSidebarProps {
    experience: DriftExperience;
}

export function DriftBookingSidebar({ experience }: DriftBookingSidebarProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);

    const FormSchema = z.object({
        fullName: z.string().min(2, { message: "Моля въведете име" }),
        email: z.string().email({ message: "Невалиден имейл" }),
        phone: z.string().min(6, { message: "Невалиден телефон" }),
        preferredDate: z.string().optional(),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: { fullName: "", email: "", phone: "", preferredDate: "" },
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            toast.success("Заявката е изпратена!");
        }, 1500);
    }

    if (isSuccess) {
        return (
            <Card className=" border-green-500/50 bg-green-900/20 backdrop-blur-md">
                <CardContent className="py-8 text-center flex flex-col items-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-white">Готово!</h3>
                    <p className="text-slate-300 mt-2">
                        Ще се свържем с вас за потвърждение на <strong>{experience.title}</strong>.
                    </p>
                    <Button variant="outline" className="mt-6 border-green-500 text-green-500 hover:bg-green-500 hover:text-white" onClick={() => setIsSuccess(false)}>
                        Нова заявка
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Get the pattern component for this experience
    const PatternComponent = PATTERN_COMPONENTS[experience.pattern];

    return (
        <div className=" space-y-6">
            <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl overflow-hidden relative">
                {/* Render pattern as a small decorative strip at the top */}
                {PatternComponent && (
                    <div className="absolute top-0 left-0 right-0 h-15 overflow-hidden ">
                        <PatternComponent className="opacity-100 " />
                    </div>
                )}
                <CardHeader className="pb-4 mt-4 border-b border-slate-800 bg-slate-950/50 relative">
                    <div className="pt-2">
                        <div className="flex justify-between items-start mb-2">
                            <span className={
                                experience.themeColor === 'taxi' ? 'text-xs font-bold text-taxi uppercase tracking-widest' :
                                    experience.themeColor === 'rent' ? 'text-xs font-bold text-rent uppercase tracking-widest' :
                                        experience.themeColor === 'mix' ? 'text-xs font-bold text-mix uppercase tracking-widest' :
                                            'text-xs font-bold text-main uppercase tracking-widest'
                            }>
                                Резервация
                            </span>
                            <div className="flex items-center gap-1 text-amber-400">
                                <Trophy className="w-4 h-4" />
                                <span className="text-xs font-bold">Pro Equipment</span>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black text-white italic uppercase tracking-tight">
                            {experience.title}
                        </CardTitle>
                        <p className="text-slate-400 text-sm mt-1">{experience.subtitle}</p>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    {/* Price Display */}
                    <div className="mb-6 flex items-end justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-500">Цена за сесия</span>
                            <span className="text-4xl font-black text-white tracking-tighter">
                                {experience.price}
                                <span className={
                                    experience.themeColor === 'taxi' ? 'text-lg font-bold text-taxi ml-1' :
                                        experience.themeColor === 'rent' ? 'text-lg font-bold text-rent ml-1' :
                                            experience.themeColor === 'mix' ? 'text-lg font-bold text-mix ml-1' :
                                                'text-lg font-bold text-main ml-1'
                                }>
                                    {experience.currency}
                                </span>
                            </span>
                        </div>
                        <div className="bg-slate-800 px-3 py-1 rounded text-xs font-medium text-slate-300">
                            {experience.duration}
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel className="text-slate-300">Имена</FormLabel><FormControl><Input placeholder="Иван Иванов" className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="text-slate-300">Email</FormLabel><FormControl><Input placeholder="email@example.com" className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel className="text-slate-300">Телефон</FormLabel><FormControl><Input placeholder="+359 888 ..." className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600" {...field} /></FormControl><FormMessage /></FormItem>)} />

                            <FormField control={form.control} name="preferredDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Желана дата (Опционално)</FormLabel>
                                    <FormControl>
                                        <Input type="date" className="bg-slate-950 border-slate-800 text-white calendar-invert" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <Button
                                type="submit"
                                className={
                                    experience.themeColor === 'taxi' ? 'w-full h-14 text-lg font-black uppercase tracking-wider bg-taxi hover:bg-taxi/90 text-black transition-all hover:scale-[1.02]' :
                                        experience.themeColor === 'rent' ? 'w-full h-14 text-lg font-black uppercase tracking-wider bg-rent hover:bg-rent/90 text-black transition-all hover:scale-[1.02]' :
                                            experience.themeColor === 'mix' ? 'w-full h-14 text-lg font-black uppercase tracking-wider bg-mix hover:bg-mix/90 text-black transition-all hover:scale-[1.02]' :
                                                'w-full h-14 text-lg font-black uppercase tracking-wider bg-main hover:bg-main/90 text-black transition-all hover:scale-[1.02]'
                                }
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Обработка...</>) : (<span className="flex items-center gap-2">Резервирай <Zap className="w-5 h-5 fill-black" /></span>)}
                            </Button>

                            <p className="text-[10px] text-center text-slate-500">
                                * Плащането се извършва на място или по банк път.
                            </p>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
