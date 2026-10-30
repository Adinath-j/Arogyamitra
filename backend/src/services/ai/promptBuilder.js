export class PromptBuilder {
  static calculateBmi(weightKg, heightCm) {
    if (!weightKg || !heightCm || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  }

  static calculateBmr(weightKg, heightCm, age, gender) {
    if (!weightKg || !heightCm || !age || !gender) return null;
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    const g = gender.toLowerCase();
    if (g.startsWith('m')) {
      bmr += 5;
    } else if (g.startsWith('f')) {
      bmr -= 161;
    } else {
      return null;
    }
    return Math.round(bmr);
  }

  static getUserContext(user) {
    if (!user) {
      return 'No specific user profile provided. Give general, safe advice.';
    }

    const contextLines = [
      `User Profile for ${user.name || 'User'}:`,
      `- Age: ${user.age || 'Unknown'}`,
      `- Gender: ${user.gender || 'Unknown'}`,
      `- Primary Goal: ${user.goal ? user.goal.replace(/_/g, ' ') : 'General Health'}`,
      `- Diet Preference: ${user.diet_preference || 'Any'}`,
      `- Daily Time Availability: ${user.time_availability || 'Unknown'} minutes`,
    ];

    if (user.allergies) {
      contextLines.push(`- Allergies/Restrictions: ${user.allergies}`);
    }

    const fitnessLevel = user.fitness_level || 'Unknown';
    if (fitnessLevel && fitnessLevel !== 'Unknown') {
      contextLines.push(`- Fitness Level: ${fitnessLevel}`);
    }

    if (user.weight && user.height) {
      contextLines.push(`- Weight: ${user.weight} kg`);
      contextLines.push(`- Height: ${user.height} cm`);

      const bmi = this.calculateBmi(user.weight, user.height);
      if (bmi) {
        const category =
          bmi < 18.5
            ? 'Underweight'
            : bmi < 25
            ? 'Normal'
            : bmi < 30
            ? 'Overweight'
            : 'Obese';
        contextLines.push(`- BMI: ${bmi} (${category})`);
      }

      const bmr = this.calculateBmr(user.weight, user.height, user.age, user.gender);
      if (bmr) {
        contextLines.push(`- Basal Metabolic Rate (BMR): ~${bmr} kcal/day`);

        let multiplier = 1.2;
        if (fitnessLevel.toLowerCase() === 'intermediate') {
          multiplier = 1.375;
        } else if (fitnessLevel.toLowerCase() === 'advanced') {
          multiplier = 1.55;
        }

        const tdee = Math.round(bmr * multiplier);
        contextLines.push(`- Est. Daily Calorie Needs (TDEE): ~${tdee} kcal/day`);
      }

      const waterLiters = Math.round(user.weight * 0.035 * 10) / 10;
      contextLines.push(`- Est. Daily Baseline Water Need: ~${waterLiters} Liters (Increase if sweating/active)`);

      let proteinMultiplier = 0.8;
      const goal = (user.goal || '').toLowerCase();
      if (goal.includes('muscle') || goal.includes('strength') || fitnessLevel.toLowerCase() === 'advanced') {
        proteinMultiplier = 1.8;
      } else if (goal.includes('weight_loss') || goal.includes('loss') || fitnessLevel.toLowerCase() === 'intermediate') {
        proteinMultiplier = 1.2;
      }

      const proteinG = Math.round(user.weight * proteinMultiplier);
      contextLines.push(`- Est. Daily Protein Target: ~${proteinG}g`);
    }

    return contextLines.join('\n');
  }

  static buildChatSystemPrompt(user = null, userStatus = null, currentWorkout = null, currentMeal = null) {
    const basePrompt = `You are AROMI (ArogyaMitra), an intelligent, empathetic, and highly personalized AI health and wellness coach. Your goal is to provide medical-grade quality advice that feels like a 1-on-1 coaching session.

### CORE PRINCIPLES:
1. **PERSONALIZE EVERY RESPONSE**: NEVER give generic advice. Always anchor your answers directly to the user's specific context (Weight, Height, Age, Goals, calculated BMR, BMI, Water needs, etc. provided below). Explicitly mention their stats in your reasoning (e.g., 'Given your weight of X kg and goal of Y...').
2. **EXPLAIN THE 'WHY'**: Do not just output a number or a simple instruction. Explain how it was calculated (using the provided context values), why it matters for their specific body, and what factors can change it.
3. **IMPROVE FORMATTING**: Use headings (###), bold text for key metrics, and bullet points to break down your response into logical sections (e.g., Personalized Recommendation, The Science/Calculation, Factors to Consider, Actionable Tips). Avoid dense paragraphs.
4. **NATURAL & CONVERSATIONAL TONE**: Speak like a supportive human expert. Be warm, professional, and encouraging. AVOID repetitive filler like 'A common recommendation is...' or 'Generally speaking...'. Provide the personalized advice first.
5. **NEVER EXPOSE INTERNAL MEMORY**: You must NEVER mention previous profile values, cached values, retrieved memory context, or internal calculations. The context provided below is the ONLY absolute source of truth. NEVER compare current values to past ones. Answer natively without revealing that context was injected.
6. **ACTIONABLE ADVICE**: Always conclude with 1-2 practical, easy-to-implement tips related to their question.
7. **COMPACT & CLEAN FORMAT**: Keep responses concise, scannable, and clean (aim for 2-3 short sections, under 180 words total). Avoid unnecessary large tables or repetitive preambles. Focus on immediate, practical clarity.
8. **SAFETY**: Do not provide medical diagnoses. Recommend consulting a doctor for severe symptoms.

CRITICAL: You MUST respond in pure JSON format ONLY. Do not include any text outside the JSON object.
Format your JSON exactly like this:
{
  "reply": "Your beautifully formatted, personalized markdown response goes here.",
  "modified_workout_plan": null, // or a JSON object if you modified their workout plan
  "modified_meal_plan": null // or a JSON object if you modified their meal plan
}`;

    const contextBlocks = [];
    if (user) {
      contextBlocks.push(`--- USER CONTEXT ---\n${this.getUserContext(user)}`);
    }
    if (userStatus) {
      contextBlocks.push(`--- USER STATUS ---\nThe user reported feeling: ${userStatus}`);
    }
    if (currentWorkout) {
      contextBlocks.push(`--- CURRENT WORKOUT PLAN ---\n${typeof currentWorkout === 'object' ? JSON.stringify(currentWorkout) : currentWorkout}`);
    }
    if (currentMeal) {
      contextBlocks.push(`--- CURRENT MEAL PLAN ---\n${typeof currentMeal === 'object' ? JSON.stringify(currentMeal) : currentMeal}`);
    }

    if (contextBlocks.length > 0) {
      contextBlocks.push('------------------');
      const fullContext = contextBlocks.join('\n\n');
      return `${basePrompt}\n\n${fullContext}\n\nYou can use the context provided to answer the user's questions or modify their plans if asked.`;
    }

    return basePrompt;
  }

  static buildWorkoutPrompt(user) {
    const userContext = this.getUserContext(user);
    const pref = user.workout_preference || 'home';
    let equipmentRule = '2. The user has access to gym equipment. You can include standard gym exercises.';
    if (pref === 'home') {
      equipmentRule = '2. CRITICAL: The user is working out at home. DO NOT include ANY gym equipment (like barbells, machines, cables, heavy dumbbells). Only use bodyweight or household items.';
    } else if (pref === 'outdoor') {
      equipmentRule = '2. CRITICAL: The user is working out outdoors. Focus on bodyweight, running, rings, or park equipment.';
    }

    return `You are ArogyaMitra, an expert fitness coach specializing in Indian users.

Create a detailed 7-day workout plan based EXACTLY on the user's profile below:

--- USER CONTEXT ---
${userContext}
------------------

RULES:
1. Tailor intensity to age and goal.
${equipmentRule}
3. Each day must include: day name, focus area, list of exercises (name, sets, reps/duration, rest).
4. Include warm-up and cool-down.
5. Day 7 is always active rest (yoga/stretching).
6. For exercises with video demonstrations, add a "youtube_search" key with a short search term.

Return ONLY valid JSON in this exact structure (no markdown, no explanation):
{
  "plan": [
    {
      "day": "Day 1",
      "focus": "Chest & Triceps",
      "warmup": "5 min brisk walk",
      "exercises": [
        {
          "name": "Push-ups",
          "sets": 3,
          "reps": "12",
          "rest": "60s",
          "youtube_search": "push-up proper form"
        }
      ],
      "cooldown": "5 min stretching"
    }
  ]
}`;
  }

  static buildMealPrompt(user) {
    const userContext = this.getUserContext(user);
    const allergiesNote = user.allergies ? `Avoid: ${user.allergies}.` : '';

    return `You are ArogyaMitra, an expert Indian nutritionist and dietitian.

Create a detailed 7-day Indian meal plan based EXACTLY on the user's profile below:

--- USER CONTEXT ---
${userContext}
------------------

RULES:
1. All meals must be traditional Indian dishes.
2. Include: breakfast, mid-morning snack, lunch, evening snack, dinner.
3. Add approximate calories for each meal.
4. Keep total daily calories appropriate for the goal (deficit for weight loss, surplus for muscle gain).
5. Respect diet type strictly (no meat for veg/vegan). ${allergiesNote}

Return ONLY valid JSON in this exact structure (no markdown, no explanation):
{
  "plan": [
    {
      "day": "Day 1",
      "total_calories": 1800,
      "meals": {
        "breakfast": { "dish": "Poha", "calories": 350, "notes": "with peanuts" },
        "mid_morning": { "dish": "Banana + Almonds", "calories": 200, "notes": "" },
        "lunch": { "dish": "Dal Tadka + Roti + Sabzi", "calories": 500, "notes": "2 rotis" },
        "evening": { "dish": "Sprouts Chaat", "calories": 150, "notes": "" },
        "dinner": { "dish": "Khichdi + Raita", "calories": 400, "notes": "light dinner" }
      }
    }
  ]
}`;
  }
}
