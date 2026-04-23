import { defineStore } from 'pinia'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    categories: [],
    selectedProduct: null,
    isLoadingProducts: false,
    isLoadingCategories: false,
    error: null,
  }),

  getters: {
    hasProducts: (state) => state.products.length > 0,
    hasCategories: (state) => state.categories.length > 0,
  },

  actions: {
    clearError() {
      this.error = null
    },

    async loadCategories() {
      this.isLoadingCategories = true
      this.error = null

      try {
        const res = await categoryService.getAll()
        this.categories = Array.isArray(res.data) ? res.data : []
      } catch (error) {
        this.error = error?.response?.data?.message || 'Не удалось загрузить категории'
        throw error
      } finally {
        this.isLoadingCategories = false
      }
    },

    async loadAllProducts() {
      this.isLoadingProducts = true
      this.error = null

      try {
        const res = await productService.getAll()
        this.products = Array.isArray(res.data) ? res.data : []
      } catch (error) {
        this.error = error?.response?.data?.message || 'Не удалось загрузить товары'
        throw error
      } finally {
        this.isLoadingProducts = false
      }
    },

    async loadProductsByCategory(categoryId) {
      this.isLoadingProducts = true
      this.error = null

      try {
        const res = await productService.getByCategory(categoryId)
        this.products = Array.isArray(res.data) ? res.data : []
      } catch (error) {
        this.error = error?.response?.data?.message || 'Не удалось загрузить товары категории'
        throw error
      } finally {
        this.isLoadingProducts = false
      }
    },

    async loadProductById(productId) {
      this.isLoadingProducts = true
      this.error = null

      try {
        const res = await productService.getById(productId)
        this.selectedProduct = res.data
        return res.data
      } catch (error) {
        this.error = error?.response?.data?.message || 'Не удалось загрузить товар'
        throw error
      } finally {
        this.isLoadingProducts = false
      }
    },

    resetSelectedProduct() {
      this.selectedProduct = null
    },
  },
})