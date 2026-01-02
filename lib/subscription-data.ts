import { CheckCircle, Star, Crown, type LucideIcon } from "lucide-react"

export interface SubscriptionTier {
  name: string
  id: string
  price: {
    monthly: string
    yearly: string
  }
  // These will be used for Stripe integration
  monthlyPriceId?: string
  yearlyPriceId?: string
  description: string
  features: string[]
  icon: LucideIcon
  isMostPopular: boolean
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    name: "Фен на скоростта",
    id: "tier-fan",
    price: { monthly: "9.99 €", yearly: "99.99 €" },
    // monthlyPriceId: 'price_fan_monthly', // Add when setting up Stripe
    // yearlyPriceId: 'price_fan_yearly',
    description: "За истинските фенове, които искат достъп до ексклузивно съдържание.",
    features: [
      "Достъп до всички частни YouTube видеа",
      "Ранен достъп до нови публични видеа",
      "Специална роля в Discord сървъра",
    ],
    icon: CheckCircle,
    isMostPopular: false,
  },
  {
    name: "Pro Пилот",
    id: "tier-pro",
    price: { monthly: "24.99 €", yearly: "249.99 €" },
    // monthlyPriceId: 'price_pro_monthly',
    // yearlyPriceId: 'price_pro_yearly',
    description: "За тези, които искат да са част от отбора и да се възползват от отстъпки.",
    features: [
      'Всичко от "Фен на скоростта"',
      "Ексклузивен промо код за -20% отстъпка",
      "Месечни Q&A сесии с Дани Русев",
      "Вашето име във финалните надписи",
    ],
    icon: Star,
    isMostPopular: true,
  },
  {
    name: "Легенда на пистата",
    id: "tier-legend",
    price: { monthly: "49.99 €", yearly: "499.99 €" },
    // monthlyPriceId: 'price_legend_monthly',
    // yearlyPriceId: 'price_legend_yearly',
    description: "Пълният VIP пакет. Станете партньор и печелете с нас.",
    features: [
      'Всичко от "Pro Пилот"',
      "Партньорска програма с изплащания",
      "Ексклузивен мърч при всяко издание",
      "Приоритетен достъп до преживявания",
    ],
    icon: Crown,
    isMostPopular: false,
  },
]
