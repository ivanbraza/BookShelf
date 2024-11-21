<script setup>
import { ref, watch } from 'vue'
import { useDisplay } from 'vuetify'

// Vuetify's display composable for mobile detection
const { mobile } = useDisplay()
const drawer = ref(!mobile.value)

watch(mobile, (isMobile) => {
  drawer.value = !isMobile
})

// Card expand state
const expandedCards = ref([])

// Dialog visibility state
const dialog = ref(false)

// Sample card data
const cards = ref([
  { title: 'The Hobbit', subtitle: '1,000 miles of wonder', img: '/images/hobbit.png' },
  { title: 'The Hypocrite World', subtitle: 'A journey to remember', img: '/images/thw.png' },
  { title: 'Alone', subtitle: 'Beautiful landscapes await', img: '/images/alone.png' },
  { title: 'A Million to One', subtitle: 'Peaceful and serene', img: '/images/million.png' },
])

// Toggle expand for a specific card
function toggleExpand(index) {
  expandedCards.value[index] = !expandedCards.value[index]
}

// Open the form dialog
function openForm() {
  dialog.value = true
}

const selectedDate = ref(null)
const datePickerDialog = ref(false) // Controls the date picker dialog visibility
</script>

<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar class="app-bar" elevation="4" style="background-color: #232D3F;">
      <v-btn v-if="mobile" icon @click="drawer = !drawer" >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-img
        src="/images/logo2.png"
        class="mx-3 my-4"
        max-width="50px"
      ></v-img>
    </v-app-bar>

    <!-- Sidebar Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :temporary="mobile"
      location="left"
      :permanent="!mobile"
      fixed
      clipped
      style="background-color: #E7F0DC"
    >
      <template v-slot:prepend>
        <v-divider></v-divider>
        <v-list-item
          lines="two"
          prepend-avatar="https://randomuser.me/api/portraits/women/81.jpg"
          subtitle="Logged in"
          title="Jane Smith"
        ></v-list-item>
      </template>

        <!-- Navigation Links -->
        <v-list density="compact" nav>
        <v-divider></v-divider>
        <v-list-item
        class="mt-8 nav-title black-text"
        prepend-icon="mdi-home"
        title="Home"
        @click="drawer = mobile ? false : drawer; $router.push('/')"
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
        <v-list-item
        class="mt-6 nav-title black-text"
        prepend-icon="mdi-information"
        title="About"
        @click="drawer = mobile ? false : drawer; $router.push('/about')"
        ></v-list-item>
        </v-list>

      </v-navigation-drawer>

    

    <!-- Main Content -->
    <v-main style="background-color:#D8E3E7; height: 100%;">
      <v-container>
        <!-- Cards Section -->
        <v-row>
          <v-col v-for="(card, index) in cards" :key="index" cols="12" md="6" lg="4">
            <v-card max-width="280" class="mx-auto" elevation="24">
              <v-img :src="card.img" height="300" width="1000" ></v-img>
              <v-divider></v-divider>
              <v-card-title class="text-center">{{ card.title }}</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn icon @click="toggleExpand(index)" aria-label="Toggle Card Details">
                  <v-icon color="blue">{{ expandedCards[index] ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
              </v-card-actions>
              <v-expand-transition>
                <v-card-text v-if="expandedCards[index]">
                  <v-divider></v-divider>
                  <v-card-text>{{ card.subtitle }}</v-card-text>
                  <v-btn @click="openForm" style="background-color: #16325B ; color: wheat " class="float-end my-5">Borrow</v-btn>
                </v-card-text>
              </v-expand-transition>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

     <!-- Form Dialog -->
     <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="headline">Borrow Book</span>
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field label="Name" required></v-text-field>
              <v-text-field label="Email" type="email" required></v-text-field>
              <!-- Date Picker Dialog Trigger -->
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

      <!-- Centered Date Picker Dialog -->
      <v-dialog v-model="datePickerDialog">
        <v-card>
          <v-row justify="space-around">
          <v-date-picker v-model="selectedDate" elevation="20"></v-date-picker>
        </v-row>
        </v-card>
      </v-dialog>
    </v-main>

    <!-- Footer -->
    <v-footer class="font-weight-bold"  elevation="24" app style="background-color: #232D3F;">
      <v-row justify="start">
        <v-col class="text-right py-2" style="color: wheat;">2024 - Book Shelf</v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<style scoped>
.app-bar {
  z-index: 1000;
}

.nav-title {
  font-family: 'Merriweather', serif;
  font-size: 1.4rem;
  font-weight: 500;
  margin: 0;
}
</style>
