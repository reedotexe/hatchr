import axios from 'axios'
import Cookies from 'js-cookie'

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  withCredentials: true,
})

// Attach token from cookie if present
API.interceptors.request.use(config => {
  const token = Cookies.get('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default API
