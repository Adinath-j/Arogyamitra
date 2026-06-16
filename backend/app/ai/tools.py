import httpx
from app.utils.config import settings

def get_youtube_link(query: str) -> str:
    """
    Tool function to return a YouTube video link for an exercise search term.
    This can be exposed to the LLM via tool calling.
    """
    api_key = settings.YOUTUBE_API_KEY
    fallback = f"https://youtube.com/results?search_query={query.replace(' ', '+')}"
    
    if not api_key or api_key == "your_youtube_api_key_here":
        return fallback
        
    try:
        r = httpx.get(
            "https://www.googleapis.com/youtube/v3/search",
            params={"part": "snippet", "q": f"{query} proper form", "key": api_key, "maxResults": 1, "type": "video"},
            timeout=5.0,
        )
        r.raise_for_status()
        items = r.json().get("items", [])
        if items:
            return f"https://www.youtube.com/watch?v={items[0]['id']['videoId']}"
    except Exception as e:
        print(f"YouTube search error: {e}")
        pass
        
    return fallback
