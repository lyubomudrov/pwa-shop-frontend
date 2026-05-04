<template>
  <div class="product-page">
    <div v-if="loading" class="state-card">Загружаем карточку товара...</div>

    <div v-else-if="error" class="state-card state-card--error">{{ error }}</div>

    <div v-else-if="product" class="product-layout">
      <section class="product-hero">
        <div class="product-hero__media">
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.name"
            class="product-image"
          />
          <div v-else class="product-placeholder">Нет изображения</div>
        </div>

        <div class="product-hero__content">
          <RouterLink class="back-link" :to="categoryLink">← Назад к категории</RouterLink>
          <p class="eyebrow">{{ product.categoryName || 'Каталог' }}</p>
          <h1>{{ product.name }}</h1>
          <p class="description">
            {{ product.description || 'Описание для этого товара пока не добавлено.' }}
          </p>

          <div class="stats">
            <div class="stat-card">
              <span>Цена</span>
              <strong>{{ formatPrice(product.price) }}</strong>
            </div>
            <div class="stat-card">
              <span>Наличие</span>
              <strong>{{ product.stockQuantity }} шт.</strong>
            </div>
            <div class="stat-card">
              <span>Средняя оценка</span>
              <strong>{{ averageRating }}</strong>
            </div>
          </div>

          <div class="hero-actions">
            <button
              :disabled="!product.available || product.stockQuantity <= 0"
              @click="addToCart"
            >
              {{ canAddToCart ? 'Добавить в корзину' : 'Нет в наличии' }}
            </button>
            <RouterLink v-if="auth.isAuthenticated" class="secondary-link" to="/cart">
              Открыть корзину
            </RouterLink>
          </div>

          <p v-if="message" class="success">{{ message }}</p>
          <p v-if="submitError" class="error">{{ submitError }}</p>
        </div>
      </section>

      <section class="content-grid">
        <div class="content-card">
          <div class="section-header">
            <div>
              <p class="eyebrow">Отзывы</p>
              <h2>Что говорят покупатели</h2>
            </div>
            <span class="review-count">{{ reviews.length }} отзыв(ов)</span>
          </div>

          <div v-if="reviewsLoading" class="info-text">Загружаем отзывы...</div>

          <div v-else-if="reviews.length === 0" class="info-text">
            Пока нет отзывов. Можно оставить первый.
          </div>

          <div v-else class="review-list">
            <article v-for="review in reviews" :key="review.id" class="review-card">
              <div class="review-card__header">
                <div>
                  <strong>{{ review.userEmail }}</strong>
                  <span>{{ formatDate(review.reviewDate) }}</span>
                </div>
                <span class="rating">{{ renderStars(review.rating) }}</span>
              </div>
              <p>{{ review.comment || 'Покупатель не оставил комментарий.' }}</p>
            </article>
          </div>
        </div>

        <div class="content-card">
          <div class="section-header">
            <div>
              <p class="eyebrow">Ваш отзыв</p>
              <h2>Поделитесь впечатлением</h2>
            </div>
          </div>

          <div v-if="!auth.isAuthenticated" class="info-text">
            Чтобы оставить отзыв, сначала войдите в аккаунт.
          </div>

          <form v-else class="review-form" @submit.prevent="submitReview">
            <label>
              Оценка
              <select v-model.number="reviewForm.rating" required>
                <option :value="5">5 — отлично</option>
                <option :value="4">4 — хорошо</option>
                <option :value="3">3 — нормально</option>
                <option :value="2">2 — слабо</option>
                <option :value="1">1 — плохо</option>
              </select>
            </label>

            <label>
              Комментарий
              <textarea
                v-model="reviewForm.comment"
                placeholder="Расскажите, что понравилось или что можно улучшить"
                required
              />
            </label>

            <button :disabled="reviewSubmitting">
              {{ reviewSubmitting ? 'Публикуем...' : 'Оставить отзыв' }}
            </button>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { productService } from '../services/productService'
import { reviewService } from '../services/reviewService'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()

const loading = ref(true)
const reviewsLoading = ref(false)
const reviewSubmitting = ref(false)
const product = ref(null)
const reviews = ref([])
const error = ref('')
const submitError = ref('')
const message = ref('')

const reviewForm = reactive({
  rating: 5,
  comment: '',
})

const productId = computed(() => Number(route.params.id))
const canAddToCart = computed(() => product.value?.available && product.value?.stockQuantity > 0)
const categoryLink = computed(() => `/category/${product.value?.categoryId || ''}`)
const averageRating = computed(() => {
  if (!reviews.value.length) return 'Новых оценок пока нет'

  const total = reviews.value.reduce((sum, review) => sum + (review.rating || 0), 0)
  return `${(total / reviews.value.length).toFixed(1)} / 5`
})

const formatPrice = (value) => {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (value) => {
  if (!value) return 'Недавно'

  try {
    return new Date(value).toLocaleString('ru-RU')
  } catch {
    return value
  }
}

const renderStars = (rating) => '★'.repeat(rating || 0) + '☆'.repeat(5 - (rating || 0))

const loadProduct = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await productService.getById(productId.value)
    product.value = res.data
  } catch (err) {
    error.value = err?.response?.data?.message || 'Не удалось загрузить товар.'
  } finally {
    loading.value = false
  }
}

const loadReviews = async () => {
  reviewsLoading.value = true

  try {
    const res = await reviewService.getByProduct(productId.value)
    reviews.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Ошибка загрузки отзывов', err)
    reviews.value = []
  } finally {
    reviewsLoading.value = false
  }
}

const addToCart = async () => {
  submitError.value = ''
  message.value = ''

  try {
    const result = await cart.addProduct(product.value.id, 1)

    if (result?.queuedOffline) {
      message.value = 'Интернет недоступен. Товар сохранён локально и синхронизируется позже.'
      return
    }

    message.value = `Товар "${product.value.name}" добавлен в корзину.`
  } catch (err) {
    const status = err?.response?.status

    if (status === 401) {
      submitError.value = 'Сначала войдите в аккаунт.'
      return
    }

    if (status === 403) {
      submitError.value = 'Сервер отклонил добавление товара в корзину для текущего пользователя.'
      return
    }

    submitError.value = err?.response?.data?.message || 'Не удалось добавить товар в корзину.'
  }
}

const submitReview = async () => {
  submitError.value = ''
  message.value = ''
  reviewSubmitting.value = true

  try {
    await reviewService.create({
      userId: auth.user?.id,
      productId: product.value.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    })

    reviewForm.rating = 5
    reviewForm.comment = ''
    message.value = 'Спасибо, отзыв опубликован.'
    await loadReviews()
  } catch (err) {
    submitError.value = err?.response?.data?.message || 'Не удалось сохранить отзыв.'
  } finally {
    reviewSubmitting.value = false
  }
}

const loadPage = async () => {
  await Promise.all([loadProduct(), loadReviews()])
}

onMounted(loadPage)
watch(productId, loadPage)
</script>

<style scoped>
.product-page {
  display: grid;
}

.product-layout {
  display: grid;
  gap: 24px;
}

.product-hero,
.content-card,
.state-card {
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  background: var(--surface);
  box-shadow: var(--shadow-soft);
}

.product-hero {
  display: grid;
  grid-template-columns: minmax(300px, 460px) 1fr;
  gap: 24px;
  padding: 24px;
}

.product-hero__media {
  min-height: 420px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
  display: grid;
  place-items: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 30px;
}

.product-placeholder {
  color: var(--text-soft);
}

.product-hero__content h1,
.section-header h2 {
  margin: 0;
  color: var(--text-strong);
}

.back-link {
  display: inline-block;
  margin-bottom: 18px;
  color: var(--accent-strong);
  text-decoration: none;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: var(--accent-strong);
  font-weight: 700;
}

.description {
  color: var(--text-soft);
  max-width: 62ch;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 22px 0;
}

.stat-card {
  padding: 16px;
  border-radius: 4px;
  background: #ffffff;
  border: 1px solid var(--border-soft);
}

.stat-card span {
  display: block;
  font-size: 13px;
  color: var(--text-soft);
}

.stat-card strong {
  display: block;
  margin-top: 4px;
  font-size: 20px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.secondary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  border-radius: 4px;
  border: 1px solid var(--border-soft);
  background: white;
  color: var(--text-strong);
  text-decoration: none;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
}

.content-card,
.state-card {
  padding: 24px;
}

.state-card--error,
.error {
  color: #b42318;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.review-count,
.info-text {
  color: var(--text-soft);
}

.review-list {
  display: grid;
  gap: 14px;
}

.review-card {
  padding: 18px;
  border-radius: 4px;
  background: #ffffff;
  border: 1px solid var(--border-soft);
}

.review-card__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.review-card__header strong,
.review-card__header span {
  display: block;
}

.review-card__header span {
  color: var(--text-soft);
  font-size: 13px;
}

.rating {
  color: #f59e0b;
  font-size: 18px;
  white-space: nowrap;
}

.review-form {
  display: grid;
  gap: 16px;
}

.review-form label {
  display: grid;
  gap: 8px;
}

.success {
  color: #157347;
}

@media (max-width: 980px) {
  .product-hero,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
