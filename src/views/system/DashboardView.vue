<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar class="app-bar bg" elevation="4">
      <v-btn v-if="mobile" icon @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-img src="/images/logo.png" class="mx-3 my-4" max-width="50px"></v-img>
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
            @click="drawer = mobile ? false : drawer; $router.push('/transactions')"
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
          <v-col cols="11" class="mt-9">
             <!-- Blurred Background Section -->
        <div class="blurred-background">
          <!-- Blurred Background Image -->
          <div class="background-image"></div>

          <!-- Text Overlay (No blur) -->
          <div class="blurred-overlay">
            <h1 class="title">Welcome to BookShelf</h1>
            <p class="subtitle">
              "Reserve, Borrow, and Pick Up: Your Books, Your Way – Anytime, Anywhere."
            </p>
          </div>
        </div>
          </v-col>

          <v-col cols="12" sm="6" class="mb-auto">
  <router-link to="#borrowing" class="no-underline">
    <v-card
      class="card-hover mx-auto mt-auto"
      elevation="4"
      height="50"
      max-width="370"
      prepend-icon="mdi-book-check"
      title="How to borrow/reserve a book?"
      style="background-color: #ffffff; border: 2px solid #000000; box-shadow: none;"
    ></v-card>
  </router-link>
</v-col>

<v-col cols="12" sm="6" class="mb-auto">
  <router-link to="#penalty" class="no-underline">
    <v-card
      class="card-hover mx-auto mt-auto"
      elevation="4"
      height="50"
      max-width="370"
      prepend-icon="mdi-alert-octagon"
      title="Penalty for late returned book/s?"
      style="background-color: #ffffff; border: 2px solid #232D3F; box-shadow: none;"
    ></v-card>
  </router-link>
</v-col>

<v-col cols="12" sm="6">
  <router-link to="#libraryhours" class="no-underline">
    <v-card
      class="card-hover mx-auto mt-auto" 
      elevation="4"
      height="50"
      max-width="370"
      prepend-icon="mdi-clock"
      title="Library Hours"
      style="background-color: #ffffff; border: 2px solid #232D3F; box-shadow: none;"
    ></v-card>
  </router-link>
</v-col>

<v-col cols="12" sm="6">
  <router-link to="#services" class="no-underline">
    <v-card
      class="card-hover mx-auto mt-auto"
      elevation="4"
      height="50"
      max-width="370"
      prepend-icon="mdi-hand-coin"
      title="Services"
      style="background-color: #ffffff; border: 2px solid #232D3F; box-shadow: none;"
    ></v-card>
  </router-link>
</v-col>


          <!--How to borrow books section-->
      <v-row class="mx-auto my-auto bg-4 py-16" id="borrowing">
      <v-col class="pl-16 pr-16" cols="12">
      <h1 class="text-center text-primary display-1 font-weight-bold mb-6">
        <v-icon class="mr-2" size="32">mdi-book-check</v-icon>
        How to Borrow or Reserve Books?</h1>
      <h3 class="text-center font-weight-medium mb-8">
        At <b class>BookShelf</b>, borrowing books is simple! Follow these steps:
      </h3>

      <v-row>
        <v-col cols="12" sm="4" class="py-4">
          <v-card
            class="hover-card"
            elevation="3"
            outlined
            style="background-color: #ffffff;"
          >
            <v-card-text class="text-center d-flex flex-column align-center">
              <v-icon color="primary" size="48" class="mb-4">mdi-book-open-page-variant</v-icon>
              <h4 class="font-weight-bold">Browse Our Collection</h4>
              <p class>Search for your desired book in the books section and check for its availability.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="4" class="py-4">
          <v-card
            class="hover-card"
            elevation="3"
            outlined
            style="background-color: #ffffff;"
          >
            <v-card-text class="text-center d-flex flex-column align-center">
              <v-icon color="primary" size="48" class="mb-4">mdi-calendar-check</v-icon>
              <h4 class="font-weight-bold">Reserve a Book</h4>
              <p>If the book is currently unavailable, you can place a hold.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="4" class="py-4">
          <v-card
            class="hover-card"
            elevation="3"
            outlined
            style="background-color: #ffffff;"
          >
            <v-card-text class="text-center d-flex flex-column align-center">
              <v-icon color="primary" size="48" class="mb-4">mdi-library-shelves</v-icon>
              <h4 class="font-weight-bold">Pick Up Your Book</h4>
              <p class>Once your book is available, you will be notified to pick it up from our library.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <p 
        class="text-center mt-6 text-red pa-4" 
        style="background-color: #FFE5E5; border-radius: 8px; border: 1px solid #FFCCCC;"
      >
        <b>Note:</b> Don’t forget to bring your school ID when you come to check out your books!
      </p>
    </v-col>
  </v-row>




    <!--Penalty Section-->
<v-row class="mx-auto my-auto py-16 px-8 card-hover" align="center" style="background-color:  #D8E3E7; border-radius: 8px;" id="penalty">
  <!-- Column for Image -->
  <v-col cols="12" md="6" class="d-flex justify-center">
    <v-img 
      src="/public/images/penaltyimg.png" 
      alt="Penalty Image" 
      max-width="400px" 
      class="rounded-lg shadow-md hover:scale-105 transition-transform"
    />
  </v-col>

  <!-- Column for Text -->
  <v-col cols="12" md="6" class="px-8">
    <h1 class="text-start text-primary font-weight-bold mb-4">
      <v-icon class="mr-2" size="32">mdi-alert-octagon</v-icon>
      Penalty for Late Returned Books
    </h1>

    <h2 class="text-start text-dark font-weight-medium mb-6" style="line-height: 1.5;">
      We understand that life can get busy, but it's important to return books on time so everyone can enjoy them. Here's our penalty policy for overdue books:
    </h2>

    <!-- Penalty Policy Cards -->
    <v-row class="g-4">
      <v-col cols="12" sm="6">
        <v-card elevation="3" class="pa-4 text-center rounded-lg" style="background-color: #FFFFFF;">
          <h3 class="font-weight-bold text-primary">1–14 days late</h3>
          <p class="mt-2"><br>₱10 per day</p>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6">
        <v-card elevation="3" class="pa-4 text-center rounded-lg d-flex flex-column" style="background-color: #FFFFFF;">
          <h3 class="font-weight-bold text-primary">15+ days late</h3>
          <p class="mt-2">
            You will be blocked <br>until the fine is paid
          </p>
        </v-card>
      </v-col>
    </v-row>

    <p  class="text-center mt-6 text-error pa-4" 
    style="background-color: #FFE5E5; border-radius: 8px; border: 1px solid #FFCCCC;">
      Please remember to return or renew your books before the due date!
    </p>
  </v-col>
</v-row>


<!--Library Hours Section-->

<v-row class="mx-auto my-auto bg-4 py-16" id="libraryhours">
  <v-col class="pl-16 pr-16" cols="12">    

    <h1 class="text-center text-primary display-1 font-weight-bold mb-6">
        <v-icon class="mr-2" size="34">mdi-clock</v-icon>
       Library Hours</h1>
      <h3 class="text-center font-weight-medium mb-8">
      Our libary is here to provide you with resources, knowledge, and a space to learn.<br> The library is open during the following hours.
      </h3>
    
      <v-row>
  <!-- Monday to Friday Card -->
  <v-col cols="12" sm="4" class="py-auto px-auto">
    <v-card
      class="hover-card"
      elevation="4"
      outlined
      style=" color: #ffffff; border-radius: 12px;"
    >
      <v-card-text class="text-center d-flex flex-column align-center py-6 px-4">
        <v-icon color="primary" size="60" class="mb-2">mdi-calendar</v-icon>
        <h4 class="font-weight-bold text-h5 text-secondary" style="font-size: 1.8rem;">MONDAY TO FRIDAY</h4>
         <div class="d-flex flex-column align-center mt-2">
          <br>
          <p class="font-weight-bold text-black" style="font-size: 1.4rem; margin: 0;">08:00 AM TO 07:00 PM</p>
        </div>
      </v-card-text>
    </v-card>
  </v-col>

  <!-- Saturday Card -->
  <v-col cols="12" sm="4" class="py-auto px-auto">
    <v-card
      class="hover-card"
      elevation="4"
      outlined
      style=" color: #ffffff; border-radius: 12px;"
    >
      <v-card-text class="text-center d-flex flex-column align-center py-6 px-4">
        <v-icon color="primary" size="60" class="mb-2">mdi-calendar</v-icon>
        <h4 class="font-weight-bold text-h5 text-secondary" style="font-size: 1.8rem;">SATURDAY</h4>
        <div class="d-flex flex-column align-center mt-2">
          <br>
          <p class="font-weight-bold text-black" style="font-size: 1.4rem; margin: 0;">10:00 AM TO 05:00 PM</p>
        </div>
      </v-card-text>
    </v-card>
  </v-col>


<!-- Sunday Card -->
<v-col cols="12" sm="4" class="py-auto px-auto">
    <v-card
      class="hover-card"
      elevation="4"
      outlined
      style=" color: #ffffff; border-radius: 12px;"
    >
      <v-card-text class="text-center d-flex flex-column align-center py-6 px-4">
        <v-icon color="primary" size="60" class="mb-2">mdi-calendar</v-icon>
        <h4 class="font-weight-bold text-h5 text-secondary" style="font-size: 1.8rem;">SUNDAY</h4>
        <div class="d-flex flex-column align-center mt-2">
          <br>
          <p class="font-weight-bold text-black" style="font-size: 1.4rem; margin: 0;">CLOSED</p>
        </div>
      </v-card-text>
    </v-card>
  </v-col>
</v-row>





  </v-col>
</v-row>



<!--Services Section-->


<v-row class="mx-auto my-auto bg-4 py-16" id="services" style="background-color: #D8E3E7; border-radius: 8px;">
  <v-col class="pl-16 pr-16" cols="12">    

    <h1 class="text-center text-secondary display-1 font-weight-bold mb-6">
      <v-icon class="mr-2" size="34">mdi-hand-coin</v-icon>
      Services
    </h1>
    <h3 class="text-center font-weight-medium mb-8">
      <b>BookShelf</b> provides the following services:
    </h3>

    <v-container>
      <v-row justify="center">
        <!-- Card 1 -->
        <v-col cols="12" sm="6" class="d-flex justify-center">
          <v-card class="text-center pa-4 hover-card" max-width="500">
            <v-img src="/public/images/LaptopArea.jpg" height="145" width="auto" class="d-flex align-center ml-15"></v-img>
            <h3 class="font-weight-bold mt-2">Laptop Area</h3>
            <p>This service allows clients to plug their laptops in a designated area.</p>
          </v-card>
        </v-col>

        <!-- Card 2 -->
        <v-col cols="12" sm="6" class="d-flex justify-center">
          <v-card class="text-center pa-4 hover-card" max-width="500">
            <v-img src="/public/images/LibraryOrientation.png" height="145" width="auto" class="d-flex align-center"></v-img>
            <h3 class="font-weight-bold mt-2">Library Orientation</h3>
            <p>Provides a good understanding of the library's objectives, facilities, resources, and services.</p>
          </v-card>
        </v-col>
      </v-row>

      <v-row justify="center">
        <!-- Card 3 -->
        <v-col cols="12" sm="6" class="d-flex justify-center">
          <v-card class="text-center pa-4 hover-card" max-width="500">
            <v-img src="/public/images/BibliographicAssistance.jpg" height="145" width="auto" class="d-flex align-center"></v-img>
            <h3 class="font-weight-bold mt-2">Bibliographic Assistance</h3>
            <p>Librarians prepare bibliographies on certain subjects upon request by students and faculty.</p>
          </v-card>
        </v-col>

        <!-- Card 4 -->
        <v-col cols="12" sm="6" class="d-flex justify-center">
          <v-card class="text-center pa-4 hover-card" max-width="500">
            <v-img src="/public/images/AudioVisuaRoom.jpeg" height="145" width="auto" class="d-flex align-center"></v-img>
            <h3 class="font-weight-bold mt-2">Audio Visual Room</h3>
            <p>For viewing and borrowing of digital interactive CDs and DVDs.</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
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
import { ref, watch, onMounted } from 'vue';
import { useDisplay } from 'vuetify';
import LogoutModal from '../auth/LogoutModal.vue';
import { supabase } from '@/utils/supabase';
import { getInitials } from '@/utils/helpers';
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

// Lifecycle hook
onMounted(async () => {
  const user = await getUserInformation();
  if (user) {
    firstName.value = user.firstname;
    lastName.value = user.lastname;
    console.log('User data set:', { firstName: firstName.value, lastName: lastName.value });
  } else {
    console.error('User not logged in or data not found.');
  }
});


</script>

<style scoped>

/* Hover effect on cards */
.card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-hover:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

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

.bg-4 {
  background-color: #bcc8e1;
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

.v-col:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease-in-out;
}

.v-col:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease-in-out;
} 

.text-center {
  text-align: center;
}

.hover-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Blurred Background Section */
.blurred-background {
  position: relative;
  width: 100%;
  height: 60vh; /* Set the height to 60% of the viewport height for responsiveness */
  overflow: hidden; /* Prevent any elements from overflowing */
}

.background-image {
  background-image: url('/public/images/libraryimg.webp');
  background-size: cover;
  background-position: center;
  filter: blur(3px); /* Increased blur for better background separation */
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.blurred-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  text-align: center;
  z-index: 1;
  width: 90%; /* Ensure the overlay text has space on mobile */
  max-width: 600px; /* Limit max width on larger screens */
  padding: 10px; /* Extra padding for a more spacious look */
}

/* Title Text */
.title {
  font-size: 3.3rem; /* Larger font size */
  font-weight: 790; /* Increased weight for better visibility */
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.7); /* Darker shadow for greater contrast */
  color: #E7F0DC;
  line-height: 1.3; /* Adjust line height for more breathing room */
}

/* Subtitle Text */
.subtitle {
  font-size: 1.8rem; /* Larger subtitle */
  line-height: 1.6; /* Better line spacing */
  font-weight: 400; /* Normal weight */
  color: #E7F0DC;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); /* Adding shadow for subtitle as well */
}

.text-center {
  text-align: center;
}

/* Make sure the overlay text remains readable on mobile */
@media (max-width: 600px) {
  .blurred-overlay {
    padding: 15px; /* Less padding on small screens */
  }

  .title {
    font-size: 2.5rem; /* Slightly smaller title on mobile */
  }

  .subtitle {
    font-size: 1.4rem; /* Slightly smaller subtitle */
  }


}



</style>
