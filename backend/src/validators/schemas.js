import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().min(1, 'Email is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  full_name: z.string().optional().default(''),
  age: z.coerce.number().optional().nullable(),
  gender: z.string().optional().default('male'),
  height: z.coerce.number().optional().nullable(),
  weight: z.coerce.number().optional().nullable(),
  fitness_level: z.string().optional().default('beginner'),
  fitness_goal: z.string().optional().default('weight_loss'),
  workout_preference: z.string().optional().default('home'),
  diet_preference: z.string().optional().default('vegetarian'),
  allergies: z.string().optional().default(''),
  time_availability: z.coerce.number().optional().default(45),
});

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const UserCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.coerce.number().min(10).max(100),
  gender: z.string().min(1, 'Gender is required'),
  goal: z.string().min(1, 'Goal is required'),
  diet_type: z.string().min(1, 'Diet type is required'),
  allergies: z.string().optional().default(''),
  time_availability: z.coerce.number().optional().default(45),
});

export const ProgressLogCreateSchema = z.object({
  weight: z.coerce.number().optional().nullable(),
  calories_burned: z.coerce.number().optional().default(0.0),
  workout_duration: z.coerce.number().optional().default(0),
  steps: z.coerce.number().optional().default(0),
  water_intake: z.coerce.number().optional().default(0.0),
  sleep_hours: z.coerce.number().optional().default(0.0),
  mood: z.string().optional().default('Good'),
});

export const HealthAssessmentSubmitSchema = z.object({
  bmi: z.coerce.number().optional().nullable(),
  injuries: z.string().optional().nullable(),
  medications: z.string().optional().nullable(),
  health_conditions: z.string().optional().nullable(),
  assessment_data: z.any().optional().nullable(),
});

export const HealthAnalysisRequestSchema = z.object({
  assessment_id: z.coerce.number().optional().nullable(),
  answers: z.any().optional().nullable(),
});

export const GenerateWorkoutRequestSchema = z.object({
  user_id: z.coerce.number().optional().nullable(),
});

export const GenerateMealRequestSchema = z.object({
  user_id: z.coerce.number().optional().nullable(),
});

export const ArogyaCoachMessageSchema = z.object({
  user_id: z.coerce.number(),
  message: z.string().min(1, 'Message is required'),
  user_status: z.string().optional().default('normal'),
  current_workout_plan: z.any().optional().nullable(),
  current_meal_plan: z.any().optional().nullable(),
});

export const ChatMessageSchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).optional(),
  session_id: z.any().optional().nullable(),
  message: z.string().optional(),
});

export const YouTubeSearchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  max_results: z.coerce.number().optional().default(5),
});

export const RecipeSearchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  diet: z.string().optional().nullable(),
  max_results: z.coerce.number().optional().default(5),
});

export const MealLogCreateSchema = z.object({
  meal_type: z.string().min(1, 'Meal type is required'),
  description: z.string().optional().nullable(),
  calories: z.coerce.number().optional().nullable(),
});

export const CalendarSyncRequestSchema = z.object({
  workout_plan_id: z.coerce.number(),
  start_date: z.string().min(1, 'Start date is required'),
});
