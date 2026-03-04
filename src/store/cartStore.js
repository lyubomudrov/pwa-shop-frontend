import { defineStore } from 'pinia'
import { cartService } from '../services/cartService'
import localforage from 'localforage'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  actions: {
    async loadCart(userId) {
      try {
        const res = await cartService.getCart(userId)
        this.items = res.data
        // сохраняем оффлайн, только чистые данные
        await localforage.setItem(`cart_${userId}`, JSON.parse(JSON.stringify(this.items)))
      } catch (err) {
        this.items = (await localforage.getItem(`cart_${userId}`)) || []
        console.warn('Ошибка загрузки корзины, используем оффлайн данные', err)
      }
    },

    async addProduct(userId, productId, quantity) {
      try {
        await cartService.addToCart(userId, productId, quantity)
        await this.loadCart(userId)
      } catch (err) {
        const index = this.items.findIndex(i => i.productId === productId)
        if (index >= 0) {
          this.items[index].quantity += quantity
        } else {
          this.items.push({ productId, quantity })
        }
        await localforage.setItem(`cart_${userId}`, JSON.parse(JSON.stringify(this.items)))
        console.warn('Добавлено в корзину локально (офлайн)', err)
      }
    },

    async removeItem(cartItemId, userId) {
      try {
        await cartService.removeItem(cartItemId)
        await this.loadCart(userId)
      } catch (err) {
        this.items = this.items.filter(i => i.id !== cartItemId)
        await localforage.setItem(`cart_${userId}`, JSON.parse(JSON.stringify(this.items)))
        console.warn('Удалено из корзины локально (офлайн)', err)
      }
    }
  }
})
