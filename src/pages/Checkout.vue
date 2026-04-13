<template>
  <div class="checkout-page">
    <h1>Оформление заказа</h1>

    <div v-if="loading">Загрузка...</div>

    <div v-else>
      <section class="section">
        <h2>Моя корзина</h2>

        <div v-if="cart.items.length === 0">
          Корзина пуста. Сначала добавьте товары.
        </div>

        <div v-else class="cart-list">
          <div v-for="item in cart.items" :key="item.id" class="cart-item">
            <div>
              <strong>{{ item.productName || item.name || `Товар #${item.productId}` }}</strong>
            </div>
            <div>Количество: {{ item.quantity }}</div>
            <div v-if="item.purchasePrice">Цена: {{ item.purchasePrice }} ₽</div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>Мои адреса</h2>

        <div v-if="addresses.length === 0" class="empty-block">
          У вас пока нет адресов. Создайте адрес ниже.
        </div>

        <div v-else class="address-list">
          <label
            v-for="address in addresses"
            :key="address.id"
            class="address-card"
          >
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
            <button
              type="button"
              class="delete-btn"
              @click.prevent="removeAddress(address.id)"
            >
              Удалить
            </button>
          </label>
        </div>
      </section>

      <section class="section">
        <h2>Новый адрес</h2>

        <form class="address-form" @submit.prevent="createAddress">
          <input v-model="form.city" type="text" placeholder="Город" required />
          <input v-model="form.street" type="text" placeholder="Улица" required />
          <input v-model="form.houseNumber" type="text" placeholder="Дом" required />
          <input v-model="form.postalCode" type="text" placeholder="Почтовый индекс" required />

          <button type="submit" :disabled="creatingAddress">
            {{ creatingAddress ? 'Сохраняем...' : 'Сохранить адрес' }}
          </button>
        </form>
      </section>

      <section class="section action-block">
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
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cartStore'
import { addressService } from '../services/addressService'
import { orderService } from '../services/orderService'
import { computed, onMounted, reactive, ref } from 'vue'

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
  postalCode: ''
})

const loadAddresses = async () => {
  const res = await addressService.getMyAddresses()
  addresses.value = res.data

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
      postalCode: form.postalCode
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
    addresses.value = addresses.value.filter(a => a.id !== addressId)

    if (selectedAddressId.value === addressId) {
      selectedAddressId.value = addresses.value.length ? addresses.value[0].id : null
    }

    success.value = 'Адрес удален.'
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

onMounted(() => {
  loadPage()
})
</script>

<style scoped>
.checkout-page {
  max-width: 900px;
  margin: 0 auto;
}
.section {
  margin-bottom: 28px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 10px;
}
.cart-list,
.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cart-item,
.address-card {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.address-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.address-form {
  display: grid;
  gap: 12px;
  max-width: 420px;
}
input {
  padding: 10px;
}
.order-btn,
button {
  padding: 10px 14px;
}
.delete-btn {
  margin-left: auto;
}
.action-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.error {
  color: #c62828;
}
.success {
  color: #2e7d32;
}
.empty-block {
  color: #666;
}
</style>