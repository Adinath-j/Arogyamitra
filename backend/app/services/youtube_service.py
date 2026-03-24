import os
import httpx
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


async def search_youtube(query: str, max_results: int = 5) -> List[Dict]:
    """
    Fetch YouTube videos for a given query.
    Returns a list of video objects (title + url).
    """

    fallback_url = f"https://youtube.com/results?search_query={query.replace(' ', '+')}"

    # If API key is missing → fallback
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "your_youtube_api_key_here":
        return [
            {
                "title": query,
                "url": fallback_url
            }
        ]

    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": f"{query} proper form tutorial",
        "key": YOUTUBE_API_KEY,
        "maxResults": max_results,
        "type": "video"
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        results = []

        for item in data.get("items", []):
            video_id = item["id"]["videoId"]
            title = item["snippet"]["title"]

            results.append({
                "title": title,
                "url": f"https://www.youtube.com/watch?v={video_id}"
            })

        return results if results else [
            {
                "title": query,
                "url": fallback_url
            }
        ]

    except Exception as e:
        print(f"YouTube lookup failed for '{query}': {e}")

        return [
            {
                "title": query,
                "url": fallback_url
            }
        ]