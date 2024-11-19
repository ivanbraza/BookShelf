<script setup>
import { ref } from 'vue'
import { formActionDefault, supabase } from '@/utils/supabase';
import { requiredValidator, emailValidator } from '@/utils/validators'
import { useRouter } from 'vue-router'

const router = useRouter()


const formDataDefault = {
  email: '',
  password: '',
  role: ''
}

const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const isPasswordVisible = ref(false)
const refVForm = ref()

const onSubmit = async () => {
  // Reset Form Action utils; Turn on processing at the same time
  formAction.value = { ...formActionDefault, formProcess: true }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.value.email,
    password: formData.value.password,
    role: formData.value.role
  })

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Logged Account.'
    // Redirect Acct to Dashboard
    router.replace('/dashboard')
  }

  // Reset Form
  refVForm.value?.reset()
  // Turn off processing
  formAction.value.formProcess = false
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
      color="indigo-darken-4"
      prepend-icon="mdi-login"
      type="submit"
      >Log In</v-btn
    >
  </v-form>
</template>
