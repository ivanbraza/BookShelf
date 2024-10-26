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
        <v-app-bar class="px-2" color="red-darken-3">
          <v-spacer></v-spacer>
<!--   
          <v-btn
            :prepend-icon = "theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
            text="Toggle Theme"
            slim
            @click="onClick"
          ></v-btn> -->
        </v-app-bar>
  
        <v-main>
          <v-container class="mt-3 pt-2">

            <slot name="content"></slot>

          </v-container>
      </v-main>
      <v-footer class="font-weight-bold" color="red-darken-4" border app>2024 - Book Shelf</v-footer>
    </v-app>
  </v-responsive>
</template>