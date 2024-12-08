<script setup>
import { ref, onMounted, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { supabase } from '@/utils/supabase';
import { getInitials } from '@/utils/helpers';
import LogoutModal from '../auth/LogoutModal.vue';
import { useChangePassword } from '@/utils/changer';
import { confirmedValidator, passwordValidator } from '@/utils/validators';

const isPasswordVisible = ref(false);
const isPasswordConfirmVisible = ref(false);
const refVForm = ref();

// Mobile detection from Vuetify's display composable
const { mobile } = useDisplay();
const drawer = ref(!mobile.value);

const {
  changePasswordDialog,
  isPasswordFormValid,
  passwordForm,
  rules,
  openChangePasswordModal,
  handleChangePassword,
} = useChangePassword();

// Logout modal reference
const logoutModalRef = ref(null);
const openLogoutModal = () => {
  logoutModalRef.value?.open();
};

// Watch for changes in mobile status
watch(mobile, (isMobile) => {
  if (!isMobile) {
    drawer.value = true;
  }
});

// Reactive variables
const firstName = ref('');
const lastName = ref('');
const userStatus = ref('');

// Fetch user information
async function getUserInformation() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user information:', error.message);
    return null;
  }
  if (data?.user) {
    const { user } = data;
    return {
      firstname: user.user_metadata.firstname || 'Guest',
      lastname: user.user_metadata.lastname || 'User',
      user_status: user?.raw_user_meta_data?.user_status || 'Unknown',
    };
  } else {
    return null;
  }
}


// Lifecycle hook
onMounted(async () => {
  const user = await getUserInformation();
  if (user) {
    firstName.value = user.firstname;
    lastName.value = user.lastname;
    userStatus.value = user.user_status;
  } else {
    console.error('User not logged in or data not found.');
  }
});



// State for transactions
const transactions = ref([]);
const loading = ref(true);
const error = ref(null);
const headers = ref([
  { title: 'Borrower Name', value: 'user_info' },
  { title: 'Book Title', value: 'book_title' },
  { title: 'Borrow Date', value: 'borrowed_date' },
  { title: 'Return Date', value: 'return_date', width: '2 0px' },
  { title: 'Status', value: 'status' },
  { title: 'Actions', value: 'actions' },
  { title: 'Penalty', value: 'penalties' },
]);

// Fetch transactions
async function fetchTransactions() {
  loading.value = true;
  error.value = null;

  try {
    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select(
        'id, book_title, user_info, email, borrowed_date, return_date, status, penalties'
      )
      .in('status', ['Ongoing', 'Returned']);

    if (fetchError) {
      console.error('Supabase query error:', fetchError.message);
      error.value = 'Unable to fetch transactions. Please try again later.';
      return;
    }

    if (data && data.length > 0) {
      transactions.value = data.map((transaction) => {
        const today = new Date();
        const returnDate = new Date(transaction.return_date);

        // Check if the return date is valid
        if (isNaN(returnDate.getTime())) {
          console.error(`Invalid return date for transaction id: ${transaction.id}`);
          transaction.penalties = 0;
        } else {
          const overdueDays = Math.max(0, Math.ceil((today - returnDate) / (1000 * 60 * 60 * 24)));

          if (overdueDays > 0 && overdueDays <= 15) {
            transaction.penalties = overdueDays * 10; // 10 pesos per overdue day
          } else if (overdueDays > 15) {
            transaction.penalties = 150; // Set to maximum 150 pesos if overdue by more than 15 days
            userStatus.value = 'Blocked';
          } else {
            transaction.penalties = 0;
          }
        }

        return transaction;
      });

      transactions.value.sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === 'Ongoing' ? -1 : 1;
      });
    } else {
      transactions.value = [];
    }
  } catch (err) {
    console.error('Unexpected error during transaction fetch:', err);
    error.value = 'An unexpected error occurred. Please refresh the page.';
  } finally {
    loading.value = false;
  }
};


// Function to mark a transaction as returned
const markAsReturned = async (transaction) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'Returned',
        penalties: 0,
      })
      .eq('id', transaction.id);

    if (error) {
      alert('Error marking transaction as returned');
      console.error('Error:', error.message);
      return;
    }

    if (userStatus.value === 'Blocked') {
      const { error: unblockError } = await supabase
        .from('users')
        .update({ user_status: 'Active' })
        .eq('email', transaction.email);

      if (unblockError) {
        console.error('Failed to unblock user:', unblockError.message);
      }
    }

    transactions.value = transactions.value.filter(t => t.id !== transaction.id);

    alert('Book marked as returned and user unblocked if applicable');
  } catch (err) {
    console.error('Unexpected error while marking transaction as returned:', err);
  }
};


// Fetch transactions on component mount
onMounted(fetchTransactions);
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
  style="background-color: aliceblue"
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
          <v-chip :color="item.status === 'Ongoing' ? 'green' : item.status === 'Pending' ? 'orange' : item.status === 'Returned' ? 'blue' : item.status === 'Denied' ? 'red' : 'grey'" text-color='white' small>
            {{ item.status }}
          </v-chip>
        </div>
          <div class="table-card-field" v-if="item.status !== 'Returned'">
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
          <v-chip :color="item.status === 'Ongoing' ? 'green' : item.status === 'Pending' ? 'orange' : item.status === 'Returned' ? 'blue' : item.status === 'Denied' ? 'red' : 'grey'" text-color='white' small>
            {{ item.status }}
          </v-chip>
        </td>
        <td v-if="item.status !== 'Returned'">
    <v-btn @click="markAsReturned(item)" color="green" small>Returned</v-btn>
  </td>
  <td v-else>
    <!-- Empty space when the status is returned -->
  </td>
        <td>{{ item.penalties }} Php</td>
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
        <v-col class="devcol text-right py-2 white-text footer">
      2024 - Book Shelf
    </v-col>
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

.footer {
  background: #2e3b55;
  color: white;
  text-align: center;
  padding: 10px 0;
}

</style>
