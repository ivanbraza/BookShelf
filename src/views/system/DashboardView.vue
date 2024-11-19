<!-- Vue Script -->
<script setup>
import { ref, watch } from 'vue'
import { useDisplay } from 'vuetify'

// Mobile detection from Vuetify's display composable
const { mobile } = useDisplay()
const drawer = ref(!mobile.value)

// Watch for changes in mobile status
watch(mobile, (isMobile) => {
  if (!isMobile) {
    drawer.value = true
  }
})
</script>

<!-- Vue Template -->
<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar class="app-bar bg" elevation="4">
      <v-btn v-if="mobile" icon @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-img src="/images/bookshelf-logo.jpg" class="mx-3 my-4" max-width="50px"></v-img>
    </v-app-bar>

    <!-- Main Layout -->
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
            prepend-avatar="https://randomuser.me/api/portraits/women/81.jpg"
            subtitle="Logged in"
            title="Jane Smith"
          ></v-list-item>
        </template>

        <!-- Navigation Links -->
        <v-list density="compact" nav>
          <v-divider></v-divider>
          <v-list-item class="mt-8 nav-title black-text" prepend-icon="mdi-home" title="Home"></v-list-item>
          <v-list-item class="mt-6 nav-title black-text" prepend-icon="mdi-bookshelf" title="Books"></v-list-item>
          <v-list-item class="mt-6 nav-title black-text" prepend-icon="mdi-account-credit-card" title="Transaction"></v-list-item>
          <v-list-item class="mt-6 nav-title black-text" prepend-icon="mdi-information" title="About"></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <!-- Main Content -->
      <v-main class="content-area bg-3 particle-overlay">
        <v-row justify="center" align="center">
          <v-col cols="10" class="mx-auto mt-6">
            <v-carousel hide-delimiters cycle interval="1500" height="400" class="mx-auto">
              <v-carousel-item src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"  ></v-carousel-item>
              <v-carousel-item src="https://cdn.vuetifyjs.com/images/cards/hotel.jpg" ></v-carousel-item>
              <v-carousel-item src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg" ></v-carousel-item>
            </v-carousel>
          </v-col>


          <!-- Router-Link Cards -->
          <v-col cols="8" class="mx-auto my-auto mt-16">

            <v-row>
              <v-col cols="6">
                <router-link to="/borrow-info" class="no-underline">
                  <v-card class="mx-auto mt-auto" elevation="4" height="50" max-width="500" prepend-icon="mdi-book-check" title="How to borrow/reserve a book?">
                  </v-card>
                </router-link>
              </v-col>
    
              <v-col cols="6">
                <router-link to="/register" class="no-underline">
                  <v-card class="mx-auto mt-auto" elevation="4" height="50" max-width="500" prepend-icon="mdi-alert-octagon" title="Penalty for late returned book/s?"></v-card>
                </router-link>
              </v-col>
            </v-row>
 
            <v-row>
              <v-col cols="6">
                <router-link to="/library-hours" class="no-underline">
                  <v-card class="mx-auto mt-auto" elevation="4" height="50" max-width="500" prepend-icon="mdi-clock" title="Library Hours"></v-card>
                </router-link>
              </v-col>
              <v-col cols="6">
                <router-link to="/services" class="no-underline">
                  <v-card class="mx-auto mt-auto" elevation="4" height="50" max-width="500" prepend-icon="mdi-hand-coin" title="Services"></v-card>
                </router-link>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-main>
    </v-row>

    <!-- Footer -->
    <v-footer class="font-weight-bold bg" elevation="4" app>
      <v-row justify="start">
        <v-col class="text-right py-2 white-text">
          2024 - Book Shelf
        </v-col>
      </v-row>
    </v-footer>
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
  color: inherit; /* Ensure text color matches its parent */
}

.nav-title {
  font-family: 'Merriweather', serif;
  font-size: 1.4rem;
  font-weight: 500;
  margin: 0;
}

.bg {
  background-color: #232D3F;
}

.bg-2 {
  background-color: rgb(73, 2, 2);
}

.bg-3 {
  background-color: blanchedalmond
}

.black-text {
  color: black;
}

.white-text {
  color: white;
}

.main-container {
  height: 800px;
  overflow: hidden;
}

.content-area {
  display: flex;
  justify-content: center;
  align-items: center;
}

@keyframes gradient-wave {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.content-area {
  background: #D8E3E7;
  background-size: 300% 300%;
  animation: gradient-wave 7s ease infinite;
}


</style>
