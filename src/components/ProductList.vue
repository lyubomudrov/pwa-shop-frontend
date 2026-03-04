<template>
  <div>
    <h1>Каталог товаров</h1>

    <div class="grid">
      <div class="card" v-for="p in products" :key="p.id">
        <img v-if="p.imageUrl" :src="p.imageUrl" />
        <h3>{{ p.name }}</h3>
        <p>{{ p.price }} ₽</p>

        <button @click="addToCart(p)">
          В корзину
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
const userId = 4 // позже можно генерировать уникальный ID

const products = ref([])

onMounted(async () => {
  try {
    const res = await api.get('/products')
    products.value = res.data
    // сохраняем только чистые данные оффлайн
    await localforage.setItem('products', JSON.parse(JSON.stringify(products.value)))
  } catch {
    products.value = (await localforage.getItem('products')) || []
    console.warn('Используем оффлайн данные товаров')
  }
})

const addToCart = async (product) => {
  await cart.addProduct(userId, product.id, 1)
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
</style>
