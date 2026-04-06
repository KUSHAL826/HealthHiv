import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
})

// Attach token on every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hv_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hv_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
