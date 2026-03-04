<template>
  <nav>
    <button @click="page='products'">Товары</button>
    <button @click="page='cart'">Корзина</button>
  </nav>

  <ProductList v-if="page==='products'" />
  <Cart v-else />
</template>

<script setup>
import { ref } from 'vue'
import ProductList from './components/ProductList.vue'
import Cart from './components/Cart.vue'

const page = ref('products')
</script>
