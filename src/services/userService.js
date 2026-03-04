import { api } from './api'

export const userService = {
  create: (user) => api.post('/users', user),
  getById: (id) => api.get(`/users/${id}`)
}
