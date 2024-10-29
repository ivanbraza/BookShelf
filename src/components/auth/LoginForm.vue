<script setup>
import { ref } from 'vue'
import { requiredValidator, emailValidator } from '@/utils/validators'

const isPasswordVisible = ref(false)
const refVForm = ref()

const formDataDefault = {
  email: '',
  password: '',
  role: '',
}

const formData = ref({
  ...formDataDefault,
})

const onSubmit = () => {
// alert(formData.value.email)
}
const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid}) => {
    if (valid) onSubmit()
  })
}
</script>

<template>
  <v-form ref="refVForm"@submit.prevent="onFormSubmit" class="pr-4">
    <v-text-field
      v-model="formData.email"
      class="pt-3"
      prepend-icon="mdi-email"
      label="Email"
      variant="outlined"
      :rules="[requiredValidator, emailValidator]"
    ></v-text-field>

    <v-text-field
      v-model="formData.password"
      prepend-icon="mdi-lock"
      label="Password"
      variant="outlined"
      :type="isPasswordVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPasswordVisible = !isPasswordVisible"
      :rules="[requiredValidator]"
    ></v-text-field>

    <v-select
    v-model="formData.role"
      class="pl-10"
      label="Select Role"
      :items="['Borrower', 'Librarian']"
      variant="outlined"
      density="compact"
      :rules="[requiredValidator]"
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
