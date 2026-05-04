<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero__copy">
        <p class="eyebrow">PWA магазин</p>
        <h1>Каталог, корзина, отзывы, заказы и админка в одном интерфейсе</h1>
        <p class="hero__text">
          Выбирайте товары, оформляйте заказы, храните адреса доставки и работайте даже при
          нестабильном интернете.
        </p>

        <div class="hero__actions">
          <RouterLink v-if="auth.isAuthenticated" class="primary-link" to="/cart">
            Открыть корзину
          </RouterLink>
          <RouterLink v-else class="primary-link" to="/register">Создать аккаунт</RouterLink>
          <RouterLink v-if="auth.isAuthenticated" class="secondary-link" to="/profile">
            Личный кабинет
          </RouterLink>
          <RouterLink v-if="auth.isAdmin" class="secondary-link" to="/admin/products">
            Перейти в админку
          </RouterLink>
        </div>
      </div>

      <div class="hero__stats">
        <div class="metric-card">
          <span>Категорий</span>
          <strong>{{ productsStore.categories.length }}</strong>
        </div>
        <div class="metric-card">
          <span>Товаров</span>
          <strong>{{ productsStore.products.length }}</strong>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <p class="eyebrow">Категории</p>
          <h2>Начните с нужного раздела</h2>
        </div>
        <button class="refresh-btn" @click="reloadData">Обновить</button>
      </div>

      <div v-if="productsStore.isLoadingCategories" class="info-text">
        Загрузка категорий...
      </div>

      <div v-else-if="productsStore.categories.length === 0" class="info-text">
        Категории пока не найдены.
      </div>

      <div v-else class="categories-grid">
        <RouterLink
          v-for="category in productsStore.categories"
          :key="category.id"
          :to="`/category/${category.id}`"
          class="category-card"
        >
          <p class="eyebrow">Раздел</p>
          <h3>{{ category.name }}</h3>
          <p>{{ category.description || 'Перейти к товарам категории' }}</p>
        </RouterLink>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <p class="eyebrow">Каталог</p>
          <h2>Все товары</h2>
        </div>
      </div>

      <ProductList :search-query="searchQuery" />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ProductList from '../components/ProductList.vue'
import { useProductStore } from '../store/productStore'
import { useAuthStore } from '../store/authStore'

const productsStore = useProductStore()
const auth = useAuthStore()
const route = useRoute()
const searchQuery = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))

const reloadData = async () => {
  try {
    await Promise.all([productsStore.loadCategories(), productsStore.loadAllProducts()])
  } catch (e) {
    console.error(e)
  }
}

onMounted(reloadData)
</script>

<style scoped>
.home-page {
  display: grid;
  gap: 28px;
}

.hero,
.section {
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  background: var(--surface);
  box-shadow: var(--shadow-soft);
}

.hero {
  padding: 30px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  background: linear-gradient(135deg, #ffffff, #f5f5f5);
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: var(--accent-strong);
  font-weight: 700;
}

.hero h1,
.section-header h2 {
  margin: 0;
  color: var(--text-strong);
}

.hero__text {
  max-width: 58ch;
  color: var(--text-soft);
}

.hero__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 22px;
}

.primary-link,
.secondary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  text-decoration: none;
  border-radius: 4px;
}

.primary-link {
  background: #111111;
  color: white;
}

.secondary-link {
  border: 1px solid var(--border-soft);
  background: white;
  color: var(--text-strong);
}

.hero__stats {
  display: grid;
  gap: 14px;
}

.metric-card {
  padding: 20px;
  border-radius: 4px;
  background: #ffffff;
  border: 1px solid var(--border-soft);
}

.metric-card span {
  display: block;
  color: var(--text-soft);
  font-size: 13px;
}

.metric-card strong {
  display: block;
  margin-top: 4px;
  font-size: 26px;
}

.section {
  padding: 26px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.refresh-btn {
  background: var(--accent-strong);
}

.info-text {
  color: var(--text-soft);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.category-card {
  display: block;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid var(--border-soft);
  background: #ffffff;
  color: inherit;
  text-decoration: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px rgba(30, 44, 40, 0.08);
}

.category-card h3 {
  margin: 0 0 8px;
}

.category-card p:last-child {
  color: var(--text-soft);
  margin: 0;
}

@media (max-width: 980px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
