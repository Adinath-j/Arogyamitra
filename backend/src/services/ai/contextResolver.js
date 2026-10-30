export class ContextExtractor {
  static extract(message) {
    const extracted = {};
    if (!message) return extracted;

    // Weight
    const wMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos|kilograms)\b/i);
    if (wMatch) {
      extracted.weight = parseFloat(wMatch[1]);
    }

    // Height
    const hMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:cm|centimeters)\b/i);
    if (hMatch) {
      extracted.height = parseFloat(hMatch[1]);
    }

    // Age
    const aMatch = message.match(/\b(\d+)\s*(?:years old|yo|years of age)\b/i);
    if (aMatch) {
      extracted.age = parseInt(aMatch[1], 10);
    } else {
      const aMatchIm = message.match(/(?:i am|i'm|age is)\s*(\d{2})\b/i);
      if (aMatchIm) {
        extracted.age = parseInt(aMatchIm[1], 10);
      }
    }

    // Dietary Preference
    const dMatch = message.match(/\b(?:i am|i'm|my diet is|now a|changed to)\s*(?:a\s+|an\s+)?(vegetarian|vegan|pescatarian|keto|paleo)\b/i);
    if (dMatch) {
      extracted.diet_preference = dMatch[1].toLowerCase();
    }

    // Fitness Goal
    const gMatch = message.match(/\b(?:goal is|want to)\s*(weight loss|muscle gain|maintain weight|lose weight|build muscle)\b/i);
    if (gMatch) {
      const goalMap = {
        'lose weight': 'weight_loss',
        'build muscle': 'muscle_gain',
        'maintain weight': 'maintain',
      };
      const val = gMatch[1].toLowerCase();
      extracted.goal = goalMap[val] || val.replace(/\s+/g, '_');
    }

    // Fitness Level
    const fMatch = message.match(/\b(?:i am a|my fitness level is)\s*(beginner|intermediate|advanced)\b/i);
    if (fMatch) {
      extracted.fitness_level = fMatch[1].toLowerCase();
    }

    // Gender
    const genMatch = message.match(/\b(?:i am a)\s*(man|woman|male|female)\b/i);
    if (genMatch) {
      extracted.gender = genMatch[1].toLowerCase();
    }

    return extracted;
  }
}

export class ContextResolver {
  static resolve(user, message = '') {
    const context = {
      name: user.full_name || user.name || '',
      age: user.age,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      fitness_level: user.fitness_level || null,
      goal: user.fitness_goal || user.goal || null,
      diet_preference: user.diet_preference || user.diet_type || null,
      allergies: user.allergies || '',
      workout_preference: user.workout_preference || 'home',
      time_availability: user.time_availability || 45,
    };

    const profileUpdates = {};
    if (!message) {
      return { effectiveContext: context, profileUpdates };
    }

    const extracted = ContextExtractor.extract(message);
    for (const [key, value] of Object.entries(extracted)) {
      if (context[key] !== value) {
        context[key] = value;
        profileUpdates[key] = value;
      }
    }

    return { effectiveContext: context, profileUpdates };
  }
}
