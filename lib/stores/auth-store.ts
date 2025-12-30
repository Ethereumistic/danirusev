import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
    userRole: string | null
    userEmail: string | null
    isAuthenticated: boolean
    setUserRole: (role: string | null) => void
    setUserEmail: (email: string | null) => void
    setIsAuthenticated: (isAuth: boolean) => void
    clearAuth: () => void
    // Computed helper
    isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            userRole: null,
            userEmail: null,
            isAuthenticated: false,
            setUserRole: (role) => set({ userRole: role }),
            setUserEmail: (email) => set({ userEmail: email }),
            setIsAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
            clearAuth: () => set({ userRole: null, userEmail: null, isAuthenticated: false }),
            isAdmin: () => get().userRole === 'admin',
        }),
        {
            name: 'auth-storage', // Unique name for localStorage key
            storage: createJSONStorage(() => localStorage), // Use localStorage so it persists across tabs
        }
    )
)
