<template>
  <div class="app-shell">
    <div v-if="!isOnline" class="network-banner offline">
      Вы оффлайн. Каталог и корзина продолжат работать локально.
    </div>

    <div v-else-if="cart.pendingCount > 0 || cart.isSyncing" class="network-banner syncing">
      <span v-if="cart.isSyncing">Синхронизируем локальные изменения...</span>
      <span v-else>Есть несинхронизированные изменения: {{ cart.pendingCount }}</span>
    </div>

    <header class="site-header">
      <div class="site-header__inner">
        <RouterLink to="/" class="brand">
          <span class="brand__badge">PWA</span>
          <span>
            <strong>PWA Shop</strong>
            <small>магазин с корзиной, заказами и оффлайн-режимом</small>
          </span>
        </RouterLink>

        <form class="header-search" role="search" @submit.prevent="submitSearch">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Поиск"
            aria-label="Поиск товаров"
          />
          <button type="submit">Найти</button>
        </form>

        <nav class="nav">
          <RouterLink to="/">Главная</RouterLink>
          <RouterLink v-if="auth.isAuthenticated" to="/cart">
            Корзина <span class="pill">{{ cart.totalItems }}</span>
          </RouterLink>
          <RouterLink v-if="auth.isAuthenticated" to="/checkout">Оформление</RouterLink>
          <RouterLink v-if="auth.isAuthenticated" to="/orders">Заказы</RouterLink>
          <RouterLink v-if="auth.isAuthenticated" to="/profile">Профиль</RouterLink>
          <RouterLink v-if="auth.isAdmin" to="/admin/products">Товары</RouterLink>
          <RouterLink v-if="auth.isAdmin" to="/admin/categories">Категории</RouterLink>
        </nav>

        <div class="nav-right">
          <template v-if="auth.isAuthenticated">
            <div class="user-meta">
              <span class="user-name">
                {{ displayName }}
              </span>
              <span class="user-email">{{ auth.user?.email }}</span>
            </div>
            <button class="ghost-button" @click="logout">Выйти</button>
          </template>

          <template v-else>
            <RouterLink class="ghost-link" to="/login">Войти</RouterLink>
            <RouterLink class="primary-link" to="/register">Регистрация</RouterLink>
          </template>
        </div>
      </div>
    </header>

    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import { useOnline } from './composables/useOnline'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const route = useRoute()
const { isOnline } = useOnline()
const searchQuery = ref('')
const displayName = computed(() => {
  const firstName = auth.user?.firstName || ''
  const lastName = auth.user?.lastName || ''
  const fullName = `${firstName} ${lastName}`.trim()

  return fullName || auth.user?.email || ''
})

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

watch(
  () => route.query.q,
  (value) => {
    searchQuery.value = typeof value === 'string' ? value : ''
  },
  { immediate: true }
)

const submitSearch = () => {
  const query = searchQuery.value.trim()

  router.push({
    path: '/',
    query: query ? { q: query } : {},
  })
}

const logout = async () => {
  auth.logout()
  await cart.clearCart()
  router.push('/login')
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

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
  background: #d8eef5;
  color: #0f4c5c;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid var(--border-soft);
}

.site-header__inner {
  max-width: 1240px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: var(--text-strong);
  text-decoration: none;
}

.brand strong,
.brand small {
  display: block;
}

.brand small {
  color: var(--text-soft);
  font-size: 12px;
}

.brand__badge {
  width: 42px;
  height: 42px;
  display: inline-grid;
  place-items: center;
  border-radius: 4px;
  background: #111111;
  color: white;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.nav,
.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.header-search {
  flex: 1 1 260px;
  max-width: 380px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-search input {
  min-height: 40px;
  padding: 0 12px;
  border-color: rgba(17, 17, 17, 0.18);
  background: #f6f6f6;
}

.header-search button {
  min-height: 40px;
  padding: 0 14px;
}

.nav :deep(a),
.ghost-link,
.primary-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 4px;
  color: var(--text-strong);
  text-decoration: none;
}

.nav :deep(a.router-link-active) {
  background: #111111;
  color: #ffffff;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 28px 20px 56px;
}

.pill {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-grid;
  place-items: center;
  background: #eeeeee;
  color: #111111;
  font-size: 12px;
  font-weight: 700;
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-strong);
}

.user-email {
  font-size: 12px;
  color: var(--text-soft);
}

.ghost-button,
.ghost-link {
  border: 1px solid var(--border-soft);
  background: white;
}

.primary-link {
  background: #111111;
  color: white;
}

@media (max-width: 980px) {
  .site-header__inner {
    align-items: stretch;
  }

  .user-meta {
    align-items: flex-start;
  }
}

</style>
