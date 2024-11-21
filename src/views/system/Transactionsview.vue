<script setup>
import { ref, onMounted } from 'vue';
// import axios from 'axios';

// State for transactions
const transactions = ref([]);
const loading = ref(true);
const error = ref(null);

// API URL
const API_URL = 'https://api.example.com'; // Replace with your API's base URL

// Fetch transactions from API
async function fetchTransactions() {
  try {
    const response = await axios.get(`${API_URL}/transactions`);
    transactions.value = response.data;
  } catch (err) {
    console.error('Error fetching transactions:', err);
    error.value = 'Failed to load transactions. Please try again later.';
  } finally {
    loading.value = false;
  }
}

// Fetch transactions on component mount
onMounted(fetchTransactions);
</script>

<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar elevation="8" style="background-color: #232D3F;">
      <v-toolbar-title class="text-white">Transactions</v-toolbar-title>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container>
        <!-- Loading State -->
        <v-row v-if="loading" justify="center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-row>

        <!-- Error State -->
        <v-alert v-if="error" type="error" border="left" color="red">
          {{ error }}
        </v-alert>

        <!-- Transactions List -->
        <v-card v-else elevation="2">
          <v-card-title>Transaction Records</v-card-title>
          <v-data-table
            :items="transactions"
            :headers="[
              { text: 'Book Title', value: 'bookTitle' },
              { text: 'Borrower Name', value: 'name' },
              { text: 'Email', value: 'email' },
              { text: 'Borrow Date', value: 'date' }
            ]"
            class="elevation-1"
            dense
            item-value="id"
          >
            <template v-slot:no-data>
              <v-alert border="left" type="info" color="blue">
                No transactions found.
              </v-alert>
            </template>
          </v-data-table>
        </v-card>
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer class="font-weight-bold" elevation="24" app style="background-color: #232D3F;">
      <v-row justify="start">
        <v-col class="text-right py-2" style="color: wheat;">2024 - Book Shelf Transactions</v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>
