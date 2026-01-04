"use server"

export interface YouTubeVideo {
    title: string;
    videoId: string;
    thumbnail: string;
    authorName: string;
    url: string;
}

export async function getLatestYouTubeVideos(channelHandle: string = '@danirusev11', limit: number = 6): Promise<YouTubeVideo[]> {
    try {
        // Fetching the /videos tab directly ensures we only get regular horizontal videos
        const url = `https://www.youtube.com/${channelHandle}/videos`;
        const response = await fetch(url, {
            next: { revalidate: 3600 },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch YouTube videos page');

        const html = await response.text();

        // Extract ytInitialData JSON from the HTML
        const dataMatch = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
        if (!dataMatch) {
            console.error('Could not find ytInitialData in YouTube HTML');
            return [];
        }

        const data = JSON.parse(dataMatch[1]);

        // Navigate through the nested structure to find video items
        // contents -> twoColumnBrowseResultsRenderer -> tabs -> tabRenderer -> content -> richGridRenderer -> contents
        const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs;
        if (!tabs) return [];

        const videosTab = tabs.find((tab: any) =>
            tab.tabRenderer?.title === "Videos" ||
            tab.tabRenderer?.content?.richGridRenderer
        );

        const contents = videosTab?.tabRenderer?.content?.richGridRenderer?.contents;
        if (!contents) return [];

        const videos: YouTubeVideo[] = [];

        for (const item of contents) {
            const video = item.richItemRenderer?.content?.videoRenderer;
            if (video && video.videoId) {
                videos.push({
                    title: video.title.runs[0].text,
                    videoId: video.videoId,
                    thumbnail: `https://i1.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`,
                    authorName: 'Dani Rusev',
                    url: `https://www.youtube.com/watch?v=${video.videoId}`
                });
            }
            if (videos.length >= limit) break;
        }

        return videos;
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        return [];
    }
}
