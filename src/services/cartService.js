import { api } from './api'

export const cartService = {
  getCart: () => api.get('/cart'),

  addToCart: (productId, quantity) =>
    api.post('/cart/add', {
      productId,
      quantity
    }),

  removeItem: (cartItemId) => api.delete(`/cart/item/${cartItemId}`)
}