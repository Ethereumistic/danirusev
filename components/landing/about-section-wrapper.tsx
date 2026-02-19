import { getLatestYouTubeVideos, type YouTubeVideo } from '@/lib/youtube'
import { AboutSection } from './about-section'

export async function AboutSectionWrapper() {
    const youtubeVideos = await getLatestYouTubeVideos('@danirusev11', 11)
    
    return <AboutSection initialVideos={youtubeVideos} />
}
