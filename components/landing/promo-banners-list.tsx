import { getPayloadClient } from '@/lib/get-payload'
import type { PromoBanner as PromoBannerType } from '@/types/payload-types'
import { PromoBanner } from './promo-banner'

export async function PromoBannersList() {
    const payload = await getPayloadClient()
    const { docs: promoBanners } = await payload.find({
        collection: 'promo-banners',
        where: { isActive: { equals: true } },
        limit: 10,
    })

    if (!promoBanners || promoBanners.length === 0) return null

    return (
        <>
            {promoBanners.map((banner) => (
                <PromoBanner key={banner.id} banner={banner as unknown as PromoBannerType} />
            ))}
        </>
    )
}
