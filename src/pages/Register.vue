<template>
  <div class="auth-page">
    <h1>Регистрация</h1>

    <form class="auth-form" @submit.prevent="submit">
      <label>
        Имя
        <input v-model="form.firstName" type="text" required />
      </label>

      <label>
        Фамилия
        <input v-model="form.lastName" type="text" required />
      </label>

      <label>
        Email
        <input v-model="form.email" type="email" required />
      </label>

      <label>
        Пароль
        <input v-model="form.password" type="password" minlength="8" required />
      </label>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Регистрируем...' : 'Зарегистрироваться' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const auth = useAuthStore()
const router = useRouter()

const loading = ref(false)
const error = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
})

const submit = async () => {
  error.value = ''
  loading.value = true

  try {
    await auth.register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password
    })

    router.push('/')
  } catch (e) {
    error.value = 'Не удалось зарегистрироваться. Возможно, такой email уже существует.'
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  max-width: 474px;
  margin: 64px auto;
}

.auth-page h1 {
  margin: 0 0 28px;
  text-align: center;
  font-size: 24px;
  font-weight: 400;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.auth-form label {
  display: grid;
  gap: 8px;
  color: #777777;
  font-size: 12px;
  font-weight: 400;
}

input {
  width: 100%;
  padding: 12px 0;
  box-sizing: border-box;
  border-width: 0 0 1px;
  border-radius: 0;
  background: transparent;
}

input:focus {
  outline: none;
  border-color: #111111;
}

button {
  min-height: 52px;
  margin-top: 64px;
  padding: 0 14px;
  border-radius: 4px;
  font-weight: 400;
}

.error {
  color: #c62828;
  font-size: 12px;
}
</style>
