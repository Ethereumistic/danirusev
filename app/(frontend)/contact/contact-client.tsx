'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export default function ContactClient() {
  const contactDetails = [
    {
      icon: Mail,
      label: "Имейл",
      value: "contact@danirusev.com",
      href: "mailto:contact@danirusev.com",
    },
    {
      icon: Phone,
      label: "Телефон",
      value: "+359 88 272 6020",
      href: "tel:+359882726020",
    },
    {
      icon: MapPin,
      label: "Локация",
      value: "Автомобилен Пoлигон, гр. Трявна, България",
      href: "https://maps.app.goo.gl/pPgQekKHASUHBxY59",
    },
  ];

  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto max-w-6xl px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-gagalin text-main font-outline tracking-tight sm:text-5xl lg:text-6xl">
            Свържете се с нас
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground">
            Имате въпроси или искате да организирате нещо специално? Нашият екип е на Ваше разположение.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Information */}
          <div className="flex flex-col justify-center space-y-8">
            <h2 className="text-3xl font-bold">Информация за контакт</h2>
            <div className="space-y-6">
              {contactDetails.map((detail) => (
                <a 
                  key={detail.label} 
                  href={detail.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start p-4 rounded-lg transition-colors group hover:bg-muted/50"
                >
                  <div className="flex-shrink-0 bg-main text-alt p-3 rounded-full">
                    <detail.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-semibold text-foreground">{detail.label}</p>
                    <p className="text-muted-foreground group-hover:text-foreground transition-colors">{detail.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Изпратете ни запитване</CardTitle>
                <CardDescription>Попълнете формата по-долу и ние ще се свържем с Вас възможно най-скоро.</CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 