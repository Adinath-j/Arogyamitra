import { searchYoutube } from '../services/youtube/youtubeService.js';

export async function search(req, res, next) {
  try {
    const { query, max_results = 5 } = req.body;
    const results = await searchYoutube(query, parseInt(max_results, 10));
    return res.json({ results });
  } catch (err) {
    return res.status(500).json({ detail: `YouTube search failed: ${err.message}` });
  }
}
