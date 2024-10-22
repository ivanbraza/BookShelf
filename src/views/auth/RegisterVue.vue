<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue';
import { useDisplay } from 'vuetify'
import RegisterForm from '@/components/auth/RegisterForm.vue';
const { mobile } = useDisplay()

</script>


<template>
  <AppLayout>
    <template #content>
    <v-row>
            <v-col cols="12" md="8" class="mx-auto">
              <v-card
   class="mx-auto border-opacity-100" border="error md" color="red-darken-4"
   elevation="24">
   <v-card-title>
    <v-img class="mx-auto" src="/images/bookshelf-logo.jpg" 
    :width="mobile ? '75%' : '25%'"  height="180"
    ></v-img>
    <h3 class="font-weight-bold text-center">Book Shelf</h3>
    <p class="font-weight-light text-center">Registration Form</p>
   </v-card-title>

    <v-card-text class="bg-surface-light pt-4">
      
      <v-divider class="my-6"></v-divider>

      <RegisterForm></RegisterForm>
     
      <v-divider class="my-6">
        <h5>Have an existing account? <RouterLink to="/">Login Here</RouterLink></h5>
      </v-divider>
    </v-card-text>
  </v-card>
            </v-col>
          </v-row>
        </template>
  </AppLayout>
        
</template>

