<template>
  <div class="orders-page">
    <section class="hero-card">
      <div>
        <p class="eyebrow">История заказов</p>
        <h1>Ваши покупки</h1>
        <p class="subtitle">Все оформленные заказы, адреса доставки и состав корзины.</p>
      </div>
      <RouterLink class="checkout-link" to="/checkout">Новый заказ</RouterLink>
    </section>

    <section class="panel">
      <div v-if="loading" class="info-text">Загрузка заказов...</div>

      <div v-else-if="orders.length === 0" class="empty-card">
        <h2>Заказов пока нет</h2>
        <p>Когда вы оформите первую покупку, история появится здесь.</p>
      </div>

      <div v-else class="orders-list">
        <article v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div>
              <h3>Заказ №{{ order.id }}</h3>
              <p>{{ formatDate(order.orderDate) }}</p>
            </div>
            <span class="status">{{ order.status }}</span>
          </div>

          <div class="order-meta">
            <div>
              <span>Сумма</span>
              <strong>{{ formatPrice(order.totalAmount) }}</strong>
            </div>
            <div v-if="order.address">
              <span>Адрес</span>
              <strong>
                {{ order.address.city }}, {{ order.address.street }}, {{ order.address.houseNumber }}
              </strong>
            </div>
          </div>

          <div v-if="order.items?.length" class="items">
            <h4>Товары в заказе</h4>
            <div v-for="item in order.items" :key="item.id" class="item-row">
              <span>{{ item.productName || item.name || `Товар #${item.productId}` }}</span>
              <span>x{{ item.quantity }}</span>
              <span>{{ formatPrice(item.purchasePrice) }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { orderService } from '../services/orderService'

const orders = ref([])
const loading = ref(true)

const loadOrders = async () => {
  loading.value = true

  try {
    const res = await orderService.getMyOrders()
    orders.value = Array.isArray(res.data) ? res.data : []
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

const formatPrice = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

onMounted(loadOrders)
</script>

<style scoped>
.orders-page {
  display: grid;
  gap: 24px;
}

.hero-card,
.panel,
.empty-card {
  border: 1px solid var(--border-soft);
  border-radius: 28px;
  background: var(--surface);
  box-shadow: var(--shadow-soft);
}

.hero-card {
  padding: 26px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: var(--accent-strong);
  font-weight: 700;
}

.hero-card h1,
.empty-card h2 {
  margin: 0;
}

.subtitle,
.info-text,
.order-header p,
.item-row span:first-child {
  color: var(--text-soft);
}

.checkout-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  border-radius: 14px;
  text-decoration: none;
  background: linear-gradient(135deg, #1f6f5f, #2d936c);
  color: white;
}

.panel,
.empty-card {
  padding: 24px;
}

.orders-list {
  display: grid;
  gap: 16px;
}

.order-card {
  border: 1px solid rgba(28, 35, 32, 0.08);
  border-radius: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.78);
}

.order-header,
.order-meta,
.item-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.order-header h3,
.items h4 {
  margin: 0;
}

.status {
  min-height: 36px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(31, 111, 95, 0.12);
  color: var(--accent-strong);
  font-weight: 700;
}

.order-meta {
  margin: 18px 0;
}

.order-meta span {
  display: block;
  color: var(--text-soft);
  font-size: 13px;
}

.items {
  display: grid;
  gap: 10px;
}

.item-row {
  padding-top: 12px;
  border-top: 1px solid rgba(28, 35, 32, 0.08);
}

@media (max-width: 900px) {
  .hero-card,
  .order-header,
  .order-meta,
  .item-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
