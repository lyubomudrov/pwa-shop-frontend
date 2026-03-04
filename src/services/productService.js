import { api } from './api'

export const productService = {
  getAll: () => api.get('/products'),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  getById: (id) => api.get(`/products/${id}`)
}
