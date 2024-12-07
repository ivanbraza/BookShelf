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

const getChipColor = (status) => {
  switch (status) {
    case 'On Going':
      return 'green'; // confirmed status will be green
    case 'Denied':
      return 'red';   // denied status will be red
    case 'Returned':
      return 'blue';  // returned status will be blue
    case 'Pending':
      return 'yellow'; // pending status will be yellow
    default:
      return 'grey';   // default color in case of unknown status
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
  { title: 'Book Title', value: 'book_title' },
  { title: 'Borrow Date', value: 'borrowed_date' },
  { title: 'Return Date', value: 'return_date' },
  { title: 'Status', value: 'status' }, // New status column
  { title: 'Penalty', value: 'penalties'}
])

// Fetch transactions
const fetchTransactions = async () => {
  loading.value = true
  error.value = null

  try {
    console.log('Fetching user data from Supabase...')
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('Error fetching user data:', userError.message)
      error.value = 'Failed to fetch user information. Please try again.'
      return
    }

    if (!user || !user.user) {
      console.warn('No user is currently logged in.')
      error.value = 'No user is logged in. Please log in to view transactions.'
      return
    }

    const email = user.user.email
    console.log('User email fetched:', email)

    console.log('Fetching transactions for the user...')
    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select('book_title, user_info, borrowed_date, return_date, status', 'penalties') // Include the status field
      .eq('email', email)

    if (fetchError) {
      console.error('Supabase query error:', fetchError.message)
      error.value = 'Unable to fetch transactions. Please try again later.'
      return
    }

    if (data && data.length > 0) {
      transactions.value = data.map((transaction) => {
        const today = new Date();
        const returnDate = new Date(transaction.return_date);
        const overdueDays = Math.max(0, Math.ceil((today - returnDate) / (1000 * 60 * 60 * 24)));

        if (overdueDays > 0 && overdueDays <= 15) {
          transaction.penalties = overdueDays * 10; // Charge 10 pesos per overdue day
        } else if (overdueDays > 15) {
          transaction.penalties = 150; // Maximum penalty of 150 pesos
          transaction.raw_user_meta_data.user_status = 'Blocked';
        } else {
          transaction.penalties = 0; // No penalties if returned on time
        }

        return transaction;
      });

      transactions.value.sort((a, b) => {
  if (a.status === b.status) return 0;

  // Handle sorting logic with priority mapping
  const priority = { 
    'On Going': 1,    // Highest priority
    'Pending': 2,    // Second priority
    'Returned': 3,   // Third priority
    'Denied': 4      // Fourth priority
  };

  const aPriority = priority[a.status] || 5; // Default to 5 if the status is unrecognized
  const bPriority = priority[b.status] || 5;

  return aPriority - bPriority;
});


    } else {
      transactions.value = []; // If no data, ensure it is an empty array
    }
  } catch (err) {
    console.error('Unexpected error during transaction fetch:', err.message)
    error.value = 'An unexpected error occurred. Please refresh the page.'
  } finally {
    loading.value = false
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
        src="/images/logo.png"
        class="mx-3 my-4"
        max-width="50px"
      ></v-img>
    </v-app-bar>

    <!-- Main Layout -->
    <v-row class="main-container" style="background-color: aliceblue">
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
              $router.push('/dashboard')
            "
          ></v-list-item>
          <v-list-item
            class="mt-6 nav-title black-text"
            prepend-icon="mdi-bookshelf"
            title="Books"
            @click="
              drawer = mobile ? false : drawer;
              $router.push('/books')
            "
          ></v-list-item>
          <v-list-item
            class="mt-6 nav-title black-text"
            prepend-icon="mdi-account-credit-card"
            title="Transaction"
            @click="
              drawer = mobile ? false : drawer;
              $router.push('/transactions')
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
                    :rules="[
                      requiredValidator,
                      confirmedValidator(
                        passwordForm.password,
                        passwordForm.password_confirmation,
                      ),
                    ]"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="red" @click="changePasswordDialog = false"
                  >Cancel</v-btn
                >
                <v-btn
                  text
                  color="green"
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
    style="background-color: aliceblue"
  >
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
            <v-chip :color="item.status === 'confirmed' ? 'green' : 'orange'" text-color="white" small>
              {{ item.status }}
            </v-chip>
          </div>
          <div class="table-card-field">
            <span class="field-label">Penalty:</span>
            <span class="field-value">{{ item.penalties }}</span>
          </div>
        </div>

        <!-- Default Table Row View for Larger Screens -->
        <tr v-else>
          <td>{{ item.book_title }}</td>
          <td>{{ item.borrowed_date }}</td>
          <td>{{ item.borrowed_date }}</td>
          <td>
            <v-chip :color="item.status === 'On Going' ? 'green' : item.status === 'Pending' ? 'orange' : item.status === 'Returned' ? 'blue' : item.status === 'Denied' ? 'red' : 'grey'" text-color='white' small>
              {{ item.status }}
            </v-chip>
          </td>
          <td>{{ item.penalties }}</td>
        </tr>
      </template>
    </template>
  </v-data-table>

          <!-- Message if no transactions -->
          <v-alert v-if="!loading && transactions.length === 0" type="info" color="blue">
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
  .v-data-table .v-data-table__wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .v-data-table th,
  .v-data-table td {
    font-size: 14px;
    padding: 12px;
  }

  .content-area {
    margin-left: 0;
    margin-right: 0;
    padding: 10px;
  }

  .v-list-item {
    font-size: 1rem;
  }
}
</style>
