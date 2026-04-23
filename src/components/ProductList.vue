<template>
  <div class="product-list">
    <div v-if="loading" class="state-card">Загружаем товары...</div>

    <div v-else-if="products.length === 0" class="state-card">
      Пока нет товаров для отображения.
    </div>

    <div v-else class="grid">
      <article v-for="product in products" :key="product.id" class="product-card">
        <RouterLink :to="`/products/${product.id}`" class="product-card__image">
          <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
          <div v-else class="placeholder">Нет изображения</div>
        </RouterLink>

        <div class="product-card__body">
          <p class="eyebrow">{{ product.categoryName || 'Каталог' }}</p>
          <RouterLink :to="`/products/${product.id}`" class="title-link">
            <h3>{{ product.name }}</h3>
          </RouterLink>
          <p class="description">{{ product.description || 'Описание появится позже.' }}</p>

          <div class="meta-row">
            <strong>{{ formatPrice(product.price) }}</strong>
            <span>Остаток: {{ product.stockQuantity }}</span>
          </div>

          <div class="actions">
            <button
              :disabled="!product.available || product.stockQuantity <= 0"
              @click="addToCart(product)"
            >
              {{ product.available && product.stockQuantity > 0 ? 'В корзину' : 'Нет в наличии' }}
            </button>
            <RouterLink :to="`/products/${product.id}`" class="secondary-link">Подробнее</RouterLink>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { productService } from '../services/productService'
import { useCartStore } from '../store/cartStore'
import localforage from 'localforage'

const cart = useCartStore()
const products = ref([])
const loading = ref(true)

const formatPrice = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const loadProducts = async () => {
  loading.value = true

  try {
    const res = await productService.getAll()
    products.value = Array.isArray(res.data) ? res.data : []
    await localforage.setItem('products', JSON.parse(JSON.stringify(products.value)))
  } catch (err) {
    products.value = (await localforage.getItem('products')) || []
    console.warn('Используем оффлайн-данные товаров', err)
  } finally {
    loading.value = false
  }
}

const addToCart = async (product) => {
  try {
    const result = await cart.addProduct(product.id, 1)

    if (result?.queuedOffline) {
      window.alert('Нет интернета. Товар сохранён локально и будет синхронизирован позже.')
      return
    }

    window.alert(`Товар "${product.name}" добавлен в корзину.`)
  } catch (error) {
    const status = error?.response?.status

    if (status === 401) {
      window.alert('Сначала войдите в аккаунт.')
      return
    }

    if (status === 403) {
      window.alert('Сервер отклонил добавление товара в корзину для текущего пользователя.')
      return
    }

    if (status === 400) {
      window.alert(error?.response?.data?.message || 'Не удалось добавить товар в корзину.')
      return
    }

    window.alert('Не удалось добавить товар в корзину.')
  }
}

onMounted(loadProducts)
</script>

<style scoped>
.state-card {
  padding: 24px;
  border-radius: 22px;
  border: 1px solid var(--border-soft);
  background: rgba(255, 255, 255, 0.78);
  color: var(--text-soft);
}

.grid {
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
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 32px rgba(30, 44, 40, 0.08);
}

.product-card__image {
  min-height: 220px;
  background:
    radial-gradient(circle at top, rgba(239, 131, 84, 0.18), transparent 38%),
    linear-gradient(180deg, #fff8ef, #eef5f1);
  display: grid;
  place-items: center;
  padding: 20px;
}

.product-card__image img {
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

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: var(--accent-strong);
  font-weight: 700;
}

.title-link {
  text-decoration: none;
  color: inherit;
}

.title-link h3 {
  margin: 0;
}

.description,
.meta-row span {
  color: var(--text-soft);
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
</style>
