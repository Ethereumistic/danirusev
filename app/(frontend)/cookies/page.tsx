import { Metadata } from 'next';
import { LegalNavigation } from '@/components/legal/legal-navigation';
import { LEGAL_PROSE_CLASSES } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Политика за бисквитки | Dani Rusev 11',
    description: 'Политика за бисквитки (Cookies) на уебсайта на Dani Rusev 11.',
};

export default function CookiesPage() {
    return (
        <div className="bg-slate-950 text-foreground min-h-screen relative overflow-hidden">
            {/* Decorative background glows */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-main/15 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-main/15 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16 md:py-24 relative z-10">
                <div className="mb-16 border-b border-white/5 pb-8">
                    <h1 className="text-5xl sm:text-7xl font-black uppercase italic tracking-tighter text-alt dark:text-main mb-6">
                        Политика за бисквитки
                    </h1>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-8 h-[2px] bg-main/50" />
                        <p className="text-sm font-bold uppercase tracking-widest italic">Последна актуализация: 5 януари 2026 г.</p>
                    </div>
                </div>

                <article className={LEGAL_PROSE_CLASSES}>
                    <h2>1. КАКВО ПРЕДСТАВЛЯВАТ „БИСКВИТКИТЕ“?</h2>
                    <p>
                        „Бисквитките“ (cookies) са малки текстови файлове, които се съхраняват на вашето устройство (компютър, мобилен телефон или таблет), когато посещавате даден уебсайт. Те помагат на сайта да разпознае вашето устройство и да запомни информация за вашите предпочитания или минали действия.
                    </p>

                    <h2>2. КАК ИЗПОЛЗВАМЕ БИСКВИТКИТЕ?</h2>
                    <p>Нашият уебсайт <a href="https://danirusev.com">danirusev.com</a> използва бисквитки за следните цели:</p>
                    <ul>
                        <li><strong>Функционални бисквитки:</strong> Необходими за правилното функциониране на сайта (напр. за поддържане на вход в профила или количка за пазаруване).</li>
                        <li><strong>Статистически бисквитки:</strong> Помагат ни да разберем как посетителите използват сайта, като събират и докладват анонимна информация.</li>
                        <li><strong>Маркетингови бисквитки:</strong> Използват се за проследяване на посетителите в уебсайтовете с цел показване на реклами, които са подходящи и привлекателни за отделния потребител.</li>
                    </ul>

                    <h2>3. УПРАВЛЕНИЕ И ИЗТРИВАНЕ НА БИСКВИТКИ</h2>
                    <p>
                        Вие можете да контролирате и/или изтривате бисквитките по всяко време чрез настройките на вашия браузър. Можете да изтриете всички бисквитки, които вече са съхранени на вашия компютър, а също така можете да настроите повечето браузъри да ги блокират.
                    </p>
                    <p>
                        Обърнете внимание, че ако блокирате бисквитките, това може да повлияе на функционалността на нашия сайт и може да се наложи ръчно да настройвате някои предпочитания всеки път, когато ни посещавате.
                    </p>

                    <h2>4. ПОВЕЧЕ ИНФОРМАЦИЯ</h2>
                    <p>
                        За повече информация относно това как управляваме вашите лични данни, моля прегледайте нашата <a href="/privacy">Политика за поверителност</a>. Ако имате въпроси относно използването на бисквитки на нашия сайт, свържете се с нас на <a href="mailto:contact@danirusev.com">contact@danirusev.com</a>.
                    </p>
                </article>

                <LegalNavigation
                    leftLink={{ href: '/terms', label: 'Общи условия' }}
                    rightLink={{ href: '/privacy', label: 'Политика за поверителност' }}
                />
            </div>
        </div>
    );
}
