<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue';
import { useDisplay } from 'vuetify'

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
    <p class="font-weight-bold text-center">Login</p>
   </v-card-title>

     
    </template>

    

    <v-card-text class="bg-surface-light pt-4">

      <h2 class="text-center">Welcome to Hulam-hulam Ra!</h2>

      <v-form fast-fail @submit.prevent class="pr-4">
      <v-text-field
      class="pt-3" prepend-icon="mdi-email" label="Email" variant="outlined" 
      ></v-text-field>

      <v-text-field
       prepend-icon="mdi-lock" label="Password" variant="outlined" type="password"
      ></v-text-field>

      <v-select
    class="pl-10" label="Select Role":items="['Borrower', 'Librarian']"
    variant="outlined" density="compact"></v-select>


      <v-btn class="mt-2 mx-auto d-flex" color="red-darken-4" prepend-icon="mdi-login" type="submit">Log In</v-btn>
    </v-form>

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