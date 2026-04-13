import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Category from '../pages/Category.vue'
import Cart from '../pages/Cart.vue'
import Checkout from '../pages/Checkout.vue'
import Orders from '../pages/Orders.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import { useAuthStore } from '../store/authStore'

const routes = [
  { path: '/', component: Home },
  { path: '/category/:id', component: Category },
  { path: '/cart', component: Cart, meta: { requiresAuth: true } },
  { path: '/checkout', component: Checkout, meta: { requiresAuth: true } },
  { path: '/orders', component: Orders, meta: { requiresAuth: true } },
  { path: '/login', component: Login, meta: { guestOnly: true } },
  { path: '/register', component: Register, meta: { guestOnly: true } }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.isInitialized) {
    await auth.initAuth()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return '/'
  }
})