<script setup>
import { ref } from 'vue'
import {
  requiredValidator,
  emailValidator,
  passwordValidator,
  confirmedValidator,
} from '@/utils/validators'
import { supabase, formActionDefault } from '@/utils/supabase.js'
import AlertNotification from '../common/AlertNotification.vue'

const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
const refVForm = ref()

const formDataDefault = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: '',
}

const formData = ref({
  ...formDataDefault,
})

const formAction = ref({
  ...formActionDefault,
})

const onSubmit = async () => {
  formAction.value = { ...formActionDefault }
  formAction.value.formProcess = true

  const { data, error } = await supabase.auth.signUp({
    email: formData.value.email,
    password: formData.value.password,
    options: {
      data: {
        first_name: formData.value.firstname,
        lastname: formData.value.lastname,
        role: formData.value.role,
      },
    },
  })

  if (error) {
    console.log(error)
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status
  } else if (data) {
    console.log(data)
    formAction.value.formSuccessMessage = 'Successfully Registered Account.'
    // Reset form fields after successful registration
    refVForm.value?.reset()
  }

  formAction.value.formProcess = false
}
const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}
</script>

<template>
  <AlertNotification
    :form-success-message="formAction.formSuccessMessage"
    :form-error-message="formAction.formErrorMessage"
  >
  </AlertNotification>

  <v-form class="mt-5" ref="refVForm" @submit.prevent="onFormSubmit">
    <v-row>
      <v-text-field
        v-model="formData.firstname"
        prepend-icon="mdi-account"
        label="Firstname"
        variant="outlined"
        class="v-col-6 "
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
      v-model="formData.role"
      class="pl-10"
      label="Select Role"
      :items="['Borrower', 'Librarian']"
      variant="outlined"
      density="compact"
      :rules="[requiredValidator]"
    ></v-select>

    <v-btn
      class=" mx-auto d-flex  "
      color="red-darken-4"
      prepend-icon="mdi-account-plus"
      :disabled="formAction.formProcess"
      :loading="formAction.formProcess"
      type="submit"
      >Register</v-btn
    >
  </v-form>
</template>
