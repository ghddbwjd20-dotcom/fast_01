import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || '요청 실패'
    return Promise.reject(new Error(message))
  }
)

// API functions
export const healthCheck = () => api.get('/health')

export const getKPIs = () => api.get('/market/kpis')

export const getTrends = () => api.get('/market/trends')

export const getNews = () => api.get('/market/news')

export const qaChat = (data: { question: string; context?: string }) =>
  api.post('/qa/chat', data)

export const qaSummary = (data: { question: string; context?: string }) =>
  api.post('/qa/summary', data)

export const generateProblems = (data: {
  level: string
  topic: string
  count: number
  style: string
}) => api.post('/problems', data)

export const getRecommendations = (data: {
  topic: string
  level: string
  purpose: string
}) => api.post('/recommend', data)

export const createBookmark = (data: {
  title: string
  url: string
  tags: string[]
  note?: string
}) => api.post('/recommend/bookmark', data)

export const getBookmarks = () => api.get('/recommend/bookmarks')

