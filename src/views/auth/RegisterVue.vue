Register view
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
            <v-col cols="12" md="4" sm="8" class="mx-auto">
              <v-card
   class="mx-auto border-opacity-100" border="blue md"  style="background-color: #232D3F;"
   elevation="24">
   <v-card-title>
    <v-img class="mx-auto" src="/images/logo2.png" 
    :width="mobile ? '50%' : '30%'"  height="75"
    ></v-img>
    <h4 class="font-weight-bold text-center" style="color: aliceblue;">Book Shelf</h4>
    <h6 class="font-weight-light text-center" style="color: aliceblue;">Registration Form</h6>
   </v-card-title>

    <v-card-text class="bg-surface-light ">
      
      <v-divider class="my-3"></v-divider>

      <RegisterForm></RegisterForm>
     
      <v-divider class="my-5">
        <h6>Have an existing account? <router-link  to="/" class="text-indigo-darken-2 font-weight-black">Login Here</router-link></h6>
      </v-divider>
    </v-card-text>
  </v-card>
            </v-col>
          </v-row>
        </template>
  </AppLayout>
        
</template>

