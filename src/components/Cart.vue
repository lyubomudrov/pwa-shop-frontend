<template>
  <div>
    <h1>Корзина</h1>

    <div v-if="cart.items.length === 0">
      Корзина пуста
    </div>

    <div v-else>
      <div v-for="item in cart.items" :key="item.id">
        {{ item.name }} × {{ item.quantity }}
        <button @click="remove(item.id)">Удалить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCartStore } from '../store/cartStore'

const cart = useCartStore()
const userId = 4  // пока фиксированный userId для теста

onMounted(() => {
  cart.loadCart(userId)
})

const remove = (itemId) => {
  cart.removeItem(itemId, userId)
}
</script>
