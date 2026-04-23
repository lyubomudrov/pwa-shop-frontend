import { defineStore } from 'pinia'
import { api } from '../services/api'
import { userService } from '../services/userService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isInitialized: false,
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,

    isAdmin: (state) => {
      const role = state.user?.role

      return role === 'ADMIN' || role === 'ROLE_ADMIN'
    },
  },

  actions: {
    setToken(token) {
      this.token = token || null

      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },

    async login(data) {
      this.isLoading = true

      try {
        const res = await api.post('/auth/login', data)
        this.setToken(res.data.token)
        await this.fetchMe()
      } finally {
        this.isLoading = false
      }
    },

    async register(data) {
      this.isLoading = true

      try {
        const res = await api.post('/auth/register', data)
        this.setToken(res.data.token)
        await this.fetchMe()
      } finally {
        this.isLoading = false
      }
    },

    async fetchMe() {
      if (!this.token) {
        this.user = null
        return null
      }

      try {
        const res = await userService.getMe()
        this.user = res.data
        return res.data
      } catch (error) {
        this.logout()
        throw error
      }
    },

    async initAuth() {
      if (!this.token) {
        this.user = null
        this.isInitialized = true
        return
      }

      try {
        await this.fetchMe()
      } finally {
        this.isInitialized = true
      }
    },

    logout() {
      this.setToken(null)
      this.user = null
      this.isInitialized = true
    },
  },
})