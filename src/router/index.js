
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import DashboardView from '@/views/system/DashboardView.vue'
import BooksView from '@/views/system/BooksView.vue'
import Transactionsview from '@/views/system/Transactionsview.vue'
import RegisterVue from '@/views/auth/RegisterVue.vue'
import { getUserInformation, isAuthenticated } from '@/utils/supabase'
import BorrowRequestView from '@/views/system/BorrowRequestView.vue'
// import AdminDashboardView from '@/views/system/LibrarianDashboardView.vue'
import LibrarianDashboardView from '@/views/system/LibrarianDashboardView.vue'
import AdminTransactionView from '@/views/system/AdminTransactionView.vue'

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
    {
      path: '/borrow_request',
      name: 'borrow_request',
      component: BorrowRequestView,
      meta: { requiresAuth: true }
    },
    {
      path: '/librarian_dashboard',
      name: 'librarian_dashboard',
      component: LibrarianDashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin_transactions',
      name: 'admin_transactions',
      component: AdminTransactionView,
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
    const userRole = userMetadata?.role;

    // Prevent logged-in users from accessing login or register pages
    if (isLoggedIn && (to.name === 'login' || to.name === 'register')) {
      return { name: 'dashboard' }; // Redirect logged-in users to the dashboard
    }

    // Define accessible routes for each role
    const roleBasedRoutes = {
      Borrower: ['dashboard', 'books', 'transactions'], // Routes allowed for Borrowers
      Librarian: ['librarian_dashboard', 'admin_transactions', 'borrow_request'], // Routes allowed for Librarians
    };

    // Redirect users based on their role and requested route
    if (isLoggedIn) {
      if (userRole === 'Borrower' && !roleBasedRoutes.Borrower.includes(to.name)) {
        // Prevent Borrowers from accessing Librarian-only routes
        return { name: 'dashboard' };
      } 
      if (userRole === 'Librarian' && !roleBasedRoutes.Librarian.includes(to.name)) {
        // Prevent Librarians from accessing Borrower-only routes
        return { name: 'librarian_dashboard' }; // Redirect to librarian's dashboard
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
