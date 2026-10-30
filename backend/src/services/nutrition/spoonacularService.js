import axios from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export async function generateSpoonacularMealPlan(targetCalories, diet, excludeIngredients = '') {
  if (!env.SPOONACULAR_API_KEY) {
    return { error: 'Missing SPOONACULAR_API_KEY in environment variables.' };
  }

  const url = 'https://api.spoonacular.com/mealplanner/generate';
  const params = {
    apiKey: env.SPOONACULAR_API_KEY,
    timeFrame: 'week',
    targetCalories,
    diet: diet ? diet.toLowerCase() : '',
    exclude: excludeIngredients || '',
  };

  try {
    const response = await axios.get(url, { params, timeout: 10000 });
    const rawPlan = response.data;

    const formattedPlan = { plan: [] };
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    daysOfWeek.forEach((dayKey, i) => {
      if (rawPlan.week && rawPlan.week[dayKey]) {
        const dayData = rawPlan.week[dayKey];
        const nutrients = dayData.nutrients || {};
        const meals = dayData.meals || [];

        const dayObj = {
          day: `Day ${i + 1} (${dayKey.charAt(0).toUpperCase() + dayKey.slice(1)})`,
          total_calories: nutrients.calories || targetCalories,
          macros: {
            protein: `${nutrients.protein || 0}g`,
            fat: `${nutrients.fat || 0}g`,
            carbohydrates: `${nutrients.carbohydrates || 0}g`,
          },
          meals: {},
        };

        const mealTypes = ['breakfast', 'lunch', 'dinner'];
        meals.forEach((meal, j) => {
          const mealName = j < mealTypes.length ? mealTypes[j] : `snack_${j}`;
          const sourceUrl =
            meal.sourceUrl ||
            `https://spoonacular.com/recipes/${(meal.title || '').replace(/\s+/g, '-')}-${meal.id}`;

          dayObj.meals[mealName] = {
            dish: meal.title || 'Unknown Dish',
            ready_in_minutes: meal.readyInMinutes || 0,
            servings: meal.servings || 1,
            recipe_link: sourceUrl,
          };
        });

        formattedPlan.plan.push(dayObj);
      }
    });

    if (formattedPlan.plan.length === 0) {
      return { error: 'Failed to parse Spoonacular response', raw: rawPlan };
    }

    return formattedPlan;
  } catch (e) {
    logger.warn(`Spoonacular lookup failed: ${e.message}`);
    return { error: e.message };
  }
}

export async function searchRecipes(query, diet = null, maxResults = 5) {
  if (!env.SPOONACULAR_API_KEY) {
    return [{ error: 'Missing SPOONACULAR_API_KEY' }];
  }

  const params = {
    apiKey: env.SPOONACULAR_API_KEY,
    query,
    number: maxResults,
    addRecipeInformation: true,
  };
  if (diet) params.diet = diet;

  try {
    const res = await axios.get('https://api.spoonacular.com/recipes/complexSearch', { params, timeout: 10000 });
    return (res.data.results || []).map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image,
      ready_in_minutes: item.readyInMinutes,
      servings: item.servings,
    }));
  } catch (e) {
    logger.error(`Recipe search error: ${e.message}`);
    return [{ error: e.message }];
  }
}

export async function getRecipeDetails(recipeId) {
  if (!env.SPOONACULAR_API_KEY) {
    return { error: 'Missing SPOONACULAR_API_KEY' };
  }

  try {
    const res = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
      params: { apiKey: env.SPOONACULAR_API_KEY, includeNutrition: true },
      timeout: 10000,
    });
    return res.data;
  } catch (e) {
    logger.error(`Recipe details error: ${e.message}`);
    return { error: e.message };
  }
}
