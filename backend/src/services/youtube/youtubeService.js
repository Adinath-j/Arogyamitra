import axios from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export async function searchYoutube(query, maxResults = 5) {
  const fallbackUrl = `https://youtube.com/results?search_query=${encodeURIComponent(query)}`;

  if (!env.YOUTUBE_API_KEY || env.YOUTUBE_API_KEY === 'your_youtube_api_key_here') {
    return [
      {
        title: query,
        url: fallbackUrl,
      },
    ];
  }

  const url = 'https://www.googleapis.com/youtube/v3/search';
  const params = {
    part: 'snippet',
    q: `${query} proper form tutorial`,
    key: env.YOUTUBE_API_KEY,
    maxResults,
    type: 'video',
  };

  try {
    const response = await axios.get(url, { params, timeout: 5000 });
    const data = response.data;
    const results = (data.items || []).map((item) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    return results.length > 0 ? results : [{ title: query, url: fallbackUrl }];
  } catch (e) {
    logger.warn(`YouTube lookup failed for '${query}': ${e.message}`);
    return [{ title: query, url: fallbackUrl }];
  }
}

export async function getYoutubeLink(query) {
  const fallback = `https://youtube.com/results?search_query=${encodeURIComponent(query)}`;
  if (!env.YOUTUBE_API_KEY || env.YOUTUBE_API_KEY === 'your_youtube_api_key_here') {
    return fallback;
  }

  try {
    const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${query} proper form`,
        key: env.YOUTUBE_API_KEY,
        maxResults: 1,
        type: 'video',
      },
      timeout: 5000,
    });
    const items = res.data.items || [];
    if (items.length > 0 && items[0]?.id?.videoId) {
      return `https://www.youtube.com/watch?v=${items[0].id.videoId}`;
    }
  } catch (e) {
    logger.warn(`YouTube link search error: ${e.message}`);
  }

  return fallback;
}
