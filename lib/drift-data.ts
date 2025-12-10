// lib/drift-data.ts
import { Car, Trophy, Timer, Gauge, ShieldCheck, Fuel, CarTaxiFront, Smartphone, Gift } from "lucide-react";

export type PatternType = 'taxi-checker' | 'tyre-pattern' | 'none';
export type ThemeColor = 'taxi' | 'rent' | 'mix' | 'main';

export type AdditionalItem = {
    id: string;
    name: string;
    icon: string; // Lucide icon name
    price: number;
    description: string;
    isLocation?: boolean; // Flag for location items (single choice)
    isVoucher?: boolean; // Flag for voucher items (single choice)
};

export type DriftExperience = {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    price: number;
    currency: string;
    duration: string; // e.g. "60 min"
    carModel: string;
    horsePower: number;
    tires: number; // approximate tires burned per session
    description: string;
    images: string[];
    program: { time: string; activity: string; description: string }[];
    included: string[];
    notIncluded: string[];
    additionalItems?: AdditionalItem[]; // Optional purchasable add-ons
    iconName: 'CarTaxiFront' | 'Car' | 'Gauge'; // Icon identifier
    pattern: PatternType; // Visual pattern identifier
    themeColor: ThemeColor; // Theme color for this experience
};

export const DRIFT_EXPERIENCES: DriftExperience[] = [
    {
        id: "1",
        slug: "drift-taxi",
        title: "Дрифт Такси",
        subtitle: "Пасажерско Изживяване",
        price: 325,
        currency: "BGN",
        duration: "60 мин",
        carModel: "BMW E46 V6",
        horsePower: 450,
        tires: 4,
        description: "Седнете на пасажерската седалка до Дани Русев и усетете истинската G-сила. Без теория, само чист адреналин.",
        images: [
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/taxi/0.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/taxi/2.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/taxi/3.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/taxi/4.png"

        ],
        program: [
            {
                time: "00:00", activity: "Брифинг", description: "Запознаване с мерките за безопасност и екипировката."
            },
            { time: "00:15", activity: "Екипиране", description: "Слагане на каска и закопчаване на 4-точковите колани." },
            { time: "00:20", activity: "Drift Session", description: "40 минути интензивно возене на планинско трасе." },
        ],
        included: ["Професионален пилот", "Гориво и Гуми", "Каска и боне", "Видео заснемане (GoPro)"],
        notIncluded: ["Транспорт до пистата", "Храна и напитки"],
        additionalItems: [
            { id: "gopro", name: "GoPro Заснемане", icon: "Video", price: 50, description: "Професионално заснемане на цялата сесия" },
            { id: "extra-tires", name: "Допълнителни Гуми", icon: "Disc", price: 120, description: "2 екстра гуми за по-дълго возене" },
            { id: "voucher-digital", name: "Ваучер Дигитален", icon: "Smartphone", price: 0, description: "Дигитален ваучер изпратен по имейл", isVoucher: true },
            { id: "voucher-physical", name: "Ваучер Физически", icon: "Gift", price: 10, description: "Физически ваучер с доставка", isVoucher: true },
            { id: "location-tryavna", name: "Писта Трявна", icon: "MapPin", price: 0, description: "Обезопасено трасе в близост до град Трявна", isLocation: true },
            { id: "location-sevlievo", name: "Дрифт Трак Севлиево", icon: "MapPin", price: 0, description: "Професионална писта в Севлиево", isLocation: true },
        ],
        iconName: 'CarTaxiFront',
        pattern: 'taxi-checker',
        themeColor: 'taxi',
    },
    {
        id: "2",
        slug: "rent-a-drift-car",
        title: "Наеми Дрифтачка",
        subtitle: "Карай Сам",
        price: 649,
        currency: "BGN",
        duration: "60 мин",
        carModel: "BMW E36 V6",
        horsePower: 400,
        tires: 4,
        description: "Поемете контрола. Под напътствията на Дани, вие ще се научите да контролирате хаоса.",
        images: [
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/rent/1.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/rent/2.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/rent/3.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/rent/4.png"

        ],
        program: [
            { time: "00:00", activity: "Теория", description: "Основи на дрифта, работа с волан и газ." },
            { time: "00:20", activity: "Практика", description: "Упражнения за иницииране на дрифт и 'донъти'." },
            { time: "00:50", activity: "Свободно каране", description: "Връзване на завои по трасето." },
        ],
        included: ["Инструктор (Дани Русев)", "Наем на подготвен автомобил", "Гориво и Гуми", "Сертификат"],
        notIncluded: ["Депозит за щети", "Транспорт до пистата"],
        additionalItems: [
            { id: "gopro", name: "GoPro Заснемане", icon: "Video", price: 50, description: "Професионално заснемане на цялата сесия" },
            { id: "extra-tires", name: "Допълнителни Гуми", icon: "Disc", price: 120, description: "2 екстра гуми за по-дълго возене" },
            { id: "voucher-digital", name: "Ваучер Дигитален", icon: "Smartphone", price: 0, description: "Дигитален ваучер изпратен по имейл", isVoucher: true },
            { id: "voucher-physical", name: "Ваучер Физически", icon: "Gift", price: 10, description: "Физически ваучер с доставка", isVoucher: true },
            { id: "location-tryavna", name: "Писта Трявна", icon: "MapPin", price: 0, description: "Обезопасено трасе в близост до град Трявна", isLocation: true },
            { id: "location-sevlievo", name: "Дрифт Трак Севлиево", icon: "MapPin", price: 0, description: "Професионална писта в Севлиево", isLocation: true },
        ],
        iconName: 'Car',
        pattern: 'tyre-pattern',
        themeColor: 'rent',
    },
    {
        id: "3",
        slug: "drift-mix",
        title: "Дрифт Микс",
        subtitle: "Двата свята",
        price: 649,
        currency: "BGN",
        duration: "60 мин",
        carModel: "BMW E36 V6",
        horsePower: 400,
        tires: 4,
        description: "Усетете дрифта от двете страни - от пасажерското място и от шофьорската седалка!",
        images: [
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/mix/2.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/mix/1.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/mix/3.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/mix/4.png",
            "https://cdn.jsdelivr.net/gh/Ethereumistic/danirusev-assets/experiences/mix/5.png",

        ],
        program: [
            { time: "00:00", activity: "Теория", description: "Основи на дрифта, работа с волан и газ." },
            { time: "00:20", activity: "Практика", description: "Упражнения за иницииране на дрифт и 'донъти'." },
            { time: "00:50", activity: "Свободно каране", description: "Връзване на завои по трасето." },
        ],
        included: ["Инструктор (Дани Русев)", "Наем на подготвен автомобил", "Гориво и Гуми", "Сертификат"],
        notIncluded: ["Депозит за щети", "Транспорт до пистата"],
        additionalItems: [
            { id: "gopro", name: "GoPro Заснемане", icon: "Video", price: 50, description: "Професионално заснемане на цялата сесия" },
            { id: "extra-tires", name: "Допълнителни Гуми", icon: "Disc", price: 120, description: "2 екстра гуми за по-дълго возене" },
            { id: "voucher-digital", name: "Ваучер Дигитален", icon: "Smartphone", price: 0, description: "Дигитален ваучер изпратен по имейл", isVoucher: true },
            { id: "voucher-physical", name: "Ваучер Физически", icon: "Gift", price: 10, description: "Физически ваучер с доставка", isVoucher: true },
            { id: "location-tryavna", name: "Писта Трявна", icon: "MapPin", price: 0, description: "Обезопасено трасе в близост до град Трявна", isLocation: true },
            { id: "location-sevlievo", name: "Дрифт Трак Севлиево", icon: "MapPin", price: 0, description: "Професионална писта в Севлиево", isLocation: true },
        ],
        iconName: 'Car',
        pattern: 'tyre-pattern',
        themeColor: 'mix',
    },
    // Add 'mix' here...
];