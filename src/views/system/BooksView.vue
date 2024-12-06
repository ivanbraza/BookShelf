<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify'
import axios from 'axios'
import LogoutModal from '../auth/LogoutModal.vue'
import { supabase } from '@/utils/supabase'
import { getInitials } from '@/utils/helpers'
import { useChangePassword } from '@/utils/changer'
import { confirmedValidator, passwordValidator } from '@/utils/validators'

const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
const refVForm = ref()
// Reactive variables for user information
const firstName = ref('')
const lastName = ref('')

// Reactive variables for mobile layout and drawer
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
// Reactive variables for books
const categories = [
  { name: 'All', subject: 'all' },
  { name: 'Agriculture', subject: 'agriculture' },
  { name: 'Engineering', subject: 'engineering' },
  { name: 'Environmental Science', subject: 'environmental_science' },
  { name: 'Natural Science', subject: 'natural_science' },
  { name: 'Social Science', subject: 'social_science' },
  { name: 'Programming', subject: 'programming' },
]
const tabs = ref(categories[0].subject)
const cards = ref([])
const searchQuery = ref('')
const loading = ref(false)
const error = ref(null)

// Reactive state for dialogs
const dialog = ref(false)
const borrowDatePickerDialog = ref(false)
const returnDatePickerDialog = ref(false)
const selectedBorrowDate = ref(null)
const selectedReturnDate = ref(null)

// Logout modal reference
const logoutModalRef = ref(null)

// Function to open logout modal
const openLogoutModal = () => {
  logoutModalRef.value?.open()
}

// Watch for mobile layout changes and adjust drawer visibility
watch(mobile, isMobile => {
  drawer.value = !isMobile
})

// Function to fetch books from OpenLibrary API
const fetchBooks = async subject => {
  loading.value = true
  error.value = null

  try {
    let query = ''
    if (subject === 'all') {
      query =
        'book OR novel OR literature OR fiction OR biography OR art OR history OR mystery OR fantasy OR programming'
    } else {
      query = `subject:${subject}`
    }

    const { data } = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=40`,
    )

    if (data.items) {
      cards.value = data.items.map(book => ({
        title: book.volumeInfo.title || 'No Title Available',
        src: book.volumeInfo.imageLinks?.thumbnail || '/default-cover.jpg',
        author: book.volumeInfo.authors?.[0] || 'Unknown Author',
      }))
    } else {
      cards.value = []
      error.value = 'No books found for this category.'
    }
  } catch (err) {
    error.value = 'Failed to load books. Please try again.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Watch for tab changes to fetch books for the new category
watch(tabs, fetchBooks)

// Filter the cards based on search query
const filteredCards = computed(() =>
  cards.value.filter(card =>
    card.title.toLowerCase().includes(searchQuery.value.trim().toLowerCase()),
  ),
)

// Function to fetch user information
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
      email: user.email, // Add email here
    }
  } else {
    console.warn('No user data found.')
    return null
  }
}

// Lifecycle hook to fetch both user and books data on mount
onMounted(async () => {
  // Fetch user information and set reactive variables
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

  // Fetch books for the default category (Agriculture)
  await fetchBooks(tabs.value)
})

// Open form dialog
const openForm = book => {
  // Reset the selectedDate when opening the form
  selectedDate.value = null
  selectedBookTitle.value = book.title // Store the selected book's title
  dialog.value = true
}

const selectedBookTitle = ref('') // To store the selected book's title

const selectedDate = ref(null) // Initialize as null or with a default value

const formatDate = date => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString(undefined, options)
}

const closeDialog = () => {
  selectedBorrowDate.value = null // Reset the borrow date
  selectedReturnDate.value = null // Reset the return date
  dialog.value = false // Close the dialog
}

const submitForm = async () => {
  if (!selectedBorrowDate.value || !selectedReturnDate.value) {
    console.error('Please select a borrow and return date')
    alert('Please select a borrow and return date')
    return
  }

  if (new Date(selectedReturnDate.value) < new Date(selectedBorrowDate.value)) {
    alert('Error: Return date must be later than borrow date.')
    return
  }

  // Fetch user info (from Supabase)
  const user = await getUserInformation()
  if (user) {
    // Get the user's full name, email, and user_id
    const userFullName = `${user.firstname} ${user.lastname}`
    const userEmail = user.email || 'No Email' // Retrieve the user's email
    const userId = user.id // Get the user's Supabase user ID

    // Get the book details (from the selected card)
    const selectedBook = cards.value.find(
      card => card.title === selectedBookTitle.value,
    ) // selectedBookTitle is the title of the selected book

    // Ensure the book is found
    if (selectedBook) {
      const bookDetails = {
        title: selectedBook.title,
        author: selectedBook.author,
        cover: selectedBook.src,
      }
      const bookId = selectedBook.id // Assuming each book has a unique ID

      // Prepare transaction data
      const transactionData = {
        book_title: selectedBookTitle.value,
        user_info: userFullName,
        email: userEmail, // Add email here
        borrowed_date: selectedBorrowDate.value,
        return_date: selectedReturnDate.value,
        status: 'Pending',
      }

      // Save the borrowing data to the 'transactions' table in Supabase
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert([transactionData])

        if (error) {
          // alert(Error submitting form: ${error.message});
          console.error('Error saving transaction:', error.message)
        } else {
          alert('Form submitted successfully!')
          console.log('Transaction saved successfully:', data)
          dialog.value = false // Close the dialog after successful submission
        }
      } catch (error) {
        alert('Error submitting form.')
        console.error('Error during submission:', error.message)
      }
    } else {
      alert('Error: Book not found.')
      console.error('Book not found!')
    }
  } else {
    alert('Error: User not found.')
    console.error('User not found!')
  }
  closeDialog()
}
</script>

<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar class="app-bar" elevation="4" style="background-color: #232d3f">
      <v-btn
        v-if="mobile"
        icon
        aria-label="Toggle Drawer"
        @click="drawer = !drawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-img
        src="/images/logo2.png"
        class="mx-3 my-4"
        max-width="50px"
        alt="Logo"
      ></v-img>
    </v-app-bar>

    <!-- Sidebar Navigation Drawer -->
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
    <v-main class="main-content" style="background-color: aliceblue">
      <!-- Categories and Search Bar -->
      <v-container fluid>
        <!-- Desktop View -->
        <v-row
          justify="center"
          align="center"
          class="category-buttons"
          v-if="!mobile"
        >
          <!-- Desktop Categories Buttons -->
          <v-btn
            v-for="category in categories"
            :key="category.subject"
            :class="{ active: tabs === category.subject }"
            @click="tabs = category.subject"
            class="mx-2 mt-4"
          >
            {{ category.name }}
          </v-btn>
        </v-row>

        <!-- Desktop Search Bar -->
        <v-row justify="center" class="desktop-search-bar mt-4" v-if="!mobile">
          <v-text-field
            v-model="searchQuery"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            dense
            outlined
            clearable
            class="search-bar mt-12 py-12"
          ></v-text-field>
        </v-row>

        <!-- Mobile View -->
        <v-row
          justify="space-between"
          align="center"
          class="mobile-toolbar py-2"
          v-else
        >
          <!-- Dropdown for Categories -->
          <v-row
            justify="space-between"
            align="center"
            class="mobile-toolbar py-2"
          >
            <v-col cols="4" class="dropdown-col">
              <select v-model="tabs">
                <option
                  v-for="category in categories"
                  :key="category.subject"
                  :value="category.subject"
                >
                  {{ category.name }}
                </option>
              </select>
            </v-col>

            <!-- Search Bar -->
            <v-col cols="6" class="search-bar-col">
              <v-text-field
                v-model="searchQuery"
                label="Search"
                prepend-inner-icon="mdi-magnify"
                dense
                outlined
                clearable
                menu-props="{ offset-y: true }"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-row>
      </v-container>

      <!-- Cards -->
      <v-container>
        <v-row>
          <v-col v-if="loading" cols="12" class="text-center">
            <v-progress-circular
              indeterminate
              color="purple"
            ></v-progress-circular>
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
                <v-card-title class="book-card-title">{{
                  card.title
                }}</v-card-title>
                <v-card-subtitle class="book-card-subtitle">{{
                  card.author
                }}</v-card-subtitle>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn @click="openForm(card)" color="primary" text
                    >Borrow</v-btn
                  >
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
            <!-- Borrow Date -->
            <v-text-field
              v-model="selectedBorrowDate"
              label="Borrow Date"
              :value="selectedBorrowDate ? formatDate(selectedBorrowDate) : ''"
              :rules="[value => !!value || 'Borrow date is required']"
              append-inner-icon="mdi-calendar"
              @click="borrowDatePickerDialog = true"
            />
            <v-dialog v-model="borrowDatePickerDialog" max-width="290px">
              <v-date-picker
                v-model="selectedBorrowDate"
                @input="borrowDatePickerDialog = false"
              ></v-date-picker>
            </v-dialog>

            <!-- Return Date -->
            <v-text-field
              v-model="selectedReturnDate"
              label="Return Date"
              :value="selectedReturnDate ? formatDate(selectedReturnDate) : ''"
              :rules="[value => !!value || 'Return date is required']"
              append-inner-icon="mdi-calendar"
              @click="returnDatePickerDialog = true"
            />
            <v-dialog v-model="returnDatePickerDialog" max-width="290px">
              <v-date-picker
                v-model="selectedReturnDate"
                @input="returnDatePickerDialog = false"
              ></v-date-picker>
            </v-dialog>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="submitForm">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-footer class="font-weight-bold bg" elevation="4" app>
      <v-row justify="start">
        <v-col class="text-right py-2 white-text"> 2024 - Book Shelf </v-col>
      </v-row>
    </v-footer>

    <!-- Logout Modal -->
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

/* Cards */
.book-card-wrapper {
  display: flex;
  justify-content: center;
  align-items: stretch;
}
.bg {
  background-color: #232d3f;
}
.white-text {
  color: white;
}

.book-card {
  width: 100%; /* Ensure the card takes up full width in the column */
  max-width: 300px; /* Limit the maximum width of the card */
  height: 400px; /* Set a fixed height for uniformity */
  opacity: 0.9; /* Slight transparency */
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  display: flex;
  flex-direction: column; /* Align the content in a column */
  justify-content: space-between; /* Space out the card elements */
  overflow: hidden; /* Prevent content overflow */
  margin-top: 20%;
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
  transition:
    background-color 0.3s,
    color 0.3s;
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

/* Mobile Toolbar */
.mobile-toolbar {
  background-color: aliceblue;
  padding: 10px;
  border-radius: 5px;
  width: 110%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Slight shadow for separation */
}

.mobile-toolbar .dropdown-col {
  margin-right: 20px; /* Add spacing between dropdown and search bar */
}

.mobile-toolbar .v-select,
.mobile-toolbar .v-text-field {
  width: 105%; /* Ensure full width within their containers */
  font-size: 0.9rem; /* Slightly smaller font for mobile */
}

.mobile-toolbar .v-select .v-input__control,
.mobile-toolbar .v-text-field .v-input__control {
  min-height: 40px; /* Adjust height for better touch support */
}

.mobile-toolbar .v-select .v-overlay__content {
  top: 50px; /* Ensure dropdown aligns below the toolbar */
  left: 0;
  z-index: 10; /* Keep it above other elements */
}

/* Adjust category dropdown and search field alignment */
@media (max-width: 768px) {
  .mobile-toolbar {
    flex-direction: row;
    padding: 3px;
  }

  .dropdown-col,
  .search-bar-col {
    flex: 1; /* Both elements occupy equal space */
  }

  .mobile-toolbar .v-select,
  .mobile-toolbar .v-text-field {
    margin: 0; /* Remove extra margin */
  }
}

/* Footer */
.footer {
  background-color: #232d3f;
  color: white;
}

/* Error Message */
.error-message {
  color: red;
  font-weight: bold;
}

body {
  font-family: 'Poppins', sans-serif;
}

/* Category Buttons (Desktop) */
.category-buttons {
  position: fixed;
  top: 0;
  left: 0;
  width: 118%;
  z-index: 10; /* Ensure it stays above other content */
  background-color: aliceblue; /* Background color */
  padding-top: 10px; /* Adjusted to reduce space */
  display: flex; /* Makes sure buttons are laid out properly */
  justify-content: center; /* Centers buttons */
  flex-wrap: wrap; /* Wraps buttons if necessary */
  padding: 70px 0; /* Optional: Adjusted padding */
}

.category-buttons .v-btn {
  margin: 5px; /* Added margin for spacing between buttons */
}
</style>
