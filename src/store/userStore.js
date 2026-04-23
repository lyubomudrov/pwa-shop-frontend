import { defineStore } from 'pinia'
import { userService } from '../services/userService'
import { addressService } from '../services/addressService'
import { orderService } from '../services/orderService'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    addresses: [],
    orders: [],
    isLoadingProfile: false,
    isLoadingAddresses: false,
    isLoadingOrders: false,
    error: null,
  }),

  getters: {
    hasAddresses: (state) => state.addresses.length > 0,
    hasOrders: (state) => state.orders.length > 0,
  },

  actions: {
    clearError() {
      this.error = null
    },

    async loadProfile() {
      this.isLoadingProfile = true
      this.error = null

      try {
        const res = await userService.getMe()
        this.profile = res.data
        return res.data
      } catch (error) {
        this.error = error?.response?.data?.message || 'Не удалось загрузить профиль'
        throw error
      } finally {
        this.isLoadingProfile = false
      }
    },

    async loadAddresses() {
      this.isLoadingAddresses = true
      this.error = null

      try {
        const res = await addressService.getMyAddresses()
        this.addresses = Array.isArray(res.data) ? res.data : []
        return this.addresses
      } catch (error) {
        this.error = error?.response?.data?.message || 'Не удалось загрузить адреса'
        throw error
      } finally {
        this.isLoadingAddresses = false
      }
    },

    async addAddress(address) {
      this.error = null

      try {
        await addressService.createAddress(address)
        await this.loadAddresses()
      } catch (error) {
        this.error = error?.response?.data?.message || 'Не удалось добавить адрес'
        throw error
      }
    },

    async deleteAddress(addressId) {
      this.error = null

      try {
        await addressService.deleteAddress(addressId)
        this.addresses = this.addresses.filter((a) => a.id !== addressId)
      } catch (error) {
        this.error = error?.response?.data?.message || 'Не удалось удалить адрес'
        throw error
      }
    },

    async loadOrders() {
      this.isLoadingOrders = true
      this.error = null

      try {
        const res = await orderService.getMyOrders()
        this.orders = Array.isArray(res.data) ? res.data : []
        return this.orders
      } catch (error) {
        this.error = error?.response?.data?.message || 'Не удалось загрузить заказы'
        throw error
      } finally {
        this.isLoadingOrders = false
      }
    },

    reset() {
      this.profile = null
      this.addresses = []
      this.orders = []
      this.error = null
      this.isLoadingProfile = false
      this.isLoadingAddresses = false
      this.isLoadingOrders = false
    },
  },
})