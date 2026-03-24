from fastapi import APIRouter, Depends, HTTPException
from app.utils.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import YouTubeSearchRequest
from app.services.youtube_service import search_youtube

router = APIRouter(prefix="/youtube", tags=["YouTube"])


@router.post("/search")
async def search(
    req: YouTubeSearchRequest,
    user: User = Depends(get_current_user),
):
    try:
        results = await search_youtube(req.query, req.max_results)
        return {"results": results}
    except Exception as e:
        raise HTTPException(500, f"YouTube search failed: {str(e)}")