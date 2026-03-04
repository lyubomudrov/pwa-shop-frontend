import { api } from './api'

export const cartService = {
  getCart: (userId) => api.get(`/cart/${userId}`),
  addToCart: (userId, productId, quantity) =>
    api.post(`/cart/add?userId=${userId}&productId=${productId}&quantity=${quantity}`),
  removeItem: (cartItemId) => api.delete(`/cart/item/${cartItemId}`)
}
