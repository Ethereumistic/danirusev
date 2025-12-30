'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, MessageSquare, Send, Clock, Flame } from 'lucide-react';
import { ContactForm } from '@/components/contact/contact-form';

export default function ContactClient() {
  const contactDetails = [
    {
      icon: Mail,
      label: 'Имейл',
      value: 'contact@danirusev.com',
      href: 'mailto:contact@danirusev.com',
    },
    {
      icon: Phone,
      label: 'Телефон',
      value: '+359 88 272 6020',
      href: 'tel:+359882726020',
    },
    {
      icon: MapPin,
      label: 'Локация',
      value: 'Автомобилен Пoлигон, гр. Трявна',
      href: 'https://maps.app.goo.gl/pPgQekKHASUHBxY59',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-main/5 via-transparent to-taxi/5" />

      {/* Hero Section */}
      <section className="relative py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Pre-title badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 bg-main/10 border border-main/30 px-6 py-2 rounded-full backdrop-blur-md"
          >
            <MessageSquare className="w-4 h-4 text-main" />
            <span className="text-main font-bold uppercase tracking-wider text-sm">
              Свържете се с нас
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter italic mb-6 leading-none"
          >
            Имате <span className="text-main">Въпроси?</span>
            <br className="hidden sm:block" />
            <span className="text-main">Ние Имаме</span> Отговори
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Нашият екип е на Ваше разположение за всякакви запитвания относно
            преживянията, резервациите или специални оферти.
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-slate-400"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-main" />
              <span className="font-medium text-sm sm:text-base">Отговор до 24 часа</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-slate-700 rounded-full" />
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-main" />
              <span className="font-medium text-sm sm:text-base">Персонални консултации</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact Information Column */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Section Title */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight italic mb-4">
                  Информация за <span className="text-main">Контакт</span>
                </h2>
                <p className="text-slate-400">
                  Свържете се директно с нас по удобен за Вас начин
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {contactDetails.map((detail, idx) => (
                  <motion.a
                    key={detail.label}
                    href={detail.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="block group"
                  >
                    <Card className="bg-slate-900/50 backdrop-blur-md border-slate-800 hover:border-main/50 transition-all duration-300 group-hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]">
                      <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 bg-main/10 border-2 border-main/30 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:border-main transition-all duration-300">
                          <detail.icon className="w-6 h-6 sm:w-7 sm:h-7 text-main" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                            {detail.label}
                          </p>
                          <p className="text-white font-bold text-base sm:text-lg group-hover:text-main transition-colors truncate">
                            {detail.value}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Contact Form Column */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <Card className="bg-slate-900/50 backdrop-blur-md border-slate-800 relative overflow-hidden">
                {/* Decorative corner accent */}

                <CardContent className="p-6 sm:p-8">
                  {/* Form Header */}
                  <div className="mb-8">
                    <div className="inline-flex items-center gap-2 bg-main/10 border border-main/30 px-4 py-1.5 rounded-full mb-4">
                      <Send className="w-4 h-4 text-main" />
                      <span className="text-main text-sm font-bold uppercase tracking-wider">
                        Изпратете Запитване
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight italic mb-2">
                      Напишете ни <span className="text-main">Директно</span>
                    </h3>
                    <p className="text-slate-400">
                      Попълнете формата и ние ще се свържем с Вас възможно най-скоро.
                    </p>
                  </div>
                  <ContactForm />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-main/10 via-transparent to-taxi/10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-6">
            Готови ли сте за <span className="text-main">Адреналин</span>?
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Не чакайте повече. Свържете се с нас днес и резервирайте Вашето
            незабравимо дрифт преживяване!
          </p>

          {/* Quick contact buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+359882726020"
              className="inline-flex items-center gap-2 bg-main hover:bg-main/90 text-black font-extrabold uppercase tracking-wider h-14 px-8 text-base rounded-xl shadow-[0_0_40px_-10px_rgba(16,185,129,0.6)] transition-all hover:scale-105"
            >
              <Phone className="w-5 h-5" />
              Обади се сега
            </a>
            <a
              href="mailto:contact@danirusev.com"
              className="inline-flex items-center gap-2 border-2 border-main/50 text-main hover:text-white hover:bg-main/10 font-bold uppercase tracking-wide h-14 px-8 text-base rounded-xl transition-all"
            >
              <Mail className="w-5 h-5" />
              Изпрати имейл
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  );
}