<template>
  <div class="profile-page">
    <section class="hero-card">
      <div>
        <p class="eyebrow">Личный кабинет</p>
        <h1>{{ fullName }}</h1>
        <p class="subtitle">{{ userStore.profile?.email || auth.user?.email }}</p>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <span>Адресов</span>
          <strong>{{ userStore.addresses.length }}</strong>
        </div>
        <div class="summary-card">
          <span>Заказов</span>
          <strong>{{ userStore.orders.length }}</strong>
        </div>
        <div class="summary-card">
          <span>Роль</span>
          <strong>{{ auth.isAdmin ? 'Администратор' : 'Покупатель' }}</strong>
        </div>
      </div>
    </section>

    <div class="profile-grid">
      <section class="panel">
        <div class="section-header">
          <div>
            <p class="eyebrow">Адреса</p>
            <h2>Сохранённые адреса</h2>
          </div>
          <RouterLink class="soft-link" to="/checkout">Перейти к оформлению</RouterLink>
        </div>

        <div v-if="userStore.isLoadingAddresses" class="info-text">Загружаем адреса...</div>

        <div v-else-if="userStore.addresses.length === 0" class="info-text">
          У вас пока нет сохранённых адресов.
        </div>

        <div v-else class="address-list">
          <article v-for="address in userStore.addresses" :key="address.id" class="address-card">
            <div>
              <strong>{{ address.city }}</strong>
              <p>{{ address.street }}, {{ address.houseNumber }}</p>
              <span>{{ address.postalCode }}</span>
            </div>
            <button class="danger-button" @click="removeAddress(address.id)">Удалить</button>
          </article>
        </div>
      </section>

      <section class="panel">
        <div class="section-header">
          <div>
            <p class="eyebrow">Новый адрес</p>
            <h2>Добавить адрес</h2>
          </div>
        </div>

        <form class="address-form" @submit.prevent="createAddress">
          <input v-model="form.city" type="text" placeholder="Город" required />
          <input v-model="form.street" type="text" placeholder="Улица" required />
          <input v-model="form.houseNumber" type="text" placeholder="Дом" required />
          <input v-model="form.postalCode" type="text" placeholder="Почтовый индекс" required />
          <button :disabled="savingAddress">
            {{ savingAddress ? 'Сохраняем...' : 'Сохранить адрес' }}
          </button>
        </form>
        <p v-if="message" class="success">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </section>
    </div>

    <section class="panel">
      <div class="section-header">
        <div>
          <p class="eyebrow">История заказов</p>
          <h2>Последние покупки</h2>
        </div>
        <RouterLink class="soft-link" to="/orders">Все заказы</RouterLink>
      </div>

      <div v-if="userStore.isLoadingOrders" class="info-text">Загружаем заказы...</div>
      <div v-else-if="userStore.orders.length === 0" class="info-text">Заказов пока нет.</div>

      <div v-else class="order-list">
        <article v-for="order in userStore.orders.slice(0, 3)" :key="order.id" class="order-card">
          <div class="order-card__top">
            <strong>Заказ №{{ order.id }}</strong>
            <span>{{ order.status }}</span>
          </div>
          <p>{{ formatDate(order.orderDate) }}</p>
          <p>{{ formatPrice(order.totalAmount) }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { useUserStore } from '../store/userStore'

const auth = useAuthStore()
const userStore = useUserStore()

const savingAddress = ref(false)
const message = ref('')
const error = ref('')

const form = reactive({
  city: '',
  street: '',
  houseNumber: '',
  postalCode: '',
})

const fullName = computed(() => {
  const firstName = userStore.profile?.firstName || auth.user?.firstName || ''
  const lastName = userStore.profile?.lastName || auth.user?.lastName || ''
  return `${firstName} ${lastName}`.trim() || 'Профиль пользователя'
})

const formatDate = (value) => {
  if (!value) return 'Дата не указана'

  try {
    return new Date(value).toLocaleString('ru-RU')
  } catch {
    return value
  }
}

const formatPrice = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const loadPage = async () => {
  await Promise.all([
    userStore.loadProfile(),
    userStore.loadAddresses(),
    userStore.loadOrders(),
  ])
}

const createAddress = async () => {
  error.value = ''
  message.value = ''
  savingAddress.value = true

  try {
    await userStore.addAddress({ ...form })
    form.city = ''
    form.street = ''
    form.houseNumber = ''
    form.postalCode = ''
    message.value = 'Адрес успешно добавлен.'
  } catch (err) {
    error.value = err?.response?.data?.message || 'Не удалось сохранить адрес.'
  } finally {
    savingAddress.value = false
  }
}

const removeAddress = async (addressId) => {
  error.value = ''
  message.value = ''

  try {
    await userStore.deleteAddress(addressId)
    message.value = 'Адрес удалён.'
  } catch (err) {
    error.value = err?.response?.data?.message || 'Не удалось удалить адрес.'
  }
}

onMounted(loadPage)
</script>

<style scoped>
.profile-page {
  display: grid;
  gap: 24px;
}

.hero-card,
.panel {
  border: 1px solid var(--border-soft);
  border-radius: 28px;
  background: var(--surface);
  box-shadow: var(--shadow-soft);
}

.hero-card {
  padding: 28px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: var(--accent-strong);
  font-weight: 700;
}

.hero-card h1,
.section-header h2 {
  margin: 0;
}

.subtitle,
.info-text {
  color: var(--text-soft);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.summary-card {
  border-radius: 18px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(28, 35, 32, 0.08);
}

.summary-card span {
  display: block;
  color: var(--text-soft);
  font-size: 13px;
}

.summary-card strong {
  display: block;
  margin-top: 4px;
  font-size: 20px;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
}

.panel {
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.soft-link {
  color: var(--accent-strong);
  text-decoration: none;
}

.address-list,
.order-list {
  display: grid;
  gap: 14px;
}

.address-card,
.order-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(28, 35, 32, 0.08);
  background: rgba(255, 255, 255, 0.76);
}

.address-card p,
.address-card span,
.order-card p {
  margin: 4px 0 0;
  color: var(--text-soft);
}

.address-form {
  display: grid;
  gap: 12px;
}

.danger-button {
  background: #b42318;
}

.order-card__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.success {
  color: #157347;
}

.error {
  color: #b42318;
}

@media (max-width: 980px) {
  .hero-card,
  .profile-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .address-card,
  .order-card,
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
