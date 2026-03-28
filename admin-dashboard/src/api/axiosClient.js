import axios from 'axios'

const api = axios.create({
  baseURL: '/api',           // proxied to http://localhost:8001 via vite.config.js
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid – clear storage and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    // For all other errors, let the calling component handle it
    return Promise.reject(error)
  }
)

export default api
