<template>
  <div class="admin-page">
    <section class="admin-hero">
      <div>
        <p class="eyebrow">Администрирование</p>
        <h1>Управление товарами</h1>
        <p class="subtitle">Создавайте, редактируйте и удаляйте товары из каталога.</p>
      </div>
      <div class="hero-actions">
        <RouterLink class="secondary-link" to="/admin/categories">Категории</RouterLink>
        <button @click="reloadData">Обновить данные</button>
      </div>
    </section>

    <div class="admin-grid">
      <section class="panel">
        <h2>{{ editingProductId ? 'Редактирование товара' : 'Новый товар' }}</h2>

        <form class="admin-form" @submit.prevent="submitProduct">
          <input v-model="form.name" type="text" placeholder="Название" required />
          <textarea v-model="form.description" placeholder="Описание" required />
          <input v-model.number="form.price" type="number" min="0" step="0.01" placeholder="Цена" required />
          <input v-model.number="form.stockQuantity" type="number" min="0" placeholder="Остаток" required />
          <input v-model="form.imageUrl" type="text" placeholder="Ссылка на изображение" />

          <select v-model.number="form.categoryId" required>
            <option disabled value="">Выберите категорию</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>

          <label class="checkbox-row">
            <input v-model="form.available" type="checkbox" />
            <span>Товар доступен к продаже</span>
          </label>

          <div class="form-actions">
            <button :disabled="saving">{{ saving ? 'Сохраняем...' : editingProductId ? 'Сохранить' : 'Создать' }}</button>
            <button v-if="editingProductId" type="button" class="secondary-button" @click="resetForm">
              Отмена
            </button>
          </div>
        </form>

        <p v-if="message" class="success">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>Каталог товаров</h2>
          <span class="count-pill">{{ products.length }}</span>
        </div>

        <div v-if="loading" class="info-text">Загружаем товары...</div>
        <div v-else-if="products.length === 0" class="info-text">Товаров пока нет.</div>

        <div v-else class="product-list">
          <article v-for="product in products" :key="product.id" class="product-row">
            <div class="product-row__main">
              <strong>{{ product.name }}</strong>
              <span>
                {{ formatPrice(product.price) }} · {{ product.categoryName || 'Без категории' }} ·
                Остаток: {{ product.stockQuantity }}
              </span>
            </div>

            <div class="row-actions">
              <RouterLink class="secondary-link" :to="`/products/${product.id}`">Открыть</RouterLink>
              <button class="secondary-button" @click="startEdit(product)">Редактировать</button>
              <button class="danger-button" @click="removeProduct(product)">Удалить</button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { categoryService } from '../services/categoryService'
import { productService } from '../services/productService'

const categories = ref([])
const products = ref([])
const loading = ref(true)
const saving = ref(false)
const editingProductId = ref(null)
const message = ref('')
const error = ref('')

const form = reactive({
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  available: true,
  imageUrl: '',
  categoryId: '',
})

const formatPrice = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const resetForm = () => {
  editingProductId.value = null
  form.name = ''
  form.description = ''
  form.price = 0
  form.stockQuantity = 0
  form.available = true
  form.imageUrl = ''
  form.categoryId = ''
}

const reloadData = async () => {
  loading.value = true
  error.value = ''

  try {
    const [categoriesRes, productsRes] = await Promise.all([
      categoryService.getAll(),
      productService.getAll(),
    ])

    categories.value = Array.isArray(categoriesRes.data) ? categoriesRes.data : []
    products.value = Array.isArray(productsRes.data) ? productsRes.data : []
  } catch (err) {
    error.value = err?.response?.data?.message || 'Не удалось загрузить данные.'
  } finally {
    loading.value = false
  }
}

const submitProduct = async () => {
  saving.value = true
  error.value = ''
  message.value = ''

  try {
    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      stockQuantity: form.stockQuantity,
      available: form.available,
      imageUrl: form.imageUrl || null,
      categoryId: form.categoryId,
    }

    if (editingProductId.value) {
      await productService.update(editingProductId.value, payload)
      message.value = 'Товар обновлён.'
    } else {
      await productService.create(payload)
      message.value = 'Товар создан.'
    }

    resetForm()
    await reloadData()
  } catch (err) {
    error.value = err?.response?.data?.message || 'Не удалось сохранить товар.'
  } finally {
    saving.value = false
  }
}

const startEdit = (product) => {
  editingProductId.value = product.id
  form.name = product.name || ''
  form.description = product.description || ''
  form.price = product.price ?? 0
  form.stockQuantity = product.stockQuantity ?? 0
  form.available = product.available ?? true
  form.imageUrl = product.imageUrl || ''
  form.categoryId = product.categoryId || ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const removeProduct = async (product) => {
  error.value = ''
  message.value = ''

  if (!window.confirm(`Удалить товар "${product.name}"?`)) {
    return
  }

  try {
    await productService.delete(product.id)
    if (editingProductId.value === product.id) {
      resetForm()
    }
    message.value = 'Товар удалён.'
    await reloadData()
  } catch (err) {
    error.value = err?.response?.data?.message || 'Не удалось удалить товар.'
  }
}

onMounted(reloadData)
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 24px;
}

.admin-hero,
.panel {
  border: 1px solid var(--border-soft);
  border-radius: 28px;
  background: var(--surface);
  box-shadow: var(--shadow-soft);
}

.admin-hero {
  padding: 28px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
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

.admin-hero h1,
.panel h2 {
  margin: 0;
}

.subtitle,
.info-text {
  color: var(--text-soft);
}

.hero-actions,
.form-actions,
.row-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.admin-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 24px;
}

.panel {
  padding: 24px;
}

.admin-form,
.product-list {
  display: grid;
  gap: 14px;
}

.checkbox-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.checkbox-row input {
  width: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}

.count-pill {
  min-width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(31, 111, 95, 0.12);
  color: var(--accent-strong);
  font-weight: 700;
}

.product-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(28, 35, 32, 0.08);
  background: rgba(255, 255, 255, 0.78);
}

.product-row__main {
  display: grid;
  gap: 6px;
}

.product-row__main span {
  color: var(--text-soft);
}

.secondary-link,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 16px;
  border-radius: 14px;
  text-decoration: none;
  border: 1px solid var(--border-soft);
  background: white;
  color: var(--text-strong);
}

.danger-button {
  background: #b42318;
}

.success {
  color: #157347;
}

.error {
  color: #b42318;
}

@media (max-width: 980px) {
  .admin-grid {
    grid-template-columns: 1fr;
  }

  .admin-hero,
  .product-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
