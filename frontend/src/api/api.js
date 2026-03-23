import axios from 'axios'

const BASE_URL = '/api'

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
  client.post('/generate-meal/', { user_id: userId }).then((r) => r.data)

export const getLatestPlans = (userId) =>
  client.get(`/plans/${userId}/latest`).then((r) => r.data)

export const getAllPlans = (userId) =>
  client.get(`/plans/${userId}`).then((r) => r.data)

// ─── Chat ──────────────────────────────────────────────────────────────────

export const sendChatMessage = (userId, messages) =>
  client.post('/chat/', { user_id: userId, messages }).then((r) => r.data)