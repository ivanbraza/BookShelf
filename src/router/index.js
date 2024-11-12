import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterVue.vue'
import HomePage from '@/views/system/DashboardView.vue'
import DashboardView from '@/views/system/DashboardView.vue'
import BooksView from '@/views/system/BooksView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/books',
      name: 'books',
      component: BooksView
    }
  ]
})

export default router
