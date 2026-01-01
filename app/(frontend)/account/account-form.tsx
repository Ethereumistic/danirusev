"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { updateShippingInfo, FormState } from "./actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { User } from "@supabase/supabase-js"
import { Profile } from "@/types/supabase"
import { motion } from "framer-motion"
import { Mail, Calendar, User as UserIcon, MapPin, Phone, Globe, Package, Ticket } from "lucide-react"
import Link from "next/link"

interface AccountFormProps {
  user: User
  profile: Profile | null
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full md:w-auto h-12 px-8 bg-main hover:bg-main/90 text-black font-black uppercase tracking-wider transition-all hover:scale-[1.02]"
    >
      {pending ? "Запазване..." : "Запази промените →"}
    </Button>
  )
}

export function AccountForm({ user, profile }: AccountFormProps) {
  const initialState: FormState = { success: false, message: null, fieldErrors: null }
  const [state, formAction] = useActionState(updateShippingInfo, initialState)

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message)
    } else if (!state.success && state.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* User Info Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-main/20 border-4 border-main/30 flex items-center justify-center mb-3 md:mb-4">
              <UserIcon className="h-8 w-8 md:h-10 md:w-10 text-main" />
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter text-center leading-tight">
              {user.user_metadata?.full_name || user.user_metadata?.name || 'Клиент'}
            </h3>
            <p className="text-slate-500 font-bold text-[10px] tracking-widest uppercase">
              Дрифт Ентусиаст
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 transition-colors group-hover:border-main/50">
                <Mail className="h-5 w-5 text-main" />
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Имейл</Label>
                <p className="text-sm font-bold text-white truncate max-w-[180px]">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 transition-colors group-hover:border-main/50">
                <Calendar className="h-5 w-5 text-main" />
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Регистриран на</Label>
                <p className="text-sm font-bold text-white">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <Button variant="main" className=" bg-main absolute bottom-8 left-8 ">
            <Link href="/orders" className="flex items-center text-black gap-2"><Package className="h-4 w-4 " />Поръчки</Link>
          </Button>
          <Button variant="main" className="bg-main absolute bottom-8 right-8 ">
            <Link href="/vouchers" className="flex items-center text-black gap-2"><Ticket className="h-4 w-4" />Ваучери</Link>
          </Button>
        </div>

      </div>

      {/* Shipping Info Form */}
      <div className="lg:col-span-8">
        <form action={formAction} className="h-full">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <div className="mb-8">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Информация за доставка</h2>
              <p className="text-sm text-slate-500 font-medium">Тези данни се използват за вашите поръчки и доставка на физически продукти.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-6">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Име и Фамилия
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={profile?.full_name || ''}
                    className="bg-slate-950 border-white/5 text-white pl-10 h-12 focus:border-main transition-all rounded-xl"
                  />
                </div>
                {state.fieldErrors?.fullName && (
                  <p className="text-xs text-red-500 font-bold">{state.fieldErrors.fullName}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label htmlFor="phoneNumber" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Тел. Номер
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    defaultValue={profile?.phone_number || ''}
                    className="bg-slate-950 border-white/5 text-white pl-10 h-12 focus:border-main transition-all rounded-xl"
                  />
                </div>
                {state.fieldErrors?.phoneNumber && (
                  <p className="text-xs text-red-500 font-bold">{state.fieldErrors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Адрес
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="address"
                    name="address"
                    defaultValue={profile?.address || ''}
                    className="bg-slate-950 border-white/5 text-white pl-10 h-12 focus:border-main transition-all rounded-xl"
                  />
                </div>
                {state.fieldErrors?.address && (
                  <p className="text-xs text-red-500 font-bold">{state.fieldErrors.address}</p>
                )}
              </div>



              <div className="grid grid-cols-2 md:grid-cols-3 col-span-2 gap-x-4 md:gap-x-8 gap-y-6">
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Град
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={profile?.city || ''}
                    className="bg-slate-950 border-white/5 text-white h-12 focus:border-main transition-all rounded-xl px-4"
                  />
                  {state.fieldErrors?.city && (
                    <p className="text-xs text-red-500 font-bold">{state.fieldErrors.city}</p>
                  )}
                </div>

                <div className="space-y-2 col-span-1">
                  <Label htmlFor="postalCode" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Пощенски Код
                  </Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    defaultValue={profile?.postal_code || ''}
                    className="bg-slate-950 border-white/5 text-white h-12 focus:border-main transition-all rounded-xl px-4"
                  />
                  {state.fieldErrors?.postalCode && (
                    <p className="text-xs text-red-500 font-bold">{state.fieldErrors.postalCode}</p>
                  )}
                </div>

                <div className="space-y-2 col-span-2 lg:col-span-1">
                  <Label htmlFor="country-display" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Държава
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                      <img src="https://flagcdn.com/bg.svg" alt="Bulgaria" className="w-5 h-auto rounded-sm" />
                    </div>
                    <Input
                      id="country-display"
                      value="България"
                      disabled
                      className="bg-slate-900 border-white/5 text-white pl-12 h-12 disabled:opacity-100 disabled:cursor-default rounded-xl font-bold"
                    />
                    <input type="hidden" name="country" value="България" />
                  </div>
                </div>
              </div>



            </div>

            <div className="mt-10 pt-8 border-t border-white/5 flex justify-end">
              <SubmitButton />
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
