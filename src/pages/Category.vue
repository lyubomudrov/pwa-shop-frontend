<template>
  <div class="category-page">
    <div class="page-header">
      <div>
        <p class="breadcrumb">Каталог / Категория</p>
        <h1>{{ categoryTitle }}</h1>
      </div>

      <RouterLink to="/" class="back-link">← На главную</RouterLink>
    </div>

    <div v-if="productsStore.isLoadingProducts" class="info-box">
      Загрузка товаров категории...
    </div>

    <div v-else-if="productsStore.products.length === 0" class="info-box">
      В этой категории пока нет товаров.
    </div>

    <div v-else class="products-grid">
      <article
        v-for="product in productsStore.products"
        :key="product.id"
        class="product-card"
      >
        <div class="product-card__body">
          <h3>{{ product.name }}</h3>

          <p class="description">
            {{ product.description || 'Описание пока отсутствует.' }}
          </p>

          <div class="meta-row">
            <span class="price">{{ product.price }} ₽</span>
            <span class="stock">
              Остаток: {{ product.stockQuantity ?? product.quantity ?? '—' }}
            </span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useProductStore } from '../store/productStore'

const route = useRoute()
const productsStore = useProductStore()

const categoryId = computed(() => Number(route.params.id))

const categoryTitle = computed(() => {
  const current = productsStore.categories.find(c => c.id === categoryId.value)
  return current?.name || `Категория #${categoryId.value}`
})

const loadCategoryData = async () => {
  try {
    if (!productsStore.categories.length) {
      await productsStore.loadCategories()
    }

    await productsStore.loadProductsByCategory(categoryId.value)
  } catch (e) {
    console.error('Ошибка загрузки категории', e)
  }
}

onMounted(() => {
  loadCategoryData()
})

watch(() => route.params.id, () => {
  loadCategoryData()
})
</script>

<style scoped>
.category-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.breadcrumb {
  margin: 0 0 6px;
  color: #777;
  font-size: 14px;
}

h1 {
  margin: 0;
  font-size: 32px;
}

.back-link {
  text-decoration: none;
  color: #111;
  font-weight: 600;
}

.info-box {
  padding: 18px;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  color: #666;
  background: #fafafa;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.product-card {
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.product-card__body {
  padding: 18px;
}

.product-card h3 {
  margin: 0 0 10px;
  font-size: 20px;
}

.description {
  margin: 0 0 16px;
  color: #666;
  min-height: 44px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.price {
  font-size: 20px;
  font-weight: 700;
}

.stock {
  color: #555;
  font-size: 14px;
}
</style>