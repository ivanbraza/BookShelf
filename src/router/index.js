
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import DashboardView from '@/views/system/DashboardView.vue'
import BooksView from '@/views/system/BooksView.vue'
import Transactionsview from '@/views/system/Transactionsview.vue'
import RegisterVue from '@/views/auth/RegisterVue.vue'
import { getUserInformation, isAuthenticated } from '@/utils/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component:RegisterVue,
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/books',
      name: 'books',
      component: BooksView,
      meta: { requiresAuth: true }
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: Transactionsview,
      meta: { requiresAuth: true }
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash, // Target the element with the hash ID
        behavior: 'smooth', // Enables smooth scrolling
      };
    }
    return savedPosition || { x: 0, y: 0 }; // Default position
  },
})

router.beforeEach(async (to) => {
  try {
    const isLoggedIn = await isAuthenticated();
    const userMetadata = isLoggedIn ? await getUserInformation() : null;
    const isAdmin = userMetadata?.is_admin === true;

    // Prevent logged-in users from accessing login or register pages
    if (isLoggedIn && (to.name === 'login' || to.name === 'register')) {
      return { name: 'dashboard' }; // Redirect logged-in users to the dashboard
    }

    // Restrict access to admin routes
    if (isAdmin) {
      if (!['adminhome', 'adminprofile', 'users'].includes(to.name)) {
        return { name: 'adminhome' }; // Redirect admins to admin home if accessing non-admin routes
      }
    } else {
      if (['adminhome', 'adminprofile', 'users'].includes(to.name)) {
        return { name: 'dashboard' }; // Prevent non-admin users from accessing admin routes
      }
    }

    // If not logged in, block access to protected routes
    if (!isLoggedIn && to.meta.requiresAuth) {
      return { name: 'login' }; // Redirect to login
    }

    return true; // Allow navigation if none of the above conditions are met
  } catch (error) {
    console.error("Navigation error:", error);
    return { name: 'login' }; // Fallback redirect to login in case of error
  }
});


export default router
