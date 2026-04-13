import { defineStore } from 'pinia'
import { api } from '../services/api'
import { userService } from '../services/userService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isInitialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN'
  },

  actions: {
    async login(data) {
      const res = await api.post('/auth/login', data)

      this.token = res.data.token
      localStorage.setItem('token', res.data.token)

      await this.fetchMe()
    },

    async register(data) {
      const res = await api.post('/auth/register', data)

      this.token = res.data.token
      localStorage.setItem('token', res.data.token)

      await this.fetchMe()
    },

    async fetchMe() {
      if (!this.token) {
        this.user = null
        return
      }

      try {
        const res = await userService.getMe()
        this.user = res.data
      } catch (error) {
        this.logout()
        throw error
      }
    },

    async initAuth() {
      if (!this.token) {
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
      this.token = null
      this.user = null
      this.isInitialized = true

      localStorage.removeItem('token')
    }
  }
})