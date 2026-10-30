import { searchRecipes, getRecipeDetails } from '../services/nutrition/spoonacularService.js';

export async function search(req, res, next) {
  try {
    const { query, diet, max_results = 5 } = req.body;
    const results = await searchRecipes(query, diet, parseInt(max_results, 10));
    return res.json({ results });
  } catch (err) {
    return res.status(500).json({ detail: `Recipe search failed: ${err.message}` });
  }
}

export async function details(req, res, next) {
  try {
    const recipeId = parseInt(req.params.recipe_id || req.params.recipeId, 10);
    const result = await getRecipeDetails(recipeId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ detail: `Recipe fetch failed: ${err.message}` });
  }
}
