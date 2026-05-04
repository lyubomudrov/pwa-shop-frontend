<template>
  <div class="checkout-page">
    <section class="hero-card">
      <div>
        <p class="eyebrow">Оформление заказа</p>
        <h1>Финальный шаг перед покупкой</h1>
        <p class="subtitle">
          Выберите адрес, проверьте корзину и подтвердите оформление заказа.
        </p>
      </div>

      <div class="summary-card">
        <span>Товаров в корзине</span>
        <strong>{{ cart.totalItems }}</strong>
      </div>
    </section>

    <div v-if="loading" class="panel">Загрузка...</div>

    <div v-else class="checkout-grid">
      <section class="panel">
        <div class="section-header">
          <div>
            <p class="eyebrow">Корзина</p>
            <h2>Ваши товары</h2>
          </div>
          <RouterLink class="soft-link" to="/cart">Открыть корзину</RouterLink>
        </div>

        <div v-if="cart.items.length === 0" class="info-text">
          Корзина пуста. Сначала добавьте товары.
        </div>

        <div v-else class="cart-list">
          <article v-for="item in cart.items" :key="item.id" class="cart-item">
            <div>
              <strong>{{ item.productName || item.name || `Товар #${item.productId}` }}</strong>
              <p>Количество: {{ item.quantity }}</p>
            </div>
            <span v-if="item.purchasePrice">{{ formatPrice(item.purchasePrice) }}</span>
          </article>
        </div>
      </section>

      <section class="panel">
        <div class="section-header">
          <div>
            <p class="eyebrow">Доставка</p>
            <h2>Выберите адрес</h2>
          </div>
          <RouterLink class="soft-link" to="/profile">Управление адресами</RouterLink>
        </div>

        <div v-if="addresses.length === 0" class="info-text">
          У вас пока нет адресов. Создайте адрес ниже.
        </div>

        <div v-else class="address-list">
          <label v-for="address in addresses" :key="address.id" class="address-card">
            <input
              v-model="selectedAddressId"
              type="radio"
              name="address"
              :value="address.id"
            />
            <div>
              <div><strong>{{ address.city }}</strong></div>
              <div>{{ address.street }}, {{ address.houseNumber }}</div>
              <div>{{ address.postalCode }}</div>
            </div>
            <button type="button" class="danger-button" @click.prevent="removeAddress(address.id)">
              Удалить
            </button>
          </label>
        </div>

        <form class="address-form" @submit.prevent="createAddress">
          <input v-model="form.city" type="text" placeholder="Город" required />
          <input v-model="form.street" type="text" placeholder="Улица" required />
          <input v-model="form.houseNumber" type="text" placeholder="Дом" required />
          <input v-model="form.postalCode" type="text" placeholder="Почтовый индекс" required />

          <button :disabled="creatingAddress">
            {{ creatingAddress ? 'Сохраняем...' : 'Добавить адрес' }}
          </button>
        </form>
      </section>
    </div>

    <section class="panel action-panel">
      <button
        class="order-btn"
        :disabled="isOffline || cart.items.length === 0 || !selectedAddressId || creatingOrder"
        @click="submitOrder"
      >
        {{
          isOffline
            ? 'Оформление недоступно оффлайн'
            : creatingOrder
              ? 'Оформляем...'
              : 'Оформить заказ'
        }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '../store/cartStore'
import { addressService } from '../services/addressService'
import { orderService } from '../services/orderService'

const router = useRouter()
const cart = useCartStore()

const loading = ref(true)
const creatingAddress = ref(false)
const creatingOrder = ref(false)
const error = ref('')
const success = ref('')
const isOffline = computed(() => !navigator.onLine)

const addresses = ref([])
const selectedAddressId = ref(null)

const form = reactive({
  city: '',
  street: '',
  houseNumber: '',
  postalCode: '',
})

const formatPrice = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const loadAddresses = async () => {
  const res = await addressService.getMyAddresses()
  addresses.value = Array.isArray(res.data) ? res.data : []

  if (addresses.value.length > 0 && !selectedAddressId.value) {
    selectedAddressId.value = addresses.value[0].id
  }
}

const loadPage = async () => {
  loading.value = true
  error.value = ''

  try {
    await cart.loadCart()
    await loadAddresses()
  } catch (e) {
    error.value = 'Не удалось загрузить данные для оформления заказа.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const createAddress = async () => {
  error.value = ''
  success.value = ''
  creatingAddress.value = true

  try {
    const res = await addressService.createAddress({
      city: form.city,
      street: form.street,
      houseNumber: form.houseNumber,
      postalCode: form.postalCode,
    })

    addresses.value.push(res.data)
    selectedAddressId.value = res.data.id

    form.city = ''
    form.street = ''
    form.houseNumber = ''
    form.postalCode = ''

    success.value = 'Адрес успешно добавлен.'
  } catch (e) {
    error.value = 'Не удалось сохранить адрес.'
    console.error(e)
  } finally {
    creatingAddress.value = false
  }
}

const removeAddress = async (addressId) => {
  error.value = ''
  success.value = ''

  try {
    await addressService.deleteAddress(addressId)
    addresses.value = addresses.value.filter((address) => address.id !== addressId)

    if (selectedAddressId.value === addressId) {
      selectedAddressId.value = addresses.value.length ? addresses.value[0].id : null
    }

    success.value = 'Адрес удалён.'
  } catch (e) {
    error.value = 'Не удалось удалить адрес.'
    console.error(e)
  }
}

const submitOrder = async () => {
  error.value = ''
  success.value = ''

  if (!navigator.onLine) {
    error.value = 'Для оформления заказа нужно подключение к интернету.'
    return
  }

  if (!selectedAddressId.value) {
    error.value = 'Выберите адрес доставки.'
    return
  }

  creatingOrder.value = true

  try {
    const res = await orderService.createOrder(selectedAddressId.value)

    await cart.loadCart()
    success.value = `Заказ №${res.data.id} успешно оформлен.`

    setTimeout(() => {
      router.push('/orders')
    }, 800)
  } catch (e) {
    error.value = 'Не удалось оформить заказ.'
    console.error(e)
  } finally {
    creatingOrder.value = false
  }
}

onMounted(loadPage)
</script>

<style scoped>
.checkout-page {
  display: grid;
  gap: 24px;
}

.hero-card,
.panel {
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  background: var(--surface);
  box-shadow: var(--shadow-soft);
}

.hero-card {
  padding: 26px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: stretch;
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
.info-text,
.cart-item p {
  color: var(--text-soft);
}

.summary-card {
  min-width: 220px;
  padding: 20px;
  border-radius: 4px;
  background: #ffffff;
  border: 1px solid var(--border-soft);
  display: grid;
  gap: 8px;
}

.summary-card span {
  color: var(--text-soft);
}

.summary-card strong {
  font-size: 28px;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.cart-list,
.address-list,
.address-form {
  display: grid;
  gap: 14px;
}

.cart-item,
.address-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 18px;
  border-radius: 4px;
  border: 1px solid var(--border-soft);
  background: #ffffff;
}

.address-card input {
  width: auto;
}

.danger-button {
  background: #b42318;
}

.action-panel {
  display: grid;
  gap: 12px;
}

.order-btn {
  min-height: 52px;
}

.success {
  color: #157347;
}

.error {
  color: #b42318;
}

@media (max-width: 980px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }

  .hero-card,
  .cart-item,
  .address-card,
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
