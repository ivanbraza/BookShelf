<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar class="app-bar" elevation="4">
      <v-btn v-if="mobile" icon @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-img
        src="/images/logo.png"
        alt="Logo"
        class="mx-3 my-4"
        max-width="50px"
      ></v-img>
    </v-app-bar>

    <!-- Main Layout -->
    <v-row class="main-container">
      <!-- Sidebar -->
      <v-navigation-drawer
        v-model="drawer"
        :temporary="mobile"
        :permanent="!mobile"
        class="sidebar"
        style="background-color: #E7F0DC"
      >
        <template v-slot:prepend>
          <v-divider></v-divider>
          <v-list-item
            lines="two"
            :title="`${firstName || '...'} ${lastName || '...'}`"
            subtitle="Logged in"
          >
            <template v-slot:prepend>
              <v-avatar color="primary" size="45">
                <span class="white--text text-h6">{{
                  getInitials(firstName, lastName)
                }}</span>
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
            @click="
              drawer = mobile ? false : drawer;
              $router.push('/librarian_dashboard')
            "
          ></v-list-item>
          <v-list-item
            class="mt-6 nav-title black-text"
            prepend-icon="mdi-book-plus"
            title="Borrow Requests"
            @click="
              drawer = mobile ? false : drawer;
              $router.push('/borrow_request')
            "
          ></v-list-item>
          <v-list-item
            class="mt-6 nav-title black-text"
            prepend-icon="mdi-account-credit-card"
            title="Transactions"
            @click="
              drawer = mobile ? false : drawer;
              $router.push('/admin_transactions')
            "
          ></v-list-item>
          <v-list-item
            class="mt-6 nav-title black-text"
            prepend-icon="mdi-logout"
            title="Logout"
            @click="openLogoutModal"
          ></v-list-item>
          <!-- Sidebar -->
          <v-list-item
            class="mt-6 nav-title black-text"
            prepend-icon="mdi-lock-reset"
            title="Change Password"
            @click="openChangePasswordModal"
          ></v-list-item>

          <!-- Change Password Modal -->
          <v-dialog v-model="changePasswordDialog" max-width="400">
            <v-card>
              <v-card-title class="text-h6">Change Password</v-card-title>
              <v-card-text>
                <v-form ref="changePasswordForm" v-model="isPasswordFormValid">
                  <v-text-field
                    v-model="passwordForm.currentPassword"
                    label="Current Password"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="
                      isPasswordVisible ? 'mdi-eye' : 'mdi-eye-off'
                    "
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                    :rules="[passwordValidator]"
                  ></v-text-field>

                  <v-text-field
                    v-model="passwordForm.newPassword"
                    label="New Password"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="
                      isPasswordVisible ? 'mdi-eye' : 'mdi-eye-off'
                    "
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                    :rules="[requiredValidator, passwordValidator]"
                  ></v-text-field>

                  <v-text-field
                    v-model="passwordForm.confirmPassword"
                    label="Confirm New Password"
                    :type="isPasswordConfirmVisible ? 'text' : 'password'"
                    :append-inner-icon="
                      isPasswordConfirmVisible ? 'mdi-eye' : 'mdi-eye-off'
                    "
                    @click:append-inner="
                      isPasswordConfirmVisible = !isPasswordConfirmVisible
                    "
                    :rules="[requiredValidator, confirmedValidator(
                        passwordForm.password,
                        passwordForm.password_confirmation,
                      ),]"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="red" @click="changePasswordDialog = false">Cancel</v-btn>
                <v-btn
                  text color="green"
                  :disabled="!isPasswordFormValid"
                  @click="handleChangePassword"
                >
                  Submit
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-list>
      </v-navigation-drawer>

      <!-- Main Content -->
      <v-main class="content-area">
        <v-container>
          <!-- Hero Section -->
          <v-row justify="center" align="center" class="hero-section">
            <v-col cols="12" class="text-center">
              <h1 class="hero-title">Welcome to the Library Dashboard</h1>
              <p class="hero-subtitle">
                Monitor and manage your library operations seamlessly.
              </p>
            </v-col>
          </v-row>

          <!-- Statistics Section -->
          <v-row justify="center" class="stats-section">
            <v-col
              cols="12"
              sm="6"
              md="4"
              v-for="(value, key) in stats"
              :key="key"
            >
              <v-card class="stats-card" elevation="24">
                <v-icon :color="cardColor(key)" class="icon" large>{{
                  getIcon(key)
                }}</v-icon>
                <h3 class="card-title">{{ getTitle(key) }}</h3>
                <p class="card-value">{{ value }}</p>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-row>

    <v-footer class="font-weight-bold bg" elevation="4" app>
      <v-row justify="start">
        <v-col class="text-right py-2 white-text"> 2024 - Book Shelf </v-col>
      </v-row>
    </v-footer>

    <!-- Logout Modal -->
    <LogoutModal ref="logoutModalRef" />
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import LogoutModal from '../auth/LogoutModal.vue'
import { supabase } from '@/utils/supabase'
import { getInitials } from '@/utils/helpers'
import { useChangePassword } from '@/utils/changer'
import { confirmedValidator, passwordValidator } from '@/utils/validators'

const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
const refVForm = ref()
const { mobile } = useDisplay()
const drawer = ref(!mobile.value)

const {
  changePasswordDialog,
  isPasswordFormValid,
  passwordForm,
  rules,
  openChangePasswordModal,
  handleChangePassword,
} = useChangePassword()
// User Information
const firstName = ref('')
const lastName = ref('')

// Modal Handling
const logoutModalRef = ref(null)
const openLogoutModal = () => logoutModalRef.value?.open()

// Fetch User Data
async function getUserInformation() {
  const { data } = await supabase.auth.getUser()
  if (data?.user) {
    firstName.value = data.user.user_metadata.firstname || 'Guest'
    lastName.value = data.user.user_metadata.lastname || 'User'
  }
}

// Statistics
const stats = ref({})
const fetchStatistics = async () => {
  const totalBooks = await fetchTotalBooks()
  const { booksBorrowed, booksReturned } = await fetchTransactionStats()
  stats.value = {
    totalBooks: totalBooks + booksReturned - booksBorrowed,
    booksBorrowed,
    booksReturned,
  }
}

const fetchTotalBooks = async () => {
  const { data } = await supabase.from('books').select('*')
  return data?.length || 0
}

const fetchTransactionStats = async () => {
  const { data } = await supabase.from('transactions').select('status')
  const booksBorrowed = data.filter(t => t.status === 'confirmed').length
  const booksReturned = data.filter(t => t.status === 'returned').length
  return { booksBorrowed, booksReturned }
}

onMounted(() => {
  getUserInformation()
  fetchStatistics()
})

const navigateTo = path => {
  $router.push(path)
}

const getIcon = key =>
  ({
    totalBooks: 'mdi-book',
    booksBorrowed: 'mdi-book-check',
    booksReturned: 'mdi-bookmark-check',
  })[key]

const getTitle = key =>
  ({
    totalBooks: 'Total Books',
    booksBorrowed: 'Books Borrowed',
    booksReturned: 'Books Returned',
  })[key]

const cardColor = key =>
  ({
    totalBooks: 'primary',
    booksBorrowed: 'success',
    booksReturned: 'blue',
  })[key]
</script>

<style scoped>
/* App Bar */
.app-bar {
  background: #2e3b55;
  color: white
}
.bg {
  background-color: #232d3f;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background-color: #f4f5f7;
}

.nav-link {
  font-weight: bold;
}
/* Content Area */
.content-area {
  position: relative;
  min-height: 100vh;
  padding: 20px;
}
.white-text {
  color: white;
}

/* Background Blur */
.content-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('./images/libraryimg.webp') no-repeat center center;
  background-size: cover;
  filter: blur(3px); /* Apply blur only to the background */
  z-index: 0;
  opacity: 0.8; /* Adjust opacity for better contrast */
}

/* Hero Section and Stats Section */
/* Foreground Content */
.hero-section,
.stats-section {
  position: relative;
  z-index: 1; /* Ensure content appears above the blurred background */
}

/* Hero Section */
.hero-section {
  text-align: center;
  color: #333;
  padding-top: 70px;
  padding-left: 110px;
}

.hero-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  opacity: 100%;
}

.hero-subtitle {
  font-size: 1.4rem;
  color: #000000;
}

/* Statistics Section */
.stats-section {
  margin-top: 40px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px; /* Add spacing between cards */
}

.nav-title {
  font-family: 'Merriweather', serif;
  font-size: 1.4rem;
  font-weight: 1000;
  margin: 0;
}

/* Statistics Cards */
.stats-card {
  background: #ced4e7;
  text-align: center;
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.3s ease;
  width: 280px; /* Ensure all cards have the same width */
  height: 200px; /* Ensure all cards have the same height */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 110px;
  border-radius: 8px; /* Optional: Rounded corners */
  box-shadow: 8px 4px 8px rgba(215, 23, 23, 0.2); /* Custom shadow */
}

.stats-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* Larger Icon */
.stats-card v-icon {
  font-size: 10%; /* Increase icon size */
  margin-bottom: 10px; /* Add space below the icon */
}

/* Title Styling */
.card-title {
  font-size: 1.5rem;
  margin: 10px 0;
  font-weight: bold;
  color: #333;
}

/* Value Styling */
.card-value {
  font-size: 2rem;
  font-weight: bold;
  color: #020202;
}

@media (max-width: 600px) {
  .hero-section {
    padding: 20px;
    padding-top: 50px;
  }
  .stats-card {
    margin: 10px;
  }
}

.icon {
  font-size: 300%;
}
/* Footer */
.footer {
  background: #2e3b55;
  color: white;
  text-align: center;
  padding: 10px 0;
}
</style>
