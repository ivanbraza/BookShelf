<script setup>
import { ref } from 'vue'
import { requiredValidator, emailValidator, passwordValidator, confirmedValidator } from '@/utils/validators'

const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
const refVForm = ref()

const formDataDefault = {
firstname: '',
lastname: '',
email: '',
password: '',
roles: '',
password_confirmation: '',
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
  <v-form ref="refVForm"@submit.prevent="onFormSubmit">
    <v-row>
      <v-text-field
        v-model="formData.firstname"
        prepend-icon="mdi-account"
        label="Firstname"
        variant="outlined"
        class="v-col-6"
        :rules="[requiredValidator]"
      ></v-text-field>

      <v-text-field
      v-model="formData.lastname"
        label="Lastname"
        variant="outlined"
        class="v-col-6"
        :rules="[requiredValidator]"
      ></v-text-field>
    </v-row>

    <v-text-field
    v-model="formData.email"
      prepend-icon="mdi-email"
      label="Email"
      variant="outlined"
      class="my-2"
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
      class="my-2"
      :rules="[requiredValidator, passwordValidator]"
    ></v-text-field>

    <v-text-field
    v-model="formData.password_confirmation"
      prepend-icon="mdi-lock-check"
      label="Password Confirmation"
      variant="outlined"
      :type="isPasswordConfirmVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordConfirmVisible ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPasswordConfirmVisible = !isPasswordConfirmVisible"
      class="my-2"
      :rules="[requiredValidator, confirmedValidator(formData.password_confirmation,formData.password)]"
    ></v-text-field>

    <v-select
    v-model="formData.roles"
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
      prepend-icon="mdi-account-plus"
      type="submit"
      >Register</v-btn
    >
  </v-form>
</template>
