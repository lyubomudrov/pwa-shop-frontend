import { api } from './api'

export const orderService = {
  createOrder: (addressId) =>
    api.post('/orders', {
      addressId
    }),

  getMyOrders: () => api.get('/orders/my'),

  getById: (orderId) => api.get(`/orders/${orderId}`)
}