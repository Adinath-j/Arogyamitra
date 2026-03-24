import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — AI generation can be slow
})

// ─── User ──────────────────────────────────────────────────────────────────

export const createUser = (data) =>
  client.post('/user/', data).then((r) => r.data)

export const getUser = (userId) =>
  client.get(`/user/${userId}`).then((r) => r.data)

// ─── Plans ─────────────────────────────────────────────────────────────────

export const generateWorkout = (userId) =>
  client.post('/generate-workout/', { user_id: userId }).then((r) => r.data)

export const generateMeal = (userId) =>
  client.post(`/nutrition/generate-by-id?user_id=${userId}`).then((r) => r.data)


export const getLatestPlans = (userId) =>
  client.get(`/plans/${userId}/latest`).then((r) => r.data)

export const getAllPlans = (userId) =>
  client.get(`/plans/${userId}`).then((r) => r.data)

// ─── Chat ──────────────────────────────────────────────────────────────────

export const sendChatMessage = (userId, message, status, workoutPlan, mealPlan) =>
  client.post('/aromi-chat/', {
    user_id: userId,
    message,
    user_status: status || 'normal',
    current_workout_plan: workoutPlan || null,
    current_meal_plan: mealPlan || null,
  }).then((r) => r.data)
