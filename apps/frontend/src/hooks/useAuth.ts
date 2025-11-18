import { create } from 'zustand'
import type { User } from '@events-tracker/shared'
import * as authService from '../services/auth.js'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string) => Promise<void>
  register: (email: string, name: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string) => {
    try {
      set({ isLoading: true, error: null })
      const response = await authService.login(email)
      set({ user: response.user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      })
      throw error
    }
  },

  register: async (email: string, name: string) => {
    try {
      set({ isLoading: true, error: null })
      const response = await authService.register(email, name)
      set({ user: response.user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false,
      })
      throw error
    }
  },

  logout: async () => {
    try {
      await authService.logout()
      set({ user: null, isAuthenticated: false })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  },

  checkSession: async () => {
    try {
      set({ isLoading: true })
      const session = await authService.getSession()
      if (session) {
        set({ user: session.user, isAuthenticated: true })
      }
    } catch (error) {
      console.error('Session check failed:', error)
    } finally {
      set({ isLoading: false })
    }
  },
}))
