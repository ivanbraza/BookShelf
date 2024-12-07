
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
        <v-app-bar class="px-2" style="background-color: #232D3F;">
          <v-spacer></v-spacer>
<!--   
          <v-btn
            :prepend-icon = "theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
            text="Toggle Theme"
            slim
            @click="onClick"
          ></v-btn> -->
        </v-app-bar>
  
        <v-main class="" style="background-color: #E7F0DC">
          <v-container class="mt-3 pt-2">

            <slot name="content"></slot>

          </v-container>
      </v-main>
      <v-footer class="font-weight-bold  " style="background-color: #232D3F; color: white;" border app>2024 - Book Shelf</v-footer>
    </v-app>
  </v-responsive>
</template>