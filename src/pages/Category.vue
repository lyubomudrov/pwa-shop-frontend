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
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.name"
            class="product-image"
          />

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

          <button
            class="cart-btn"
            :disabled="!product.available || product.stockQuantity <= 0"
            @click="addToCart(product)"
          >
            {{ !product.available || product.stockQuantity <= 0 ? 'Нет в наличии' : 'В корзину' }}
          </button>
        </div>
      </article>
    </div>

    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useProductStore } from '../store/productStore'
import { useCartStore } from '../store/cartStore'

const route = useRoute()
const productsStore = useProductStore()
const cart = useCartStore()

const error = ref('')
const message = ref('')

const categoryId = computed(() => Number(route.params.id))

const categoryTitle = computed(() => {
  const current = productsStore.categories.find(c => c.id === categoryId.value)
  return current?.name || `Категория #${categoryId.value}`
})

const loadCategoryData = async () => {
  error.value = ''
  message.value = ''

  try {
    if (!productsStore.categories.length) {
      await productsStore.loadCategories()
    }

    await productsStore.loadProductsByCategory(categoryId.value)
  } catch (e) {
    error.value = 'Ошибка загрузки категории.'
    console.error('Ошибка загрузки категории', e)
  }
}

const addToCart = async (product) => {
  error.value = ''
  message.value = ''

  try {
    const result = await cart.addProduct(product.id, 1)

    if (result?.queuedOffline) {
      message.value = 'Нет интернета. Товар сохранен локально и будет синхронизирован позже.'
      return
    }

    message.value = `Товар "${product.name}" добавлен в корзину.`
  } catch (err) {
    const status = err?.response?.status

    if (status === 401 || status === 403) {
      error.value = 'Чтобы добавить товар в корзину, сначала войдите в аккаунт.'
      return
    }

    if (status === 400) {
      error.value = err?.response?.data?.message || 'Не удалось добавить товар в корзину.'
      return
    }

    error.value = 'Не удалось добавить товар в корзину.'
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
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: contain;
  border-radius: 12px;
  background: #f7f7f7;
}

.product-card h3 {
  margin: 0;
  font-size: 20px;
}

.description {
  margin: 0;
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

.cart-btn {
  border: none;
  border-radius: 10px;
  background: #111;
  color: white;
  padding: 12px 14px;
  cursor: pointer;
}

.cart-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success {
  margin-top: 18px;
  color: #2e7d32;
}

.error {
  margin-top: 18px;
  color: #c62828;
}
</style>