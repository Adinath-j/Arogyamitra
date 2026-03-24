import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 90_000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('arogyamitra-auth')
    if (stored) {
      const { state } = JSON.parse(stored)
      if (state?.user?.access_token) {
        config.headers.Authorization = `Bearer ${state.user.access_token}`
      }
    }
  } catch { /* ignore */ }
  return config
})

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register: (data) => apiClient.post('/auth/register', data).then(r => r.data),
  login: (data)    => apiClient.post('/auth/login', new URLSearchParams(data), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(r => r.data),
  me: ()           => apiClient.get('/auth/me').then(r => r.data),
  updateProfile: (data) => apiClient.put('/auth/me', data).then(r => r.data),
}

// ── Workout ──────────────────────────────────────────────────
export const workoutApi = {
  generate:    ()     => apiClient.post('/workout/generate').then(r => r.data),
  getActive:   ()     => apiClient.get('/workout/active').then(r => r.data),
  logExercise: (data) => apiClient.post('/workout/log-exercise', data).then(r => r.data),
}

// ── Nutrition ────────────────────────────────────────────────
export const nutritionApi = {
  generate:  ()     => apiClient.post('/nutrition/generate').then(r => r.data),
  getActive: ()     => apiClient.get('/nutrition/active').then(r => r.data),
  logMeal:   (data) => apiClient.post('/nutrition/log-meal', data).then(r => r.data),
}

// ── Chat ─────────────────────────────────────────────────────
export const chatApi = {
  send: (messages, sessionId) =>
    apiClient.post('/chat/', { messages, session_id: sessionId }).then(r => r.data),
}

// ── Health ───────────────────────────────────────────────────
export const healthApi = {
  submitAssessment: (data) => apiClient.post('/health-assessment/assessment/submit', data).then(r => r.data),
  analyze:          (data) => apiClient.post('/health-assessment/analyze', data).then(r => r.data),
  getLatest:        ()     => apiClient.get('/health-assessment/latest').then(r => r.data),
}

// ── Progress ─────────────────────────────────────────────────
export const progressApi = {
  log:     (data)      => apiClient.post('/progress/log', data).then(r => r.data),
  history: (days = 30) => apiClient.get(`/progress/history?days=${days}`).then(r => r.data),
  stats:   ()          => apiClient.get('/progress/stats').then(r => r.data),
}

// ── YouTube ──────────────────────────────────────────────────
export const youtubeApi = {
  search: (query, maxResults = 3) =>
    apiClient.post('/youtube/search', { query, max_results: maxResults }).then(r => r.data),
}

// ── Recipes ──────────────────────────────────────────────────
export const recipeApi = {
  search: (query, diet, maxResults = 5) =>
    apiClient.post('/recipes/search', { query, diet, max_results: maxResults }).then(r => r.data),
}

// ── Calendar ─────────────────────────────────────────────────
export const calendarApi = {
  getAuthUrl:  ()       => apiClient.get('/calendar/auth-url').then(r => r.data),
  saveTokens:  (tokens) => apiClient.post('/calendar/save-tokens', tokens).then(r => r.data),
  sync: (workoutPlanId, startDate) =>
    apiClient.post('/calendar/sync', { workout_plan_id: workoutPlanId, start_date: startDate }).then(r => r.data),
}

export default apiClient