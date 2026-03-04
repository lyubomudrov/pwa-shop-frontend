import { api } from './api'

export const orderService = {
  createOrder: (userId, addressId) =>
    api.post(`/orders?userId=${userId}&addressId=${addressId}`),
  getOrdersByUser: (userId) => api.get(`/orders/user/${userId}`)
}
