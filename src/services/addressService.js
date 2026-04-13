import { api } from './api'

export const addressService = {
  getMyAddresses: () => api.get('/addresses/my'),

  createAddress: (address) => api.post('/addresses', address),

  deleteAddress: (addressId) => api.delete(`/addresses/${addressId}`)
}