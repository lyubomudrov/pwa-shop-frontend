<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero__content">
        <h1>Добро пожаловать в PWA Shop</h1>
        <p>
          Удобный интернет-магазин с корзиной, заказами и поддержкой оффлайн-режима.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Категории</h2>
        <button class="refresh-btn" @click="reloadData" :disabled="productsStore.isLoadingCategories">
          {{ productsStore.isLoadingCategories ? 'Обновляем...' : 'Обновить' }}
        </button>
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
          <h3>{{ category.name }}</h3>
          <p>Перейти к товарам категории</p>
        </RouterLink>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Все товары</h2>
      </div>

      <ProductList />
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import ProductList from '../components/ProductList.vue'
import { useProductStore } from '../store/productStore'

const productsStore = useProductStore()

const reloadData = async () => {
  try {
    await productsStore.loadCategories()
  } catch (e) {
    console.error('Ошибка загрузки категорий', e)
  }
}

onMounted(async () => {
  if (!productsStore.categories.length) {
    await reloadData()
  }
})
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

.hero {
  margin-bottom: 28px;
  border-radius: 20px;
  padding: 36px 28px;
  background: linear-gradient(135deg, #111, #2b2b2b);
  color: white;
}

.hero__content h1 {
  margin: 0 0 12px;
  font-size: 36px;
  line-height: 1.15;
}

.hero__content p {
  margin: 0;
  max-width: 700px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 16px;
}

.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
  font-size: 26px;
}

.refresh-btn {
  border: none;
  border-radius: 10px;
  background: #111;
  color: white;
  padding: 10px 14px;
  cursor: pointer;
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.info-text {
  color: #666;
  padding: 12px 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.category-card {
  display: block;
  text-decoration: none;
  color: inherit;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 18px;
  background: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.category-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.category-card p {
  margin: 0;
  color: #666;
}
</style>