'use client'

import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Send, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../providers/supabase-auth-provider'

const contactFormSchema = z.object({
  name: z.string().min(1, { message: 'Името е задължително.' }),
  email: z
    .string()
    .min(1, { message: 'Имейлът е задължителен.' })
    .email({ message: 'Въведеният имейл е невалиден.' }),
  message: z.string().min(1, { message: 'Съобщението е задължително.' }),
  hiddenspam: z
    .string()
    .max(0, { message: 'This field must be empty.' })
    .optional(),
})

type ContactFormInputs = z.infer<typeof contactFormSchema>

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { user, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactFormSchema),
  })

  useEffect(() => {
    if (user) {
      setValue('name', user.user_metadata.name || '')
      setValue('email', user.email || '')
    }
  }, [user, setValue])

  const onValid: SubmitHandler<ContactFormInputs> = async (data) => {
    setIsSubmitting(true)
    setIsSuccess(false)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string)
      })
      formData.append('access_key', process.env.NEXT_PUBLIC_WEB3_FORMS_KEY!)

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        toast.success('Успех!', {
          description: 'Съобщението Ви е изпратено успешно!',
        })
        // Only reset the message field if the user is logged in
        if (user) {
          setValue('message', '')
        } else {
          reset()
        }
        // Reset success state after animation
        setTimeout(() => setIsSuccess(false), 3000)
      } else {
        console.error('Error submitting form:', result)
        toast.error('Грешка', {
          description: result.message || 'Възникна грешка при изпращането.',
        })
      }
    } catch (error) {
      console.error('An error occurred:', error)
      toast.error('Грешка', {
        description: 'Възникна грешка при изпращането.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onInvalid: SubmitErrorHandler<ContactFormInputs> = (errors) => {
    console.error('Validation Errors:', errors)
    Object.values(errors).forEach((error) => {
      if (error.message) {
        toast.error('Грешка при валидация', {
          description: error.message,
        })
      }
    })
  }

  useEffect(() => {
    if (isSubmitSuccessful && !user) {
      reset()
    } else if (isSubmitSuccessful && user) {
      setValue('message', '')
    }
  }, [isSubmitSuccessful, reset, user, setValue])

  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)} className="space-y-6">
      {/* Honeypot */}
      <input
        type="text"
        autoComplete="off"
        tabIndex={-1}
        className="hidden"
        style={{ display: 'none' }}
        {...register('hiddenspam')}
      />

      {/* Name Field */}
      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="text-slate-300 font-medium text-sm uppercase tracking-wide"
        >
          Име
        </Label>
        <Input
          id="name"
          placeholder="Вашето име"
          {...register('name')}
          disabled={isLoading || !!user}
          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-main focus:ring-main/20 h-12 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
        />
        {errors.name && (
          <p className="text-sm text-red-400 font-medium">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-slate-300 font-medium text-sm uppercase tracking-wide"
        >
          Имейл
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          {...register('email')}
          disabled={isLoading || !!user}
          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-main focus:ring-main/20 h-12 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
        />
        {errors.email && (
          <p className="text-sm text-red-400 font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <Label
          htmlFor="message"
          className="text-slate-300 font-medium text-sm uppercase tracking-wide"
        >
          Съобщение
        </Label>
        <Textarea
          id="message"
          placeholder="Напишете Вашето съобщение тук..."
          rows={6}
          {...register('message')}
          disabled={isSubmitting}
          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-main focus:ring-main/20 rounded-xl resize-none disabled:opacity-70 disabled:cursor-not-allowed"
        />
        {errors.message && (
          <p className="text-sm text-red-400 font-medium">{errors.message.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full h-14 text-base font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 ${isSuccess
            ? 'bg-main hover:bg-main/90 text-black shadow-[0_0_40px_-10px_rgba(16,185,129,0.8)]'
            : 'bg-main hover:bg-main/90 text-black shadow-[0_0_40px_-10px_rgba(16,185,129,0.6)] hover:scale-[1.02]'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Изпращане...
            </span>
          ) : isSuccess ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Изпратено успешно!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Изпрати съобщението
            </span>
          )}
        </Button>
      </div>

      {/* Privacy note */}
      <p className="text-xs text-slate-500 text-center pt-2">
        Изпращайки това съобщение, Вие се съгласявате с нашата политика за поверителност.
      </p>
    </form>
  )
}
