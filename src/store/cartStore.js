import { defineStore } from 'pinia'
import { cartService } from '../services/cartService'
import localforage from 'localforage'

const CART_STORAGE_KEY = 'cart_current_user'
const CART_QUEUE_KEY = 'cart_pending_actions'

function isNetworkError(err) {
  return !err?.response
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isLoading: false,
    isSyncing: false,
    pendingActions: []
  }),

  getters: {
    totalItems: (state) =>
      state.items.reduce((sum, item) => sum + (item.quantity || 0), 0),

    pendingCount: (state) => state.pendingActions.length
  },

  actions: {
    async initOfflineState() {
      this.items = (await localforage.getItem(CART_STORAGE_KEY)) || []
      this.pendingActions = (await localforage.getItem(CART_QUEUE_KEY)) || []
    },

    async persistItems() {
      await localforage.setItem(CART_STORAGE_KEY, JSON.parse(JSON.stringify(this.items)))
    },

    async persistQueue() {
      await localforage.setItem(CART_QUEUE_KEY, JSON.parse(JSON.stringify(this.pendingActions)))
    },

    async loadCart() {
      this.isLoading = true

      try {
        const res = await cartService.getCart()
        this.items = res.data
        await this.persistItems()
      } catch (err) {
        if (isNetworkError(err)) {
          this.items = (await localforage.getItem(CART_STORAGE_KEY)) || []
          console.warn('Ошибка загрузки корзины, используем оффлайн данные', err)
        } else {
          throw err
        }
      } finally {
        this.isLoading = false
      }
    },

    async addProduct(productId, quantity = 1) {
      if (!navigator.onLine) {
        const existing = this.items.find(i => i.productId === productId)

        if (existing) {
          existing.quantity += quantity
        } else {
          this.items.push({
            id: `offline-${Date.now()}`,
            productId,
            quantity,
            productName: `Товар #${productId}`,
            offline: true
          })
        }

        this.pendingActions.push({
          type: 'add',
          productId,
          quantity,
          createdAt: new Date().toISOString()
        })

        await this.persistItems()
        await this.persistQueue()
        return { queuedOffline: true }
      }

      try {
        await cartService.addToCart(productId, quantity)
        await this.loadCart()
        return { queuedOffline: false }
      } catch (err) {
        if (isNetworkError(err)) {
          console.warn('Сетевая ошибка, сохраняем действие локально', err)

          const existing = this.items.find(i => i.productId === productId)

          if (existing) {
            existing.quantity += quantity
          } else {
            this.items.push({
              id: `offline-${Date.now()}`,
              productId,
              quantity,
              productName: `Товар #${productId}`,
              offline: true
            })
          }

          this.pendingActions.push({
            type: 'add',
            productId,
            quantity,
            createdAt: new Date().toISOString()
          })

          await this.persistItems()
          await this.persistQueue()
          return { queuedOffline: true }
        }

        throw err
      }
    },

    async removeItem(cartItemId) {
      const existing = this.items.find(i => i.id === cartItemId)

      if (!navigator.onLine) {
        this.items = this.items.filter(i => i.id !== cartItemId)

        this.pendingActions.push({
          type: 'remove',
          cartItemId,
          productId: existing?.productId || null,
          createdAt: new Date().toISOString()
        })

        await this.persistItems()
        await this.persistQueue()
        return { queuedOffline: true }
      }

      try {
        await cartService.removeItem(cartItemId)
        await this.loadCart()
        return { queuedOffline: false }
      } catch (err) {
        if (isNetworkError(err)) {
          console.warn('Сетевая ошибка, сохраняем удаление локально', err)

          this.items = this.items.filter(i => i.id !== cartItemId)

          this.pendingActions.push({
            type: 'remove',
            cartItemId,
            productId: existing?.productId || null,
            createdAt: new Date().toISOString()
          })

          await this.persistItems()
          await this.persistQueue()
          return { queuedOffline: true }
        }

        throw err
      }
    },

    async syncPendingActions() {
      if (!navigator.onLine || this.isSyncing || this.pendingActions.length === 0) {
        return
      }

      this.isSyncing = true

      try {
        const actions = [...this.pendingActions]

        for (const action of actions) {
          if (action.type === 'add') {
            await cartService.addToCart(action.productId, action.quantity)
          }

          if (action.type === 'remove') {
            if (action.cartItemId && !String(action.cartItemId).startsWith('offline-')) {
              await cartService.removeItem(action.cartItemId)
            }
          }
        }

        this.pendingActions = []
        await this.persistQueue()
        await this.loadCart()
      } catch (err) {
        console.warn('Не удалось синхронизировать оффлайн-корзину', err)
      } finally {
        this.isSyncing = false
      }
    },

    async clearCart() {
      this.items = []
      this.pendingActions = []
      await localforage.removeItem(CART_STORAGE_KEY)
      await localforage.removeItem(CART_QUEUE_KEY)
    }
  }
})