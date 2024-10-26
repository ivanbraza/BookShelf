<script setup>
import { ref } from 'vue'

const isPasswordVisible = ref(false)
</script>

<template>
  <v-form fast-fail @submit.prevent class="pr-4">
    <v-text-field
      class="pt-3"
      prepend-icon="mdi-email"
      label="Email"
      variant="outlined"
    ></v-text-field>

    <v-text-field
      prepend-icon="mdi-lock"
      label="Password"
      variant="outlined"
      :type="isPasswordVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPasswordVisible = !isPasswordVisible"
    ></v-text-field>

    <v-select
      class="pl-10"
      label="Select Role"
      :items="['Borrower', 'Librarian']"
      variant="outlined"
      density="compact"
    ></v-select>

    <v-btn
      class="mt-2 mx-auto d-flex"
      color="red-darken-4"
      prepend-icon="mdi-login"
      type="submit"
      >Log In</v-btn
    >
  </v-form>
</template>
