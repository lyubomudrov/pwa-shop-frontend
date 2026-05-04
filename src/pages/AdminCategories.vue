<template>
  <div class="admin-page">
    <section class="admin-hero">
      <div>
        <p class="eyebrow">Администрирование</p>
        <h1>Управление категориями</h1>
        <p class="subtitle">Поддерживайте структуру каталога и описания разделов.</p>
      </div>
      <div class="hero-actions">
        <RouterLink class="secondary-link" to="/admin/products">Товары</RouterLink>
        <button @click="reloadData">Обновить данные</button>
      </div>
    </section>

    <div class="admin-grid">
      <section class="panel">
        <h2>{{ editingCategoryId ? 'Редактирование категории' : 'Новая категория' }}</h2>

        <form class="admin-form" @submit.prevent="submitCategory">
          <input v-model="form.name" type="text" placeholder="Название категории" required />
          <textarea v-model="form.description" placeholder="Описание категории" />
          <div class="form-actions">
            <button :disabled="saving">{{ saving ? 'Сохраняем...' : editingCategoryId ? 'Сохранить' : 'Создать' }}</button>
            <button v-if="editingCategoryId" type="button" class="secondary-button" @click="resetForm">
              Отмена
            </button>
          </div>
        </form>

        <p v-if="message" class="success">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>Список категорий</h2>
          <span class="count-pill">{{ categories.length }}</span>
        </div>

        <div v-if="loading" class="info-text">Загружаем категории...</div>
        <div v-else-if="categories.length === 0" class="info-text">Категорий пока нет.</div>

        <div v-else class="category-list">
          <article v-for="category in categories" :key="category.id" class="category-row">
            <div class="category-row__main">
              <strong>{{ category.name }}</strong>
              <span>{{ category.description || 'Описание не указано' }}</span>
            </div>

            <div class="row-actions">
              <RouterLink class="secondary-link" :to="`/category/${category.id}`">Открыть</RouterLink>
              <button class="secondary-button" @click="startEdit(category)">Редактировать</button>
              <button class="danger-button" @click="removeCategory(category)">Удалить</button>
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

const categories = ref([])
const loading = ref(true)
const saving = ref(false)
const editingCategoryId = ref(null)
const message = ref('')
const error = ref('')

const form = reactive({
  name: '',
  description: '',
})

const resetForm = () => {
  editingCategoryId.value = null
  form.name = ''
  form.description = ''
}

const reloadData = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await categoryService.getAll()
    categories.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    error.value = err?.response?.data?.message || 'Не удалось загрузить категории.'
  } finally {
    loading.value = false
  }
}

const submitCategory = async () => {
  saving.value = true
  message.value = ''
  error.value = ''

  try {
    const payload = {
      name: form.name,
      description: form.description || null,
    }

    if (editingCategoryId.value) {
      await categoryService.update(editingCategoryId.value, payload)
      message.value = 'Категория обновлена.'
    } else {
      await categoryService.create(payload)
      message.value = 'Категория создана.'
    }

    resetForm()
    await reloadData()
  } catch (err) {
    error.value = err?.response?.data?.message || 'Не удалось сохранить категорию.'
  } finally {
    saving.value = false
  }
}

const startEdit = (category) => {
  editingCategoryId.value = category.id
  form.name = category.name || ''
  form.description = category.description || ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const removeCategory = async (category) => {
  error.value = ''
  message.value = ''

  if (!window.confirm(`Удалить категорию "${category.name}"?`)) {
    return
  }

  try {
    await categoryService.delete(category.id)
    if (editingCategoryId.value === category.id) {
      resetForm()
    }
    message.value = 'Категория удалена.'
    await reloadData()
  } catch (err) {
    error.value = err?.response?.data?.message || 'Не удалось удалить категорию.'
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
  border-radius: 6px;
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
  grid-template-columns: 0.8fr 1.2fr;
  gap: 24px;
}

.panel {
  padding: 24px;
}

.admin-form,
.category-list {
  display: grid;
  gap: 14px;
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
  background: #eeeeee;
  color: #111111;
  font-weight: 700;
}

.category-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border-radius: 4px;
  border: 1px solid var(--border-soft);
  background: #ffffff;
}

.category-row__main {
  display: grid;
  gap: 6px;
}

.category-row__main span {
  color: var(--text-soft);
}

.secondary-link,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 16px;
  border-radius: 4px;
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
  .category-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
