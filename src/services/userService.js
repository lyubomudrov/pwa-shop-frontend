import { api } from './api'

export const userService = {
  getMe: () => api.get('/users/me'),
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`)
}