import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Category from '../pages/Category.vue'
import Cart from '../pages/Cart.vue'
import Checkout from '../pages/Checkout.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/category/:id', component: Category },
  { path: '/cart', component: Cart },
  { path: '/checkout', component: Checkout }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
