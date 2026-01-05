import { Testimonial } from '@/types/payload-types'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
/**
 * Get all testimonials from Payload CMS
 */
export async function getTestimonials() {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
        collection: 'testimonials',
        limit: 100,
        depth: 2, // Include related media for avatars
    })

    return result.docs as unknown as Testimonial[]
}
