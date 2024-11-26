<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router"; // Import Vue Router for navigation
import Preloader from "./views/auth/Preloader.vue"; // Import Preloader component

// Reactive variable to control when to show the preloader
const loading = ref(true);

// Initialize Vue Router
const router = useRouter();

onMounted(() => {
  // Simulate a loading period and then navigate to login page
  setTimeout(() => {
    loading.value = false; // Hide preloader after 3 seconds
    router.push("/login"); // Navigate to the login page
  }, 3000); // Adjust the time as needed
});
</script>

<template>
  <!-- Show the preloader while loading -->
  <Preloader v-if="loading" />

  <!-- Main content (this will be displayed once loading is complete) -->
  <div v-else>
    <RouterView />
  </div>
</template>

<style scoped>
/* Add global app styles if needed */
</style>
