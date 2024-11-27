<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useDisplay } from 'vuetify';
import axios from 'axios';
import LogoutModal from '../auth/LogoutModal.vue';
import { supabase } from '@/utils/supabase';

// Reactive variables for user information
const firstName = ref('');
const lastName = ref('');

// Reactive variables for mobile layout and drawer
const { mobile } = useDisplay();
const drawer = ref(!mobile.value);

// Reactive variables for books
const categories = [
  { name: 'Agriculture', subject: 'agriculture' },
  { name: 'Engineering', subject: 'engineering' },
  { name: 'Environmental Science', subject: 'environmental_science' },
  { name: 'Natural Science', subject: 'natural_science' },
  { name: 'Social Science', subject: 'social_science' },
  { name: 'Programming', subject: 'programming' },
];
const tabs = ref(categories[0].subject);
const cards = ref([]);
const searchQuery = ref('');
const loading = ref(false);
const error = ref(null);

// Reactive state for dialogs
const dialog = ref(false);
const selectedDate = ref(null);
const datePickerDialog = ref(false);

// Logout modal reference
const logoutModalRef = ref(null);

// Function to open logout modal
const openLogoutModal = () => {
  logoutModalRef.value?.open();
};

// Watch for mobile layout changes and adjust drawer visibility
watch(mobile, (isMobile) => {
  drawer.value = !isMobile;
});

// Function to fetch books from OpenLibrary API
const fetchBooks = async (subject) => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await axios.get(
      `https://openlibrary.org/subjects/${subject}.json`
    );
    cards.value = data.works.map((book) => ({
      title: book.title,
      src: book.cover_id
        ? `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`
        : '/default-cover.jpg',
      author: book.authors?.[0]?.name || 'Unknown Author',
    }));
  } catch {
    error.value = 'Failed to load books. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Watch for tab changes to fetch books for the new category
watch(tabs, fetchBooks);

// Filter the cards based on search query
const filteredCards = computed(() =>
  cards.value.filter((card) =>
    card.title.toLowerCase().includes(searchQuery.value.trim().toLowerCase())
  )
);

// Function to fetch user information
async function getUserInformation() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user information:', error.message);
    return null;
  }

  if (data.user) {
    const { user } = data;
    console.log('Fetched user data:', user);
    return {
      firstname: user.user_metadata.firstname || 'Guest',
      lastname: user.user_metadata.lastname || 'User',
    };
  } else {
    console.warn('No user data found.');
    return null;
  }
}

// Lifecycle hook to fetch both user and books data on mount
onMounted(async () => {
  // Fetch user information and set reactive variables
  const user = await getUserInformation();
  if (user) {
    firstName.value = user.firstname;
    lastName.value = user.lastname;
    console.log('User data set:', { firstName: firstName.value, lastName: lastName.value });
  } else {
    console.error('User not logged in or data not found.');
  }

  // Fetch books for the default category (Agriculture)
  await fetchBooks(tabs.value);
});

// Open form dialog
const openForm = () => {
  dialog.value = true;
};
</script>


<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar class="app-bar" elevation="4" style="background-color: #232D3F;">
      <v-btn v-if="mobile" icon aria-label="Toggle Drawer" @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-img src="/images/logo2.png" class="mx-3 my-4" max-width="50px" alt="Logo"></v-img>
    </v-app-bar>

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
            prepend-avatar="https://randomuser.me/api/portraits/women/81.jpg"
            subtitle="Logged in"
            :title="`${firstName || '...'} ${lastName || '...'}`"
          ></v-list-item>
        </template>

        <!-- Navigation Links -->
        <v-list density="compact" nav>
          <v-divider></v-divider>
          <v-list-item
            class="mt-8 nav-title black-text"
            prepend-icon="mdi-home"
            title="Home"
            @click="drawer = mobile ? false : drawer; $router.push('/dashboard')"
          ></v-list-item>
          <v-list-item
            class="mt-6 nav-title black-text"
            prepend-icon="mdi-bookshelf"
            title="Books"
            @click="drawer = mobile ? false : drawer; $router.push('/books')"
          ></v-list-item>
          <v-list-item
            class="mt-6 nav-title black-text"
            prepend-icon="mdi-account-credit-card"
            title="Transaction"
            @click="drawer = mobile ? false : drawer; $router.push('/transaction')"
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

    <!-- Main Content -->
    <v-main class="main-content">
      <!-- Categories -->
      <v-row justify="center" class="category-buttons">
        <v-btn
          v-for="category in categories"
          :key="category.subject"
          :class="{ active: tabs === category.subject }"
          @click="tabs = category.subject"
          class="mx-2 mt-8"
        >
          {{ category.name }}
        </v-btn>
      </v-row>

      <!-- Search Bar -->
      <v-text-field
        v-model="searchQuery"
        label="Search Books"
        prepend-inner-icon="mdi-magnify"
        clearable
        class="my-6 search-bar mt-10 py-10"
      ></v-text-field>

      <!-- Cards -->
      <v-container>
        <v-row>
          <v-col v-if="loading" cols="12" class="text-center">
            <v-progress-circular indeterminate color="purple"></v-progress-circular>
          </v-col>

          <v-row>
  <v-col
    v-for="card in filteredCards"
    :key="card.title"
    cols="12"
    sm="6"
    md="4"
    lg="3"
    class="book-card-wrapper my-6 pt-8"
  >
    <v-card class="book-card">
      <v-img :src="card.src" height="200px" alt="Book Cover"></v-img>
      <v-card-title class="book-card-title">{{ card.title }}</v-card-title>
      <v-card-subtitle class="book-card-subtitle">{{ card.author }}</v-card-subtitle>
      <v-card-actions>
        <v-btn @click="openForm" color="primary" text>Borrow</v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</v-row>


          <v-col v-if="error" cols="12" class="text-center">
            <p class="error-message">{{ error }}</p>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Borrow Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Borrow Book</span>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field label="Name" required></v-text-field>
            <v-text-field label="Email" type="email" required></v-text-field>
            <v-text-field
              v-model="selectedDate"
              label="Select Date"
              append-icon="mdi-calendar"
              @click="datePickerDialog = true"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red darken-1" text @click="dialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="dialog = false">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-footer fixed class="font-weight-bold" elevation="4" app>
      <v-row justify="center" class="white--text">
        <v-col class="text-center py-2">
          2024 - Book Shelf
        </v-col>
      </v-row>
    </v-footer>

    <LogoutModal ref="logoutModalRef" />
  </v-app>
</template>


<style scoped>
/* General App Styles */
.text-center {
  text-align: center;
}

.app-bar {
  z-index: 1000;
}

.nav-title {
  font-family: 'Merriweather', serif;
  font-size: 1.4rem;
  font-weight: 1000;
  margin: 0;
}

.black-text {
  color: black;
}

.sidebar {
  background-color: #E7F0DC;
  color: black;
}

/* Cards */
.book-card-wrapper {
  display: flex;
  justify-content: center;
  align-items: stretch;
}

.book-card {
  width: 100%; /* Ensure the card takes up full width in the column */
  max-width: 300px; /* Limit the maximum width of the card */
  height: 400px; /* Set a fixed height for uniformity */
  opacity: 0.9; /* Slight transparency */
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column; /* Align the content in a column */
  justify-content: space-between; /* Space out the card elements */
  overflow: hidden; /* Prevent content overflow */
}

.book-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.book-card img {
  object-fit: cover; /* Make sure the image fits within the card */
  height: 200px; /* Set a fixed height for images */
  width: 100%; /* Make sure the image covers the full width of the card */
  object-position: center; /* Center the image */
}

.book-card-title {
  font-size: 1.1rem;
  font-weight: bold;
}

.book-card-subtitle {
  font-size: 0.9rem;
  color: #555;
}

/* Buttons */
.category-buttons .v-btn {
  border-radius: 50px;
  font-weight: bold;
  transition: background-color 0.3s, color 0.3s;
}

.category-buttons .v-btn.active {
  background-color: #b909fe;
  color: white;
}

/* Search Bar */
.search-bar {
  max-width: 800px;
  margin: 0 auto;
}

/* Footer */
.footer {
  background-color: #232D3F;
  color: white;
}

/* Error Message */
.error-message {
  color: red;
  font-weight: bold;
}

/* Typography */
.nav-title {
  font-family: 'Roboto', sans-serif;
  font-size: 1.2rem;
  font-weight: bold;
}

body {
  font-family: 'Poppins', sans-serif;
}
</style>

