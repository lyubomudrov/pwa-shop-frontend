<template>
  <div>
    <nav class="nav">
      <div class="nav-left">
        <RouterLink to="/">Товары</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/cart">Корзина</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/checkout">Оформление</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/orders">Мои заказы</RouterLink>
      </div>

      <div class="nav-right">
        <template v-if="auth.isAuthenticated">
          <span class="user-email">{{ auth.user?.email }}</span>
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
import { onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from './store/authStore'

const auth = useAuthStore()
const router = useRouter()

onMounted(() => {
  auth.initAuth()
})

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
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