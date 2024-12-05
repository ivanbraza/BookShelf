<script setup>
import { ref, onMounted, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { supabase } from '@/utils/supabase';
import { getInitials } from '@/utils/helpers';
import LogoutModal from '../auth/LogoutModal.vue';

// Mobile detection from Vuetify's display composable
const { mobile } = useDisplay();
const drawer = ref(!mobile.value);

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

// Fetch user information
async function getUserInformation() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user information:', error.message);
    return null;
  }
  if (data.user) {
    const { user } = data;
    return {
      firstname: user.user_metadata.firstname || 'Guest',
      lastname: user.user_metadata.lastname || 'User',
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
  } else {
    console.error('User not logged in or data not found.');
  }
});


// State for transactions
const transactions = ref([]);
const loading = ref(true);
const error = ref(null);
const headers = ref([
  { title: 'Book Title', value: 'book_title' },
  { title: 'User Info', value: 'user_info' },
  { title: 'Email', value: 'email' },
  { title: 'Borrow Date', value: 'borrowed_date' },
  { title: 'Return Date', value: 'return_date' },
  { title: 'Status', value: 'status' },
  { title: 'Actions', value: 'actions' }, // New column for Accept/Deny actions
]);
// Fetch transactions
const fetchTransactions = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select('id, book_title, user_info, email, borrowed_date, return_date, status')  // Ensure 'id' is included
      .eq('status', 'Pending');  // Ensure you're fetching pending transactions

    if (fetchError) {
      console.error('Supabase query error:', fetchError.message);
      error.value = 'Unable to fetch transactions. Please try again later.';
      return;
    }

    if (data && data.length > 0) {
      transactions.value = data;  // Set the reactive transactions array
    } else {
      transactions.value = [];  // If no data, ensure it is an empty array
    }
  } catch (err) {
    console.error('Unexpected error during transaction fetch:', err);
    error.value = 'An unexpected error occurred. Please refresh the page.';
  } finally {
    loading.value = false;
  }
};
const handleAccept = async (item) => {
  try {
    // First, perform the update operation
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ status: 'confirmed' })
      .eq('id', item.id);  // Make sure the ID is correct

    if (updateError) {
      console.error('Error accepting transaction:', updateError.message);
      return;
    }

    // Fetch the updated transaction manually
    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select('book_title, user_info, email, borrowed_date, return_date, status')
      .eq('id', item.id)
      .single(); // Fetch a single row by ID

    if (fetchError) {
      console.error('Error fetching updated transaction:', fetchError.message);
    } else {
      alert('Request Accepted:', data);
      // Optionally, update the local transactions array or state with the new data
      fetchTransactions(); // Refresh the transactions list
    }
  } catch (err) {
    console.error('Unexpected error accepting transaction:', err);
  }
};



const handleDeny = async (item) => {
  try {
    const { data, error: updateError } = await supabase
      .from('transactions')
      .update({ status: 'denied' })
      .eq('id', item.id);

    if (updateError) {
      console.error('Error denying transaction:', updateError.message);
    } else {
      alert('Transaction denied:', data);
      fetchTransactions(); // Refresh the transactions after the update
    }
  } catch (err) {
    console.error('Unexpected error denying transaction:', err);
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
      <v-img src="/images/bookshelf-logo.jpg" class="mx-3 my-4" max-width="50px"></v-img>
    </v-app-bar>

    <!-- Main Layout -->
    <v-row class="main-container">
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

      <v-container class="content-area px-auto py-auto mt-16">
        <v-container elevation="4">
          <v-card-title class="font-weight-bold text-center text-secondary" style="font-size: 32px;">
            Borrow Request
          </v-card-title>

          <!-- Error Alert -->
          <v-alert v-if="error" type="error" border="left" color="red" class="mb-4">
            {{ error }}
          </v-alert>

          <!-- Transactions Table -->
          <v-data-table
    :items="transactions"
    :headers="headers"
    dense
    :loading="loading"
    class="responsive-table"
    hide-default-header
  >
    <template v-slot:body="{ items }">
      <template v-for="item in items" :key="item.id">
        <!-- Card View on Mobile -->
        <div class="table-card" v-if="mobile">
          <div class="table-card-field">
            <span class="field-label">Borrower:</span>
            <span class="field-value">{{ item.user_info }}</span>
          </div>
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
           
                <v-btn @click="handleAccept(item)" color="green" small>Accept</v-btn>
                <v-btn @click="handleDeny(item)" color="red" small>Deny</v-btn>
            
          </div>
        </div>

        <!-- Default Table Row View for Larger Screens -->
        <tr v-else>
          <td>{{ item.book_title }}</td>
          <td>{{ item.borrowed_date }}</td>
          <td>{{ item.return_date }}</td>
          <td>
            <v-chip :color="item.status === 'confirmed' ? 'green' : 'orange'" text-color="white" small>
              {{ item.status }}
            </v-chip>
          </td>
          <td>
            <v-btn @click="handleAccept(item)" color="green" small class="py-3 px-5 mx-4">Accept</v-btn>
            <v-btn @click="handleDeny(item)" color="red" class="py-3 px-5">Deny</v-btn>
          </td>
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
    <v-footer class="font-weight-bold" elevation="24" app style="background-color: #232D3F;">
      <v-row justify="start">
        <v-col class="text-right py-2" style="color: wheat;">2024 - Book Shelf Transactions</v-col>
      </v-row>
    </v-footer>

    <!-- Logout Modal -->
    <LogoutModal ref="logoutModalRef" />
  </v-app>
</template>

<style scoped>
.app-bar {
  z-index: 1000;
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
  background-color: #232D3F;
}

.content-area {
  margin-left: 22%;
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

.v-data-table td,
.v-data-table th {
  padding: 15px 16px;
  border-bottom: 1px solid #ddd;
}

.v-data-table .row-hover:hover {
  background-color: wheat;
}

.v-data-table td {
  text-align: left;
}

.v-data-table .v-data-table__wrapper {
  border-radius: 10px;
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
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  thead {
    display: table-header-group;
  }

  tbody {
    display: table-row-group;
  }

  th, td {
    padding: 0.5em;
    text-align: left;
    white-space: nowrap;
  }
}
/* Adjust for better mobile alignment */
/* Make sure cards take full width and align properly on mobile */
@media screen and (max-width: 600px) {
  .content-area {
    margin-left: 0; /* Remove left margin on mobile */
    padding: 0 10px; /* Add some padding to the sides of the container */
    display: flex;
    justify-content: center; /* Center content */
    align-items: flex-start; /* Align items to the start */
  }

  .table-card {
    width: 100%; /* Ensure the card takes up full width */
    display: block;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-sizing: border-box; /* Include padding and border in the width */
  }

  .table-card-field {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    align-items: center;
  }

  .field-label {
    font-weight: bold;
    color: #555;
    flex: 1 0 40%; /* Make the label occupy less space */
  }

  .field-value {
    text-align: right;
    color: #333;
    flex: 1 0 60%; /* Make the value occupy more space */
  }

  /* Hide Default Table on Mobile */
  .v-data-table table {
    display: none;
  }

  /* Allow horizontal scrolling if necessary */
  .v-data-table__wrapper {
    overflow-x: auto; /* Allow horizontal scrolling if table content overflows */
  }

  /* Adjust table layout on mobile */
  .v-data-table td,
  .v-data-table th {
    white-space: nowrap; /* Ensure content fits inside */
  }
}

</style>