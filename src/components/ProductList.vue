<template>
  <div>
    <h1>Каталог товаров</h1>

    <div class="grid">
      <div class="card" v-for="p in products" :key="p.id">
        <img v-if="p.imageUrl" :src="p.imageUrl" :alt="p.name" />
        <h3>{{ p.name }}</h3>
        <p>{{ p.price }} ₽</p>
        <p>В наличии: {{ p.stockQuantity }}</p>

        <button
          :disabled="!p.available || p.stockQuantity <= 0"
          @click="addToCart(p)"
        >
          {{ !p.available || p.stockQuantity <= 0 ? 'Нет в наличии' : 'В корзину' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../services/api'
import { useCartStore } from '../store/cartStore'
import localforage from 'localforage'

const cart = useCartStore()
const products = ref([])

onMounted(async () => {
  try {
    const res = await api.get('/products')
    products.value = res.data
    await localforage.setItem('products', JSON.parse(JSON.stringify(products.value)))
  } catch {
    products.value = (await localforage.getItem('products')) || []
    console.warn('Используем оффлайн данные товаров')
  }
})

const addToCart = async (product) => {
  try {
    await cart.addProduct(product.id, 1)
    alert('Товар добавлен в корзину')
  } catch (error) {
    alert('Не удалось добавить товар в корзину')
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.card {
  border: 1px solid #ccc;
  padding: 12px;
}
img {
  max-width: 100%;
  height: auto;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>