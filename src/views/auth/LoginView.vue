<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue';
import { useDisplay } from 'vuetify'
import LoginForm from '@/components/auth/LoginForm.vue';

const { mobile } = useDisplay()

</script>

<template>
  <AppLayout>
    <template #content>
      <v-row>
            <v-col cols="12" md="8" class="mx-auto">
              <v-card
    class="mx-auto d-flex border-opacity-100" border="error md" elevation="24" color="red-darken-4"
    >

    <template v-slot:title>
    
        <v-card-title>
    <v-img class="mx-auto" src="/images/bookshelf-logo.jpg" 
    :width="mobile ? '100%' : '75%'"
    ></v-img>
    <h3 class="font-weight-black text-center">Book Shelf</h3>
    <p class="font-weight-bold text-center">Login Form</p>
   </v-card-title>

     
    </template>

    

    <v-card-text class="bg-surface-light pt-4">
      <h2 class="text-center">Welcome to Book Shelf!</h2>
      <v-divider class="my-5"></v-divider>

        <LoginForm></LoginForm>
      
    <v-divider class="my-5">
      <h5>Don't have an account? <router-link to="/register">Click here to Register</router-link> </h5>
    </v-divider>

    </v-card-text>
  </v-card>
            </v-col>
          </v-row>
    </template>
  </AppLayout>
         
</template>