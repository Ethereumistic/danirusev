import { getTestimonials } from "@/lib/api/testimonials";
import { TestimonialsCarousel } from "./testimonials-carousel";

/**
 * Async wrapper component that fetches testimonials data
 * This component is designed to be wrapped in Suspense for streaming
 */
export async function TestimonialsWrapper() {
    const testimonials = await getTestimonials();

    return <TestimonialsCarousel testimonials={testimonials} />;
}
