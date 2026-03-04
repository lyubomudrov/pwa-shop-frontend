import { api } from './api'

export const reviewService = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (review) => api.post('/reviews', review)
}
