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

    <section v-if="auth.isAdmin" class="admin-panel">
      <div class="admin-header">
        <h2>Панель администратора</h2>
        <button class="refresh-btn" @click="reloadData">Обновить данные</button>
      </div>

      <div class="admin-grid">
        <form class="admin-card" @submit.prevent="submitCategory">
          <h3>
            {{ editingCategoryId ? 'Редактировать категорию' : 'Добавить категорию' }}
          </h3>

          <input
            v-model="categoryForm.name"
            type="text"
            placeholder="Название категории"
            required
          />

          <input
            v-model="categoryForm.description"
            type="text"
            placeholder="Описание категории"
          />

          <div class="form-actions">
            <button type="submit" :disabled="savingCategory">
              {{
                savingCategory
                  ? 'Сохраняем...'
                  : editingCategoryId
                    ? 'Сохранить изменения'
                    : 'Создать категорию'
              }}
            </button>

            <button
              v-if="editingCategoryId"
              type="button"
              class="secondary-btn"
              @click="resetCategoryForm"
            >
              Отмена
            </button>
          </div>
        </form>

        <form class="admin-card" @submit.prevent="submitProduct">
          <h3>
            {{ editingProductId ? 'Редактировать товар' : 'Добавить товар' }}
          </h3>

          <input v-model="productForm.name" type="text" placeholder="Название" required />
          <input v-model="productForm.description" type="text" placeholder="Описание" required />
          <input
            v-model.number="productForm.price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Цена"
            required
          />
          <input
            v-model.number="productForm.stockQuantity"
            type="number"
            min="0"
            placeholder="Количество"
            required
          />
          <input v-model="productForm.imageUrl" type="text" placeholder="Ссылка на изображение" />

          <select v-model.number="productForm.categoryId" required>
            <option disabled value="">Выберите категорию</option>
            <option
              v-for="category in productsStore.categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>

          <label class="checkbox-row">
            <input v-model="productForm.available" type="checkbox" />
            <span>Доступен для продажи</span>
          </label>

          <div class="form-actions">
            <button type="submit" :disabled="savingProduct">
              {{
                savingProduct
                  ? 'Сохраняем...'
                  : editingProductId
                    ? 'Сохранить изменения'
                    : 'Создать товар'
              }}
            </button>

            <button
              v-if="editingProductId"
              type="button"
              class="secondary-btn"
              @click="resetProductForm"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>

      <p v-if="adminMessage" class="success">{{ adminMessage }}</p>
      <p v-if="adminError" class="error">{{ adminError }}</p>

      <div class="admin-lists">
        <div class="list-card">
          <h3>Категории</h3>

          <div v-if="productsStore.categories.length === 0" class="empty-text">
            Категорий пока нет.
          </div>

          <div v-else class="admin-list">
            <div
              v-for="category in productsStore.categories"
              :key="category.id"
              class="list-row"
            >
              <div class="list-row__content">
                <strong>{{ category.name }}</strong>
                <span>{{ category.description || 'Без описания' }}</span>
              </div>

              <div class="list-row__actions">
                <button class="secondary-btn" @click="startEditCategory(category)">
                  Редактировать
                </button>
                <button class="danger-btn" @click="removeCategory(category)">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="list-card">
          <h3>Товары</h3>

          <div v-if="allProducts.length === 0" class="empty-text">
            Товаров пока нет.
          </div>

          <div v-else class="admin-list">
            <div
              v-for="product in allProducts"
              :key="product.id"
              class="list-row"
            >
              <div class="list-row__content">
                <strong>{{ product.name }}</strong>
                <span>
                  {{ product.price }} ₽ ·
                  {{ product.categoryName || 'Без категории' }} ·
                  Остаток: {{ product.stockQuantity }}
                </span>
              </div>

              <div class="list-row__actions">
                <button class="secondary-btn" @click="startEditProduct(product)">
                  Редактировать
                </button>
                <button class="danger-btn" @click="removeProduct(product)">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Категории</h2>
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
          <h3>{{ category.name }}</h3>
          <p>{{ category.description || 'Перейти к товарам категории' }}</p>
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
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ProductList from '../components/ProductList.vue'
import { useProductStore } from '../store/productStore'
import { useAuthStore } from '../store/authStore'
import { categoryService } from '../services/categoryService'
import { productService } from '../services/productService'

const productsStore = useProductStore()
const auth = useAuthStore()

const savingCategory = ref(false)
const savingProduct = ref(false)
const adminError = ref('')
const adminMessage = ref('')

const editingCategoryId = ref(null)
const editingProductId = ref(null)

const categoryForm = reactive({
  name: '',
  description: '',
})

const productForm = reactive({
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  available: true,
  imageUrl: '',
  categoryId: '',
})

const allProducts = computed(() => productsStore.products)

const clearMessages = () => {
  adminError.value = ''
  adminMessage.value = ''
}

const reloadData = async () => {
  clearMessages()

  try {
    await productsStore.loadCategories()
    await productsStore.loadAllProducts()
  } catch (e) {
    adminError.value = 'Не удалось загрузить данные.'
    console.error(e)
  }
}

const resetCategoryForm = () => {
  editingCategoryId.value = null
  categoryForm.name = ''
  categoryForm.description = ''
}

const resetProductForm = () => {
  editingProductId.value = null
  productForm.name = ''
  productForm.description = ''
  productForm.price = 0
  productForm.stockQuantity = 0
  productForm.available = true
  productForm.imageUrl = ''
  productForm.categoryId = ''
}

const submitCategory = async () => {
  clearMessages()
  savingCategory.value = true

  try {
    const payload = {
      name: categoryForm.name,
      description: categoryForm.description || null,
    }

    if (editingCategoryId.value) {
      await categoryService.update(editingCategoryId.value, payload)
      adminMessage.value = 'Категория успешно обновлена.'
    } else {
      await categoryService.create(payload)
      adminMessage.value = 'Категория успешно создана.'
    }

    resetCategoryForm()
    await reloadData()
  } catch (e) {
    adminError.value = e?.response?.data?.message || 'Не удалось сохранить категорию.'
    console.error(e)
  } finally {
    savingCategory.value = false
  }
}

const submitProduct = async () => {
  clearMessages()
  savingProduct.value = true

  try {
    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: productForm.price,
      stockQuantity: productForm.stockQuantity,
      available: productForm.available,
      imageUrl: productForm.imageUrl || null,
      categoryId: productForm.categoryId,
    }

    if (editingProductId.value) {
      await productService.update(editingProductId.value, payload)
      adminMessage.value = 'Товар успешно обновлен.'
    } else {
      await productService.create(payload)
      adminMessage.value = 'Товар успешно создан.'
    }

    resetProductForm()
    await reloadData()
  } catch (e) {
    adminError.value = e?.response?.data?.message || 'Не удалось сохранить товар.'
    console.error(e)
  } finally {
    savingProduct.value = false
  }
}

const startEditCategory = (category) => {
  clearMessages()
  editingCategoryId.value = category.id
  categoryForm.name = category.name || ''
  categoryForm.description = category.description || ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const startEditProduct = (product) => {
  clearMessages()
  editingProductId.value = product.id
  productForm.name = product.name || ''
  productForm.description = product.description || ''
  productForm.price = product.price ?? 0
  productForm.stockQuantity = product.stockQuantity ?? 0
  productForm.available = product.available ?? true
  productForm.imageUrl = product.imageUrl || ''
  productForm.categoryId = product.categoryId || ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const removeCategory = async (category) => {
  clearMessages()

  const confirmed = window.confirm(
    `Удалить категорию "${category.name}"?`
  )

  if (!confirmed) return

  try {
    await categoryService.delete(category.id)
    adminMessage.value = 'Категория успешно удалена.'
    if (editingCategoryId.value === category.id) {
      resetCategoryForm()
    }
    await reloadData()
  } catch (e) {
    adminError.value =
      e?.response?.data?.message ||
      'Не удалось удалить категорию. Возможно, в ней есть товары.'
    console.error(e)
  }
}

const removeProduct = async (product) => {
  clearMessages()

  const confirmed = window.confirm(
    `Удалить товар "${product.name}"?`
  )

  if (!confirmed) return

  try {
    await productService.delete(product.id)
    adminMessage.value = 'Товар успешно удален.'
    if (editingProductId.value === product.id) {
      resetProductForm()
    }
    await reloadData()
  } catch (e) {
    adminError.value = e?.response?.data?.message || 'Не удалось удалить товар.'
    console.error(e)
  }
}

onMounted(async () => {
  await reloadData()
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
}

.admin-panel {
  margin-bottom: 32px;
  padding: 22px;
  border: 1px solid #e5e5e5;
  border-radius: 18px;
  background: #fafafa;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.admin-header h2 {
  margin: 0;
}

.admin-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 20px;
}

.admin-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border-radius: 14px;
  background: white;
  border: 1px solid #e8e8e8;
}

.admin-card h3 {
  margin: 0 0 6px;
}

.admin-card input,
.admin-card select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font: inherit;
}

.form-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-lists {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 20px;
}

.list-card {
  padding: 18px;
  border-radius: 14px;
  background: white;
  border: 1px solid #e8e8e8;
}

.list-card h3 {
  margin-top: 0;
  margin-bottom: 14px;
}

.admin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 14px;
  border: 1px solid #eee;
  border-radius: 12px;
}

.list-row__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-row__content span {
  color: #666;
  font-size: 14px;
}

.list-row__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

.refresh-btn,
.admin-card button,
.secondary-btn,
.danger-btn {
  border: none;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  font: inherit;
}

.refresh-btn,
.admin-card button {
  background: #111;
  color: white;
}

.secondary-btn {
  background: #ececec;
  color: #111;
}

.danger-btn {
  background: #c62828;
  color: white;
}

.info-text {
  color: #666;
  padding: 12px 0;
}

.empty-text {
  color: #666;
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

.success {
  margin-top: 16px;
  color: #2e7d32;
}

.error {
  margin-top: 16px;
  color: #c62828;
}

@media (max-width: 900px) {
  .admin-grid,
  .admin-lists {
    grid-template-columns: 1fr;
  }

  .admin-header,
  .section-header,
  .list-row {
    flex-direction: column;
    align-items: stretch;
  }

  .list-row__actions {
    justify-content: flex-start;
  }
}
</style>