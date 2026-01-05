import { Metadata } from 'next';
import { LegalNavigation } from '@/components/legal/legal-navigation';
import { LEGAL_PROSE_CLASSES } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Политика за поверителност | Dani Rusev 11',
    description: 'Политика за поверителност и защита на личните данни на Dani Rusev 11.',
};

export default function PrivacyPage() {
    return (
        <div className="bg-slate-950 text-foreground min-h-screen relative overflow-hidden">
            {/* Decorative background glows */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-main/15 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-main/15 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16 md:py-24 relative z-10">
                <div className="mb-16 border-b border-white/5 pb-8">
                    <h1 className="text-5xl sm:text-7xl font-black uppercase italic tracking-tighter text-alt dark:text-main mb-6">
                        Политика за поверителност
                    </h1>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-8 h-[2px] bg-main/50" />
                        <p className="text-sm font-bold uppercase tracking-widest italic">Последна актуализация: 5 януари 2026 г.</p>
                    </div>
                </div>

                <article className={LEGAL_PROSE_CLASSES}>
                    <h2>1. ВЪВЕДЕНИЕ</h2>
                    <p>
                        Тази Политика за поверителност обяснява как „Dani Rusev 11“ събира, използва и защитава вашата лична информация, когато използвате нашия уебсайт <a href="https://danirusev.com">https://danirusev.com</a>. Моля, прочетете внимателно тази политика, за да разберете как обработваме вашите данни.
                    </p>

                    <h2>2. КАКВА ИНФОРМАЦИЯ СЪБИРАМЕ?</h2>
                    <p>Можем да събираме следната информация, когато посещавате и използвате нашия уебсайт:</p>
                    <ul>
                        <li>Лични данни, като име, имейл адрес, телефонен номер и адрес (при поръчка или регистрация).</li>
                        <li>Техническа информация, като IP адрес, тип браузър, операционна система и данни за вашата активност на уебсайта.</li>
                        <li>Бисквитки и подобни технологии за проследяване.</li>
                    </ul>

                    <h2>3. КАК ИЗПОЛЗВАМЕ ВАШАТА ИНФОРМАЦИЯ</h2>
                    <p>„Dani Rusev 11“ използва вашата лична информация за следните цели:</p>
                    <ul>
                        <li>За предоставяне на услуги и продукти (дрифт преживявания, мърчандайз), които заявявате.</li>
                        <li>За комуникация с вас относно въпроси, свързани с вашите поръчки или запитвания.</li>
                        <li>За подобряване на нашия уебсайт и услугите ни.</li>
                        <li>За маркетингови и рекламни цели (само ако сте дали изрично съгласие).</li>
                    </ul>

                    <h2>4. СПОДЕЛЯНЕ НА ИНФОРМАЦИЯ С ТРЕТИ ЛИЦА</h2>
                    <p>Можем да споделяме вашата лична информация с трети лица само в следните случаи:</p>
                    <ul>
                        <li>С доставчици на услуги (напр. Stripe за плащания, куриерски фирми), които ни помагат да предоставяме нашите услуги.</li>
                        <li>Съгласно законодателството или ако се изисква от съдебни или регулаторни органи.</li>
                    </ul>

                    <h2>5. ЗАЩИТА НА ВАШАТА ИНФОРМАЦИЯ</h2>
                    <p>
                        „Dani Rusev 11“ предприема необходимите мерки, за да гарантира сигурността на вашата лична информация чрез използването на подходящи технически и организационни средства за защита на данните (SSL сертификати, сигурни разплащателни шлюзове).
                    </p>

                    <h2>6. ВАШИТЕ ПРАВА</h2>
                    <p>Имате следните права във връзка с вашите лични данни:</p>
                    <ul>
                        <li>Право на достъп до вашите лични данни.</li>
                        <li>Право на коригиране на неточни данни.</li>
                        <li>Право на изтриване на вашите данни („правото да бъдеш забравен“).</li>
                        <li>Право на ограничаване на обработката.</li>
                        <li>Право на възражение срещу обработката.</li>
                        <li>Право на преносимост на данните.</li>
                    </ul>
                    <p>За да упражните тези права, моля свържете се с нас на: <a href="mailto:contact@danirusev.com">contact@danirusev.com</a></p>

                    <h2>7. БИСКВИТКИ</h2>
                    <p>
                        Нашият уебсайт използва бисквитки, за да подобри вашето потребителско преживяване и да събира информация за използването на уебсайта. Повече информация можете да намерите в нашата <a href="/cookies">Политика за бисквитки</a>.
                    </p>

                    <h2>8. ПРОМЕНИ В ПОЛИТИКАТА</h2>
                    <p>
                        „Dani Rusev 11“ си запазва правото да променя тази Политика за поверителност по всяко време. Всяка промяна ще бъде публикувана на този уебсайт.
                    </p>

                    <h2>9. КОНТАКТ С НАС</h2>
                    <p>Ако имате въпроси относно тази Политика или за това как обработваме вашите лични данни, можете да се свържете с нас на:</p>
                    <ul>
                        <li><strong>Име на фирмата:</strong> Dani Rusev 11</li>
                        <li><strong>ЕИК:</strong> 6969696969</li>
                        <li><strong>Адрес:</strong> str. Dancho Kmeta 69</li>
                        <li><strong>Имейл:</strong> contact@danirusev.com</li>
                    </ul>
                </article>

                <LegalNavigation
                    leftLink={{ href: '/terms', label: 'Общи условия' }}
                    rightLink={{ href: '/cookies', label: 'Бисквитки' }}
                />
            </div>
        </div>
    );
}
