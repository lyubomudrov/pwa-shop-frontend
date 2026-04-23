<template>
  <div>
    <div v-if="!isOnline" class="network-banner offline">
      Вы оффлайн. Каталог и корзина работают локально.
    </div>

    <div v-else-if="cart.pendingCount > 0 || cart.isSyncing" class="network-banner syncing">
      <span v-if="cart.isSyncing">Синхронизируем локальные изменения...</span>
      <span v-else>Есть несинхронизированные изменения: {{ cart.pendingCount }}</span>
    </div>

    <nav class="nav">
      <div class="nav-left">
        <RouterLink to="/">Товары</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/cart">Корзина</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/checkout">Оформление</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/orders">Мои заказы</RouterLink>
      </div>

      <div class="nav-right">
        <template v-if="auth.isAuthenticated">
          <div class="user-meta">
            <span class="user-email">{{ auth.user?.email }}</span>
          </div>
          <button @click="logout">Выйти</button>
        </template>

        <template v-else>
          <RouterLink to="/login">Войти</RouterLink>
          <RouterLink to="/register">Регистрация</RouterLink>
        </template>
      </div>
    </nav>

    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import { useOnline } from './composables/useOnline'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const { isOnline } = useOnline()

onMounted(async () => {
  await auth.initAuth()
  await cart.initOfflineState()

  if (auth.isAuthenticated) {
    await cart.loadCart()
    await cart.syncPendingActions()
  }
})

watch(isOnline, async (online) => {
  if (online && auth.isAuthenticated) {
    await cart.syncPendingActions()
  }
})

const logout = async () => {
  auth.logout()
  await cart.clearCart()
  router.push('/login')
}
</script>

<style scoped>
.network-banner {
  padding: 10px 16px;
  text-align: center;
  font-size: 14px;
}

.offline {
  background: #fff3cd;
  color: #7a5a00;
}

.syncing {
  background: #e8f0fe;
  color: #174ea6;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #ddd;
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.container {
  padding: 16px;
}

.user-email {
  font-size: 14px;
  color: #555;
}


</style>