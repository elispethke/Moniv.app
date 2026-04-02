import { create } from 'zustand'
import type { AuthUser, AuthSession } from '@/types/user'
import { authService } from '@/services/authService'

interface AuthStore {
  user: AuthUser | null
  session: AuthSession | null
  isAuthenticated: boolean
  /** True once the initial getSession() call has resolved. */
  isInitialized: boolean

  /** Called once on app mount to hydrate state from Supabase's persisted session. */
  initialize: () => Promise<void>

  /** Sync state from an onAuthStateChange event. */
  setSession: (session: AuthSession | null) => void

  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName?: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const { data } = await authService.getSession()
      set({
        session: data.session,
        user: data.session?.user ?? null,
        isAuthenticated: !!data.session,
        isInitialized: true,
      })
    } catch {
      // Supabase unreachable (misconfigured URL, network error, etc.).
      // Mark as initialized with no session so the app renders normally.
      set({ isInitialized: true, isAuthenticated: false })
    }
  },

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
    }),

  login: async (email, password) => {
    const { data, error } = await authService.signIn(email, password)
    if (error) throw error
    set({
      user: data.user,
      session: data.session,
      isAuthenticated: !!data.session,
    })
  },

  signup: async (email, password, fullName) => {
    const { data, error } = await authService.signUp(email, password, fullName)
    if (error) throw error
    set({
      user: data.user,
      session: data.session,
      isAuthenticated: !!data.session,
    })
  },

  logout: async () => {
    await authService.signOut()
    set({ user: null, session: null, isAuthenticated: false })
  },
}))
