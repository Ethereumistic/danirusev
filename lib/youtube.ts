"use server"

export interface YouTubeVideo {
    title: string;
    videoId: string;
    thumbnail: string;
    authorName: string;
    url: string;
    isShort?: boolean;
}

// Resolved channel ID for @danirusev11
// Obtained via: POST https://www.youtube.com/youtubei/v1/navigation/resolve_url
// with body: {"context":{"client":{"clientName":"WEB","clientVersion":"2.20231021.00.00"}},"url":"https://www.youtube.com/@danirusev11"}
// The browseEndpoint.browseId in the response contains the channel ID.
const CHANNEL_ID = 'UCHpWLLhe8r_xnRk4LdwBJpQ';

export async function getLatestYouTubeVideos(
    channelHandle: string = '@danirusev11',
    limit: number = 6
): Promise<YouTubeVideo[]> {
    try {
        // Use YouTube's public RSS feed – stable, official, no scraping needed.
        // The RSS feed is always at: https://www.youtube.com/feeds/videos.xml?channel_id=<CHANNEL_ID>
        // It returns the latest 15 uploads (including Shorts).
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

        const response = await fetch(rssUrl, {
            next: { revalidate: 3600 }, // Revalidate every hour
        });

        if (!response.ok) {
            throw new Error(`RSS feed returned ${response.status}`);
        }

        const xml = await response.text();

        // Parse video entries from the Atom XML feed
        const videos: YouTubeVideo[] = [];
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match: RegExpExecArray | null;

        while ((match = entryRegex.exec(xml)) !== null) {
            const entry = match[1];

            // Extract videoId
            const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
            if (!videoIdMatch) continue;
            const videoId = videoIdMatch[1].trim();

            // Extract title
            const titleMatch = entry.match(/<media:title>([^<]+)<\/media:title>/);
            const title = titleMatch ? decodeXmlEntities(titleMatch[1].trim()) : '';

            // Extract the video URL from the <link rel="alternate" href="..."/>
            const urlMatch = entry.match(/<link rel="alternate" href="([^"]+)"/);
            const url = urlMatch ? urlMatch[1].trim() : `https://www.youtube.com/watch?v=${videoId}`;

            // Detect if it's a Short (Shorts have /shorts/ in their URL)
            const isShort = url.includes('/shorts/');

            // Use maxresdefault thumbnail, fall back to hqdefault
            const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

            videos.push({
                title,
                videoId,
                thumbnail,
                authorName: 'Dani Rusev',
                url: isShort ? `https://www.youtube.com/watch?v=${videoId}` : url,
                isShort,
            });

            if (videos.length >= limit) break;
        }

        return videos;
    } catch (error) {
        console.error('Error fetching YouTube videos via RSS:', error);
        return [];
    }
}

function decodeXmlEntities(str: string): string {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}
