<template>
  <div class="orders-page">
    <h1>Мои заказы</h1>

    <div v-if="loading">Загрузка заказов...</div>

    <div v-else-if="orders.length === 0">
      Заказов пока нет.
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <h3>Заказ №{{ order.id }}</h3>
          <span class="status">{{ order.status }}</span>
        </div>

        <div class="order-meta">
          <div><strong>Дата:</strong> {{ formatDate(order.orderDate) }}</div>
          <div><strong>Сумма:</strong> {{ order.totalAmount }} ₽</div>
        </div>

        <div v-if="order.address" class="order-address">
          <strong>Адрес:</strong>
          {{ order.address.city }}, {{ order.address.street }}, {{ order.address.houseNumber }},
          {{ order.address.postalCode }}
        </div>

        <div v-if="order.items?.length" class="items">
          <h4>Товары</h4>
          <div v-for="item in order.items" :key="item.id" class="item-row">
            <span>{{ item.productName || item.name || `Товар #${item.productId}` }}</span>
            <span>x{{ item.quantity }}</span>
            <span>{{ item.purchasePrice }} ₽</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { orderService } from '../services/orderService'

const orders = ref([])
const loading = ref(true)

const loadOrders = async () => {
  loading.value = true

  try {
    const res = await orderService.getMyOrders()
    orders.value = res.data
  } catch (e) {
    console.error('Ошибка загрузки заказов', e)
  } finally {
    loading.value = false
  }
}

const formatDate = (value) => {
  if (!value) return '—'

  try {
    return new Date(value).toLocaleString('ru-RU')
  } catch {
    return value
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-page {
  max-width: 900px;
  margin: 0 auto;
}
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.order-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 16px;
}
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.order-meta {
  margin: 12px 0;
  display: grid;
  gap: 6px;
}
.order-address {
  margin: 12px 0;
}
.items {
  margin-top: 12px;
}
.item-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  padding: 8px 0;
  border-top: 1px solid #eee;
}
.status {
  font-size: 14px;
  color: #555;
}
</style>