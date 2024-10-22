<script setup>
import { ref } from 'vue'

const theme = ref('light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>


<template>
  <v-responsive class="border rounded">
    <v-app :theme="theme">
      <v-app-bar class="px-3" color="red-darken-4">
        <v-spacer></v-spacer>

        <v-btn
          :prepend-icon = "theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          text="Toggle Theme"
          slim
          @click="onClick"
        ></v-btn>
      </v-app-bar>

      <v-main>
        <v-container class="mt-16 py-6">
          <v-row>
            <v-col cols="12" md="8" class="mx-auto">
              <v-card
   class="mx-auto d-flex border-opacity-100" border="error md"
   elevation="24"
    prepend-icon="mdi-account"
    subtitle="Sign Up">


    <template v-slot:title >
      <span class="font-weight-black justify-center d-flex">Book Hunt</span>
    </template>

    <v-card-text class="bg-surface-light pt-4">
      <v-form fast-fail @submit.prevent>
     
    <v-row>
        <v-text-field
       prepend-icon="mdi-account" label="Firstname" variant="outlined" class="v-col-6"></v-text-field>

      <v-text-field
        label="Lastname" variant="outlined" class="v-col-6"></v-text-field>
    </v-row>

      <v-text-field
       prepend-icon="mdi-email" label="Email" variant="outlined" class="my-2"
      ></v-text-field>

      <v-text-field
       prepend-icon="mdi-lock" label="Password" variant="outlined" type="password"
      ></v-text-field>

      <v-text-field
       label="Password Confirmation" variant="outlined" type="password" class="my-2 pl-10"
      ></v-text-field>

      <v-btn class="mt-2 mx-auto d-flex" color="red-darken-4" type="submit">Log In</v-btn>
    </v-form>
      <v-divider class="my-6">
        <h5>Have an existing account? <RouterLink to="/">Login Here</RouterLink></h5>
      </v-divider>
    </v-card-text>
  </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
      <v-footer color="red-darken-4" border app>2024 - BookHunt</v-footer>
    </v-app>
  </v-responsive>
</template>

