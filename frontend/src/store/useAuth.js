import { create } from 'zustand'
import Cookies from 'js-cookie'

export const useAuth = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    Cookies.remove('token')
    set({ user: null })
  },
  setToken: (token) => {
    if (token) Cookies.set('token', token, { expires: 7 })
    else Cookies.remove('token')
  }
}))
