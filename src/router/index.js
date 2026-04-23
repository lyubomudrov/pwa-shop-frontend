import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Category from '../pages/Category.vue'
import Cart from '../pages/Cart.vue'
import Checkout from '../pages/Checkout.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Orders from '../pages/Orders.vue'
import ProductDetails from '../pages/ProductDetails.vue'
import Profile from '../pages/Profile.vue'
import AdminProducts from '../pages/AdminProducts.vue'
import AdminCategories from '../pages/AdminCategories.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/category/:id',
    name: 'category',
    component: Category,
    props: true,
  },
  {
    path: '/products/:id',
    name: 'product-details',
    component: ProductDetails,
    props: true,
  },
  {
    path: '/cart',
    name: 'cart',
    component: Cart,
    meta: { requiresAuth: true },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: Checkout,
    meta: { requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'orders',
    component: Orders,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: AdminProducts,
    meta: { requiresAuth: true, adminOnly: true },
  },
  {
    path: '/admin/categories',
    name: 'admin-categories',
    component: AdminCategories,
    meta: { requiresAuth: true, adminOnly: true },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { guestOnly: true },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const isAuthenticated = !!token
  const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN'

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return '/'
  }

  if (to.meta.adminOnly && !isAdmin) {
    return '/'
  }

  return true
})
