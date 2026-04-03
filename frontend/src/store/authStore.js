import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem('token'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token'),

  setAuthenticated: (status) => set({ isAuthenticated: status }),
  
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
  
  setToken: (token) => {
    localStorage.setItem('token', token)
    set({ token })
  },
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ isAuthenticated: false, user: null, token: null })
  }
}))
