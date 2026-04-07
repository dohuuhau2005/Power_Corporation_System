import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem('user'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,

  setAuthenticated: (status) => set({ isAuthenticated: status }),
  
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
  
  logout: () => {
    localStorage.removeItem('user')
    // Token cookie sẽ tự động bị xóa bởi server
    set({ isAuthenticated: false, user: null })
  }
}))
