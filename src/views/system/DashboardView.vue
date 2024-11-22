<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar class="app-bar bg" elevation="4">
      <v-btn v-if="mobile" icon @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-img src="/images/bookshelf-logo.jpg" class="mx-3 my-4" max-width="50px"></v-img>
      <!-- Logout Button in App Bar -->
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
      <v-main class="content-area bg-3 particle-overlay">
        <v-row justify="center" align="center">
          <v-col cols="10" class="mt-4">
            <v-img src="/images/OpenHour.png"></v-img>
          </v-col>

          <!-- Router-Link Cards -->
          <v-col cols="11" class="mx-auto my-auto py-10">
            <v-row>
              <v-col cols="6">
                <router-link to="/borrow-info" class="no-underline">
                  <v-card
                    class="mx-auto mt-auto"
                    elevation="4"
                    height="50"
                    max-width="500"
                    prepend-icon="mdi-book-check"
                    title="How to borrow/reserve a book?"
                    @click="drawer = false; $router.push('/books')"
                    style="background-color: transparent; border: 2px solid #000000; box-shadow: none;"
                  ></v-card>
                </router-link>
              </v-col>

              <v-col cols="6">
                <router-link to="/register" class="no-underline">
                  <v-card
                    class="mx-auto mt-auto"
                    elevation="4"
                    height="50"
                    max-width="500"
                    prepend-icon="mdi-alert-octagon"
                    title="Penalty for late returned book/s?"
                    style="background-color: transparent; border: 2px solid  #232D3F; box-shadow: none;"
                  ></v-card>
                </router-link>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6">
                <router-link to="/library-hours" class="no-underline">
                  <v-card
                    class="mx-auto mt-auto"
                    elevation="4"
                    height="50"
                    max-width="500"
                    prepend-icon="mdi-clock"
                    title="Library Hours"
                    style="background-color: transparent; border: 2px solid #232D3F; box-shadow: none;"
                  ></v-card>
                </router-link>
              </v-col>
              <v-col cols="6">
                <router-link to="/services" class="no-underline">
                  <v-card
                    class="mx-auto mt-auto"
                    elevation="4"
                    height="50"
                    max-width="500"
                    prepend-icon="mdi-hand-coin"
                    title="Services"
                    style="background-color: transparent; border: 2px solid #232D3F; box-shadow: none;"
                  ></v-card>
                </router-link>
              </v-col>
            </v-row>
          </v-col>

          <!-- Additional Content -->
          <v-row class="mx-auto my-auto bg-3 py-16">
            <v-col class="pl-16 pr-16" cols="12">
              <h1>How to Borrow or Reserve Books?</h1>
              <h3>
                At <b>BookShelf</b>, borrowing books is simple! Follow these steps:
              </h3>
              <v-row>
                <v-col cols="12" sm="4">
                  <h4>Browse Our Collection:</h4>
                  <p>Search for your desired book through our online catalog.</p>
                </v-col>
                <v-col cols="12" sm="4">
                  <h4>Reserve a Book:</h4>
                  <p>If the book is currently unavailable, you can place a hold.</p>
                </v-col>
                <v-col cols="12" sm="4">
                  <h4>Pick Up Your Book:</h4>
                  <p>Once your book is available, you will be notified to pick it up from our library.</p>
                </v-col>
              </v-row>
              <p>Don’t forget to bring your school ID when you come to check out your books!</p>
            </v-col>
          </v-row>
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

    <!-- Logout Modal -->
    <LogoutModal ref="logoutModalRef" />
  </v-app>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
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
</script>

<style scoped>
/* Keep the entire original styling */
</style>


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
  font-weight: 1000;
  margin: 0;
}

.bg {
  background-color: #232D3F;
}

.bg-2 {
  background-color: rgb(73, 2, 2);
}

.bg-3 {
  background-color: rgb(77, 127, 255)
}

.black-text {
  color: black;
}

.white-text {
  color: white;
}

.main-container {
  height: auto;
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
