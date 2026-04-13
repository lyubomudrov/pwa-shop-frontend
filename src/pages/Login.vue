<template>
  <div class="auth-page">
    <h1>Вход</h1>

    <form class="auth-form" @submit.prevent="submit">
      <label>
        Email
        <input v-model="form.email" type="email" required />
      </label>

      <label>
        Пароль
        <input v-model="form.password" type="password" required />
      </label>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Входим...' : 'Войти' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: ''
})

const submit = async () => {
  error.value = ''
  loading.value = true

  try {
    await auth.login({
      email: form.email,
      password: form.password
    })

    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    error.value = 'Не удалось войти. Проверь email и пароль.'
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  max-width: 420px;
  margin: 40px auto;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
input {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}
button {
  padding: 10px 14px;
}
.error {
  color: #c62828;
}
</style>