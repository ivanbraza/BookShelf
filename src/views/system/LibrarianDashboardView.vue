
<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar class="app-bar bg" elevation="4">
      <v-btn v-if="mobile" icon @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-img src="/images/logo.png" class="mx-3 my-4" max-width="50px"></v-img>
      <!-- Logout Button in App Bar -->
    </v-app-bar>

    <!-- Main Content -->
    <v-row class="main-container">
      <!-- Sidebar Navigation Drawer -->
      <v-navigation-drawer
        v-model="drawer"
        :temporary="mobile"
        location="left"
        :permanent="!mobile"
        style="background-color: #E7F0DC"
      >
      <template v-slot:prepend>
          <v-divider></v-divider>
          <v-list-item
            lines="two"
            subtitle="Logged in"
            :title="`${firstName || '...'} ${lastName || '...'}`"
          > <template v-slot:prepend>
          <v-avatar color="primary" size="45">
            <span class="white--text text-h6">
              {{ getInitials(firstName, lastName) }}
            </span>
          </v-avatar>
        </template>
        </v-list-item>
        </template>

        <!-- Navigation Links -->
        <v-list density="compact" nav>
          <v-divider></v-divider>
          <v-list-item
            class="mt-8 nav-title black-text"
            prepend-icon="mdi-home"
            title="Home"
            @click="drawer = mobile ? false : drawer; $router.push('/librarian_dashboard')"
          ></v-list-item>
          <v-list-item
            class="mt-6 nav-title black-text"
            prepend-icon="mdi-book-plus"
            title="Borrow Requests"
            @click="drawer = mobile ? false : drawer; $router.push('/borrow_request')"
          ></v-list-item>
          <v-list-item
            class="mt-6 nav-title black-text"
            prepend-icon="mdi-account-credit-card"
            title="Transactions"
            @click="drawer = mobile ? false : drawer; $router.push('/admin_transactions')"
          ></v-list-item>
          
          <!-- Logout Link -->
          <v-list-item
            class="mt-6 nav-title black-text"
            prepend-icon="mdi-logout"
            title="Logout"
            @click="openLogoutModal"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <!-- Dashboard Content -->

      <v-main class="content-area bg-3 particle-overlay " >
        <v-col cols="12" md="9">
          <v-row justify="center" align="center" class="pa-6">
            <v-col cols="12">
              <h1 class="text-center">Library Statistics</h1>
            </v-col>
            <!-- Statistic Cards -->
            <v-col
              cols="12"
              sm="6"
              md="4"
              v-for="(value, key) in stats"
              :key="key"
            >
              <v-card class="pa-3" outlined border="black md">
                <v-icon :color="cardColor(key)" large>{{
                  getIcon(key)
                }}</v-icon>
                <h3>{{ getTitle(key) }}</h3>
                <p class="text-h4 font-weight-bold">{{ value }}</p>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-main>
    </v-row>
    <!-- Footer -->
    <v-footer class="font-weight-bold bg" color="#2e3b55" elevation="4" app>
      <v-row justify="start">
        <v-col class="text-right py-2 white-text"> 2024 - Book Shelf </v-col>
      </v-row>
    </v-footer>
    <!-- Logout Modal -->
    <LogoutModal ref="logoutModalRef" />
  </v-app>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import LogoutModal from '../auth/LogoutModal.vue'
import { supabase } from '@/utils/supabase'
import { getInitials } from '@/utils/helpers'

// Mobile detection from Vuetify's display composable
const { mobile } = useDisplay()
const drawer = ref(!mobile.value)

// Logout modal reference
const logoutModalRef = ref(null)
const openLogoutModal = () => {
  logoutModalRef.value?.open()
}

// Watch for changes in mobile status
watch(mobile, isMobile => {
  if (!isMobile) {
    drawer.value = true
  }
})

// Reactive variables
const firstName = ref('')
const lastName = ref('')

// Fetch user information
async function getUserInformation() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error fetching user information:', error.message)
    return null
  }

  if (data.user) {
    const { user } = data
    console.log('Fetched user data:', user)
    return {
      firstname: user.user_metadata.firstname || 'Guest',
      lastname: user.user_metadata.lastname || 'User',
    }
  } else {
    console.warn('No user data found.')
    return null
  }
}

// Lifecycle hook
onMounted(async () => {
  const user = await getUserInformation()
  if (user) {
    firstName.value = user.firstname
    lastName.value = user.lastname
    console.log('User data set:', {
      firstName: firstName.value,
      lastName: lastName.value,
    })
  } else {
    console.error('User not logged in or data not found.')
  }
})

// Statistics Data
const stats = ref({
  totalBooks: 1500,
  booksBorrowed: 250,
  booksReturned: 220,
  overdueBooks: 30,
  registeredBorrowers: 400,
})

// Fetch statistics on load
onMounted(() => {
  fetchStatistics()
})

const fetchStatistics = () => {
  // Replace this with your API call for dynamic data
  stats.value = {
    totalBooks: 1500,
    booksBorrowed: 250,
    booksReturned: 220,
    overdueBooks: 30,
    registeredBorrowers: 400,
  }
}

// Logout modal logic
// const logoutModalRef = ref(null)
// const openLogoutModal = () => {
//   logoutModalRef.value?.open()
// }

// Navigation Helper
// const navigateTo = path => {
//   drawer.value = mobile.value ? false : drawer.value
//   $router.push(path)
// }

// Card Icons & Titles Based on Stats
const getIcon = key => {
  const icons = {
    totalBooks: 'mdi-book',
    booksBorrowed: 'mdi-book-check',
    booksReturned: 'mdi-book-return',
    overdueBooks: 'mdi-alert-circle',
    registeredBorrowers: 'mdi-account-group',
  }
  return icons[key]
}

const getTitle = key => {
  const titles = {
    totalBooks: 'Total Books',
    booksBorrowed: 'Books Borrowed',
    booksReturned: 'Books Returned',
    overdueBooks: 'Overdue Books',
    registeredBorrowers: 'Registered Borrowers',
  }
  return titles[key]
}

const cardColor = key => {
  const colors = {
    totalBooks: 'primary',
    booksBorrowed: 'success',
    booksReturned: 'blue',
    overdueBooks: 'error',
    registeredBorrowers: 'teal',
  }
  return colors[key]
}
</script>

<style scoped>
.v-card {
  text-align: center;
}

.nav-title {
  font-family: 'Merriweather', serif;
  font-size: 1.4rem;
  font-weight: 1000;
  margin: 0;
}

.v-navigation-drawer {
  width: 250px;
  height: 100%;
}

.app-bar {
  background-color: #2e3b55;
}

.v-icon {
  font-size: 30px;
}

/* Responsive Design */
@media (max-width: 600px) {
  .app-bar {
    background-color: #2e3b55;
  }
  .v-navigation-drawer {
    background-color: #e7f0dc;
  }
}
</style>