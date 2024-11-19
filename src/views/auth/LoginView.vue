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
            <v-col cols="12" md="4" sm="8" class="mx-auto">
              <v-card
    class="mx-auto border-opacity-100" border="blue md" elevation="24" style="background-color: #232D3F;"
    >

    <template v-slot:title>
    
        <v-card-title>
    <v-img class="mx-auto" src="/images/logo2.png" 
    :width="mobile ? '25%' : '25%'"
    ></v-img>
    <h3 class="font-weight-black text-center " style="color: aliceblue;">Book Shelf</h3>
    <p class="font-weight-bold text-center"  style="color: aliceblue;">Login Form</p>
   </v-card-title>

     
    </template>

    

    <v-card-text class="bg-surface-light pt-4">
      <h2 class="text-center"  style="color: darkblue;">Welcome to Book Shelf!</h2>
      <v-divider class="my-5"></v-divider>

        <LoginForm></LoginForm>
      
    <v-divider class="my-5">
      <h6>Don't have an account? <router-link to="/register" class="text-indigo-darken-2 font-weight-black">Click here to Register</router-link> </h6>
    </v-divider>

    </v-card-text>
  </v-card>
            </v-col>
          </v-row>
    </template>
  </AppLayout>
         
</template>