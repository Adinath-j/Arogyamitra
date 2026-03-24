from fastapi import APIRouter, Depends, HTTPException
from app.utils.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import RecipeSearchRequest
from app.services.spoonacular_service import search_recipes, get_recipe_details

router = APIRouter(prefix="/recipes", tags=["Recipes"])


@router.post("/search")
async def search(
    req: RecipeSearchRequest,
    user: User = Depends(get_current_user),
):
    try:
        results = await search_recipes(req.query, req.diet, req.max_results)
        return {"results": results}
    except Exception as e:
        raise HTTPException(500, f"Recipe search failed: {str(e)}")


@router.get("/{recipe_id}")
async def details(
    recipe_id: int,
    user: User = Depends(get_current_user),
):
    try:
        result = await get_recipe_details(recipe_id)
        return result
    except Exception as e:
        raise HTTPException(500, f"Recipe fetch failed: {str(e)}")