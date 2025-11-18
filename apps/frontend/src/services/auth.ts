import { api } from './api.js'
import type { User } from '@events-tracker/shared'

interface AuthResponse {
  user: User
  session: {
    id: string
    expiresAt: string
  }
}

export async function login(email: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', { email })
}

export async function register(email: string, name: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', { email, name })
}

export async function logout(): Promise<{ success: boolean }> {
  return api.post<{ success: boolean }>('/auth/logout')
}

export async function getSession(): Promise<{ user: User } | null> {
  try {
    return await api.get<{ user: User }>('/auth/me')
  } catch (error) {
    return null
  }
}
