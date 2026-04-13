import { defineStore } from 'pinia'
import { cartService } from '../services/cartService'
import localforage from 'localforage'

const CART_STORAGE_KEY = 'cart_current_user'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isLoading: false
  }),

  getters: {
    totalItems: (state) =>
      state.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  },

  actions: {
    async loadCart() {
      this.isLoading = true

      try {
        const res = await cartService.getCart()
        this.items = res.data
        await localforage.setItem(CART_STORAGE_KEY, JSON.parse(JSON.stringify(this.items)))
      } catch (err) {
        this.items = (await localforage.getItem(CART_STORAGE_KEY)) || []
        console.warn('Ошибка загрузки корзины, используем оффлайн данные', err)
      } finally {
        this.isLoading = false
      }
    },

    async addProduct(productId, quantity = 1) {
      try {
        await cartService.addToCart(productId, quantity)
        await this.loadCart()
      } catch (err) {
        console.warn('Ошибка добавления в корзину', err)
        throw err
      }
    },

    async removeItem(cartItemId) {
      try {
        await cartService.removeItem(cartItemId)
        await this.loadCart()
      } catch (err) {
        console.warn('Ошибка удаления из корзины', err)
        throw err
      }
    },

    clearCart() {
      this.items = []
      localforage.removeItem(CART_STORAGE_KEY)
    }
  }
})