<template>
  <div>
    <nav class="nav">
      <RouterLink to="/">Товары</RouterLink>
      <RouterLink to="/cart">Корзина</RouterLink>
      <button v-if="auth.isAuthenticated" @click="logout">Выйти</button>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from './store/authStore'

const auth = useAuthStore()

onMounted(() => {
  auth.initAuth()
})

const logout = () => {
  auth.logout()
}
</script>

<style scoped>
.nav {
  display: flex;
  gap: 16px;
  padding: 16px;
}
</style>