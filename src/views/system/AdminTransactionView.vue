<script setup>
import { ref, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { supabase } from '@/utils/supabase'
import { getInitials } from '@/utils/helpers'
import LogoutModal from '../auth/LogoutModal.vue'
import { useChangePassword } from '@/utils/changer'
import { confirmedValidator, passwordValidator } from '@/utils/validators'

const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
const refVForm = ref()

// Mobile detection from Vuetify's display composable
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
    return {
      firstname: user.user_metadata.firstname || 'Guest',
      lastname: user.user_metadata.lastname || 'User',
    }
  } else {
    return null
  }
}

// Lifecycle hook
onMounted(async () => {
  const user = await getUserInformation()
  if (user) {
    firstName.value = user.firstname
    lastName.value = user.lastname
  } else {
    console.error('User not logged in or data not found.')
  }
})

// State for transactions
const transactions = ref([])
const loading = ref(true)
const error = ref(null)
const headers = ref([
  { title: 'Borrower Name', value: 'user_info' },
  { title: 'Book Title', value: 'book_title' },
  { title: 'Borrow Date', value: 'borrowed_date' },
  { title: 'Return Date', value: 'return_date' },
  { title: 'Status', value: 'status' },
  { title: 'Actions', value: 'actions' }, // New actions column
  { title: 'Penalty', value: 'penalties'}
])

// Fetch transactions
const fetchTransactions = async () => {
  loading.value = true
  error.value = null

  try {
    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select(
        'id, book_title, user_info, email, borrowed_date, return_date, status',
      ) // Ensure 'id' is included
      .eq('status', 'confirmed') // Ensure you're fetching pending transactions

    if (fetchError) {
      console.error('Supabase query error:', fetchError.message)
      error.value = 'Unable to fetch transactions. Please try again later.'
      return
    }

    if (data && data.length > 0) {
      transactions.value = data // Set the reactive transactions array
    } else {
      transactions.value = [] // If no data, ensure it is an empty array
    }
  } catch (err) {
    console.error('Unexpected error during transaction fetch:', err)
    error.value = 'An unexpected error occurred. Please refresh the page.'
  } finally {
    loading.value = false
  }
}

// Function to mark a transaction as returned
const markAsReturned = async transaction => {
  try {
    // Update the status in the database
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'returned' })
      .eq('id', transaction.id)

    if (error) {
      alert('Error marking transaction as returned:', error.message)
      error.value = 'Failed to update transaction. Please try again.'
      return
    }

    // Remove the transaction from the table locally
    transactions.value = transactions.value.filter(t => t.id !== transaction.id)

    alert(`Book marked as returned and removed from the table.`)
  } catch (err) {
    console.error('Unexpected error while marking as returned:', err.message)
    error.value = 'An unexpected error occurred. Please try again later.'
  }
}

// Fetch transactions on component mount
onMounted(fetchTransactions)
</script>

<template>
  <v-app>
    <!-- App Bar and Drawer Setup -->
    <v-app-bar class="app-bar bg" elevation="4">
      <v-btn v-if="mobile" icon @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-img
        src="/images/bookshelf-logo.jpg"
        class="mx-3 my-4"
        max-width="50px"
      ></v-img>
    </v-app-bar>

    <!-- Main Layout -->
    <v-row class="main-container">
      <v-navigation-drawer
        v-model="drawer"
        :temporary="mobile"
        location="left"
        :permanent="!mobile"
        style="background-color: #e7f0dc"
      >
        <template v-slot:prepend>
          <v-divider></v-divider>
          <v-list-item
            lines="two"
            subtitle="Logged in"
            :title="`${firstName || '...'} ${lastName || '...'}`"
          >
            <template v-slot:prepend>
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

          <!-- Logout Link -->
          <v-list-item
            class="mt-6 nav-title black-text"
            prepend-icon="mdi-logout"
            title="Logout"
            @click="openLogoutModal"
          ></v-list-item>
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

      <v-container class="content-area px-auto py-auto mt-16">
        <v-container class="border-md" elevation="4">
          <v-card-title
            class="font-weight-bold text-center text-secondary"
            style="font-size: 32px"
          >
            Transactions
          </v-card-title>

          <!-- Error Alert -->
          <v-alert
            v-if="error"
            type="error"
            border="left"
            color="red"
            class="mb-4"
          >
            {{ error }}
          </v-alert>

          <!-- Transactions Table -->
          <v-data-table
  :items="transactions"
  :headers="headers"
  dense
  :loading="loading"
  class="responsive-table"
  :hide-default-header="mobile"
>
  <!-- Display headers only on non-mobile (desktop) screens -->
  <template v-if="!mobile" v-slot:header>
    <thead>
      <tr>
        <th v-for="header in headers" :key="header.value">{{ header.title }}</th>
      </tr>
    </thead>
  </template>

  <template v-slot:body="{ items }">
    <template v-for="item in items" :key="item.id">
      <!-- Card View on Mobile -->
      <div class="table-card" v-if="mobile">
        <div class="table-card-field">
          <span class="field-label">Book Title:</span>
          <span class="field-value">{{ item.book_title }}</span>
        </div>
        <div class="table-card-field">
          <span class="field-label">Borrow Date:</span>
          <span class="field-value">{{ item.borrowed_date }}</span>
        </div>
        <div class="table-card-field">
          <span class="field-label">Return Date:</span>
          <span class="field-value">{{ item.return_date }}</span>
        </div>
        <div class="table-card-field">
          <span class="field-label">Status:</span>
          <v-chip
            :color="item.status === 'confirmed' ? 'green' : 'orange'"
            text-color="white"
            small
          >
            {{ item.status }}
          </v-chip>
        </div>
        <div class="table-card-field">
          <v-btn @click="markAsReturned(item)" color="green" small>Returned</v-btn>
        </div>
      </div>

      <!-- Default Table Row View for Larger Screens -->
      <tr v-else>
        <td>{{ item.user_info }}</td>
        <td>{{ item.book_title }}</td>
        <td>{{ item.borrowed_date }}</td>
        <td>{{ item.return_date }}</td>
        <td>
          <v-chip
            :color="item.status === 'confirmed' ? 'green' : 'orange'"
            text-color="white"
            small
          >
            {{ item.status }}
          </v-chip>
        </td>
        <td>
          <v-btn @click="markAsReturned(item)" color="green" small>Returned</v-btn>
        </td>
        <td>{{ item.penalties }}</td>
      </tr>
    </template>
  </template>
</v-data-table>

          <!-- Message if no transactions -->
          <v-alert
            v-if="!loading && transactions.length === 0"
            type="info"
            color="blue"
          >
            No pending transactions found.
          </v-alert>
        </v-container>
      </v-container>
    </v-row>

    <!-- Footer -->
    <v-footer
      class="font-weight-bold"
      elevation="24"
      app
      style="background-color: #232d3f"
    >
      <v-row justify="start">
        <v-col class="text-right py-2" style="color: white"
          >2024 - Book Shelf</v-col
        >
      </v-row>
    </v-footer>

    <!-- Logout Modal -->
    <LogoutModal ref="logoutModalRef" />
  </v-app>
</template>

<style scoped>
.app-bar {
  background: #2e3b55;
  color: white;
}

.v-footer {
  z-index: 1000;
}

.no-underline {
  text-decoration: none;
  color: inherit;
}

.nav-title {
  font-family: 'Merriweather', serif;
  font-size: 1.4rem;
  font-weight: 1000;
  margin: 0;
}

.bg {
  background-color: #232d3f;
}

.content-area {
  margin-left: 19%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.v-data-table-header {
  background-color: #232624;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

/* Added styles for table outlines and hover effects */
.v-data-table {
  border: 1px solid #ccc; /* Outer border for the table */
  border-radius: 8px;
}

.v-data-table td,
.v-data-table th {
  padding: 15px 16px;
  border: 1px solid #ddd; /* Inner borders for cells */
  text-align: center;
}

.v-data-table th {
  background-color: #f4f4f4; /* Light background for headers */
  font-weight: bold;
  color: #232624; /* Header text color */
}

.v-data-table tbody tr:hover {
  background-color: cornflowerblue; /* Highlight row on hover */
}

.v-data-table .v-data-table__wrapper {
  border-radius: 8px;
  overflow: hidden; /* Ensures table fits nicely in the card */
}

.v-card {
  border-radius: 15px;
}

.v-alert {
  border-radius: 8px;
}

.v-data-table .v-data-table__empty-wrapper {
  text-align: center;
  font-size: 18px;
}

.v-card-title {
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  color: #232624;
  font-size: 28px;
}

/* Make tables responsive on mobile */
@media screen and (max-width: 600px) {
  .content-area {
    margin-left: 0; /* Remove left margin on mobile */
  }

  .v-data-table .v-data-table__wrapper {
    display: block;
    width: 100%; /* Ensure the table takes full width */
  }

  .v-data-table td,
  .v-data-table th {
    padding: 12px 10px; /* Adjust padding for smaller screens */
  }

  .v-card-title {
    font-size: 24px; /* Reduce font size for mobile */
  }

  .nav-title {
    font-size: 1.2rem; /* Make nav items more compact */
  }

  .v-data-table__wrapper {
    overflow-x: auto; /* Allow horizontal scrolling */
  }

  /* Adjust table layout on mobile */
  .v-data-table td,
  .v-data-table th {
    white-space: nowrap; /* Ensure content fits inside */
  }

  /* Make sure the actions column is stacked vertically on mobile */
  .v-data-table .v-data-table__column--actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  /* Adjust text alignment for better visibility */
  .v-data-table .v-data-table__column--status {
    text-align: center;
  }
}


/* Vertical text for date column */
.vertical-text {
  display: inline-block;
  transform: rotate(-90deg);
  transform-origin: bottom left;
  white-space: nowrap;
  padding-left: 10px;
}

.table-card {
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.table-card-field {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.field-label {
  font-weight: bold;
  color: #555;
}

.field-value {
  text-align: right;
  color: #333;
}

/* Hide Default Table on Mobile */
@media screen and (max-width: 600px) {
  .v-data-table table {
    display: none;
  }

  .table-card {
    display: block;
  }
}

.v-card-title {
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  color: #232624;
  font-size: 28px;
}
</style>
