<template>
  <div class="cart-page">
    <section class="hero-card">
      <div>
        <p class="eyebrow">Корзина</p>
        <h1>Проверьте выбранные товары</h1>
        <p class="subtitle">Здесь собраны все позиции, которые готовы к оформлению заказа.</p>
      </div>

      <div class="summary-card">
        <span>Позиций</span>
        <strong>{{ cart.totalItems }}</strong>
        <RouterLink v-if="cart.items.length" to="/checkout" class="checkout-link">
          Перейти к оформлению
        </RouterLink>
      </div>
    </section>

    <section class="panel">
      <div v-if="cart.isLoading" class="info-text">Загрузка корзины...</div>

      <div v-else-if="cart.items.length === 0" class="empty-card">
        <h2>Корзина пуста</h2>
        <p>Добавьте товары из каталога, чтобы оформить заказ.</p>
        <RouterLink to="/" class="checkout-link">Вернуться в каталог</RouterLink>
      </div>

      <div v-else class="cart-list">
        <article v-for="item in cart.items" :key="item.id" class="cart-item">
          <div>
            <strong>{{ item.productName || item.name || `Товар #${item.productId}` }}</strong>
            <p>Количество: {{ item.quantity }}</p>
            <span v-if="item.purchasePrice">{{ formatPrice(item.purchasePrice) }}</span>
          </div>

          <div class="item-actions">
            <RouterLink
              v-if="item.productId"
              :to="`/products/${item.productId}`"
              class="secondary-link"
            >
              Открыть товар
            </RouterLink>
            <button class="danger-button" @click="remove(item.id)">Удалить</button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCartStore } from '../store/cartStore'

const cart = useCartStore()

const formatPrice = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

onMounted(() => {
  cart.loadCart()
})

const remove = async (itemId) => {
  try {
    await cart.removeItem(itemId)
  } catch (error) {
    window.alert('Не удалось удалить товар из корзины.')
  }
}
</script>

<style scoped>
.cart-page {
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
  align-items: stretch;
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
.cart-item p,
.cart-item span,
.empty-card p {
  color: var(--text-soft);
}

.summary-card {
  min-width: 220px;
  padding: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(28, 35, 32, 0.08);
  display: grid;
  gap: 8px;
}

.summary-card span {
  color: var(--text-soft);
}

.summary-card strong {
  font-size: 28px;
}

.checkout-link,
.secondary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 16px;
  border-radius: 14px;
  text-decoration: none;
}

.checkout-link {
  background: linear-gradient(135deg, #1f6f5f, #2d936c);
  color: white;
}

.secondary-link {
  border: 1px solid var(--border-soft);
  background: white;
  color: var(--text-strong);
}

.panel,
.empty-card {
  padding: 24px;
}

.cart-list {
  display: grid;
  gap: 14px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(28, 35, 32, 0.08);
  background: rgba(255, 255, 255, 0.78);
}

.item-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.danger-button {
  background: #b42318;
}

@media (max-width: 900px) {
  .hero-card,
  .cart-item {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
