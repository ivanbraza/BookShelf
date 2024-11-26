<template>
    <v-dialog v-model="show" max-width="400">
      <v-card color="#232D3F" elevation="10" class="dialog-card">
        <v-card-text class="font-weight-black text-center mt-0">
          <h4
            class="font-weight-black"
            style="font-family: 'Futura', sans-serif"
          >
            Are you sure you want to Log Out?
          </h4>
        </v-card-text>
        <v-card-actions class="justify-center dialog-actions mb-2">
          <v-btn
            text
            class="confirm-btn font-weight-bold hover-zoom"
            @click="logout"
            style="
              background-color: white;
              color: black;
              font-family: 'Futura', sans-serif;
              margin-right: 5px;
            "
          >
            Logout
          </v-btn>
          <v-btn
            text
            class="cancel-btn font-weight-bold hover-zoom"
            @click="cancelLogout"
            style="
              font-family: 'Futura', sans-serif;
              background-color: red;
              color: white;
              margin-left: 5px;
            "
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase, formActionDefault } from '@/utils/supabase'
  
  // A ref to control the modal's visibility
  const show = ref(false)
  const router = useRouter()
  
  // Function to open the modal
  const open = () => {
    show.value = true
  }
  
  const formAction = ref({
    ...formActionDefault
  })
  // Function to close the modal without logging out
  const cancelLogout = () => {
    show.value = false
  }
  
  // Perform the logout logic
  const logout = async () => {
    formAction.value = { ...formActionDefault, formProcess: true }
  
    // Get supabase logout functionality
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error during logout:', error)
      return
    }
  
    formAction.value.formProcess = false
    // Reset State
  
    router.replace('/login')
  }
  
  // Expose the open function so the parent can call it
  defineExpose({
    open
  })
  </script>
  
  <style scoped>
  .text-center {
    text-align: center;
  }
  
  .hover-zoom {
    transition: transform 0.3s ease; /* Smooth transition */
  }
  
  .hover-zoom:hover {
    transform: scale(1.05); /* Scale up on hover */
  }
  </style>