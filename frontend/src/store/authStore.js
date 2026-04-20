import { create } from 'zustand'

const parseStoredExpiry = () => {
  const raw = localStorage.getItem('sessionExpiry')
  if (!raw) {
    return null
  }

  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

export const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem('user'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  sessionExpiry: parseStoredExpiry(),

  setAuthenticated: (status) => set({ isAuthenticated: status }),
  
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },

  setSessionExpiry: (expiryMs) => {
    if (expiryMs === null || expiryMs === undefined) {
      localStorage.removeItem('sessionExpiry')
      set({ sessionExpiry: null })
      return
    }

    localStorage.setItem('sessionExpiry', String(expiryMs))
    set({ sessionExpiry: expiryMs })
  },
  
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('sessionExpiry')
    // Token cookie sẽ tự động bị xóa bởi server
    set({ isAuthenticated: false, user: null, sessionExpiry: null })
  }
}))
