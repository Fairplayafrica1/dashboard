const { google } = require('googleapis');
const https = require('https');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  secureProtocol: 'TLSv1_2_method',
});

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
  http2: false,
});

const searchYouTube = async (query, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await youtube.search.list(
        {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: 10,
          order: 'relevance',
        },
        { httpsAgent }
      );

      return response.data.items.map((item) => ({
        youtubeVideoId: item.id.videoId,
        youtubeVideoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        youtubeTitle: item.snippet.title,
        youtubeChannel: item.snippet.channelTitle,
        youtubeChannelId: item.snippet.channelId,
        youtubeThumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        youtubePublishedAt: item.snippet.publishedAt,
      }));
    } catch (error) {
      console.error(`YouTube search attempt ${attempt} failed:`, error.message);
      if (attempt === retries) return [];
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  return [];
};

module.exports = { searchYouTube };