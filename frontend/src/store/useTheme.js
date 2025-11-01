import { create } from 'zustand'

export const useTheme = create((set) => ({
  dark: false,
  toggle: () => set(state => ({ dark: !state.dark }))
}))
