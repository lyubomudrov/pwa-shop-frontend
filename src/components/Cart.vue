<template>
  <div>
    <h1>Корзина</h1>

    <div v-if="cart.isLoading">Загрузка...</div>

    <div v-else-if="cart.items.length === 0">
      Корзина пуста
    </div>

    <div v-else>
      <div v-for="item in cart.items" :key="item.id">
        {{ item.productName || item.name || `Товар #${item.productId}` }} × {{ item.quantity }}
        <button @click="remove(item.id)">Удалить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCartStore } from '../store/cartStore'

const cart = useCartStore()

onMounted(() => {
  cart.loadCart()
})

const remove = async (itemId) => {
  try {
    await cart.removeItem(itemId)
  } catch (error) {
    alert('Не удалось удалить товар из корзины')
  }
}
</script>