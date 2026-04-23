<template>
  <div class="category-page">
    <section class="hero-card">
      <div>
        <p class="eyebrow">Каталог</p>
        <h1>{{ categoryTitle }}</h1>
        <p class="description">
          {{ categoryDescription || 'Собрали товары этой категории в одном месте.' }}
        </p>
      </div>

      <div class="hero-actions">
        <RouterLink to="/" class="secondary-link">← На главную</RouterLink>
        <span class="count-pill">{{ productsStore.products.length }} товаров</span>
      </div>
    </section>

    <section class="section-card">
      <div v-if="productsStore.isLoadingProducts" class="info-text">
        Загружаем товары категории...
      </div>

      <div v-else-if="productsStore.products.length === 0" class="info-text">
        В этой категории пока нет товаров.
      </div>

      <div v-else class="products-grid">
        <article v-for="product in productsStore.products" :key="product.id" class="product-card">
          <RouterLink :to="`/products/${product.id}`" class="product-card__media">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="product.name"
              class="product-image"
            />
            <div v-else class="placeholder">Нет изображения</div>
          </RouterLink>

          <div class="product-card__body">
            <RouterLink :to="`/products/${product.id}`" class="title-link">
              <h3>{{ product.name }}</h3>
            </RouterLink>

            <p class="product-description">
              {{ product.description || 'Описание для товара пока не добавлено.' }}
            </p>

            <div class="meta-row">
              <strong>{{ formatPrice(product.price) }}</strong>
              <span>Остаток: {{ product.stockQuantity ?? 0 }}</span>
            </div>

            <div class="actions">
              <button
                class="cart-btn"
                :disabled="!product.available || product.stockQuantity <= 0"
                @click="addToCart(product)"
              >
                {{ !product.available || product.stockQuantity <= 0 ? 'Нет в наличии' : 'В корзину' }}
              </button>
              <RouterLink :to="`/products/${product.id}`" class="secondary-link">Подробнее</RouterLink>
            </div>
          </div>
        </article>
      </div>

      <p v-if="message" class="success">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </section>
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
const currentCategory = computed(() =>
  productsStore.categories.find((category) => category.id === categoryId.value)
)
const categoryTitle = computed(() => currentCategory.value?.name || `Категория #${categoryId.value}`)
const categoryDescription = computed(() => currentCategory.value?.description || '')

const formatPrice = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

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
      message.value = 'Нет интернета. Товар сохранён локально и будет синхронизирован позже.'
      return
    }

    message.value = `Товар "${product.name}" добавлен в корзину.`
  } catch (err) {
    const status = err?.response?.status

    if (status === 401) {
      error.value = 'Чтобы добавить товар в корзину, сначала войдите в аккаунт.'
      return
    }

    if (status === 403) {
      error.value = 'Сервер отклонил добавление товара в корзину для текущего пользователя.'
      return
    }

    if (status === 400) {
      error.value = err?.response?.data?.message || 'Не удалось добавить товар в корзину.'
      return
    }

    error.value = 'Не удалось добавить товар в корзину.'
  }
}

onMounted(loadCategoryData)
watch(() => route.params.id, loadCategoryData)
</script>

<style scoped>
.category-page {
  display: grid;
  gap: 24px;
}

.hero-card,
.section-card {
  border: 1px solid var(--border-soft);
  border-radius: 28px;
  background: var(--surface);
  box-shadow: var(--shadow-soft);
}

.hero-card {
  padding: 26px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: var(--accent-strong);
  font-weight: 700;
}

.hero-card h1 {
  margin: 0;
}

.description,
.product-description,
.meta-row span,
.info-text {
  color: var(--text-soft);
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.secondary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid var(--border-soft);
  background: white;
  color: var(--text-strong);
  text-decoration: none;
}

.count-pill {
  min-height: 42px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(31, 111, 95, 0.12);
  color: var(--accent-strong);
  font-weight: 700;
}

.section-card {
  padding: 24px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.product-card {
  display: grid;
  border-radius: 24px;
  border: 1px solid rgba(28, 35, 32, 0.08);
  background: rgba(255, 255, 255, 0.82);
  overflow: hidden;
}

.product-card__media {
  min-height: 220px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at top, rgba(239, 131, 84, 0.18), transparent 38%),
    linear-gradient(180deg, #fff8ef, #eef5f1);
  padding: 20px;
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: contain;
}

.placeholder {
  color: var(--text-soft);
}

.product-card__body {
  display: grid;
  gap: 12px;
  padding: 18px;
}

.title-link {
  color: inherit;
  text-decoration: none;
}

.title-link h3 {
  margin: 0;
}

.meta-row,
.actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.cart-btn {
  background: var(--accent-strong);
}

.success {
  margin-top: 18px;
  color: #157347;
}

.error {
  margin-top: 18px;
  color: #b42318;
}

@media (max-width: 900px) {
  .hero-card {
    flex-direction: column;
  }
}
</style>
