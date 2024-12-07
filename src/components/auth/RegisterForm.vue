<script setup>
import { ref } from 'vue'
import { requiredValidator, emailValidator, passwordValidator, confirmedValidator } from '@/utils/validators'
import AlertNotification from '@/components/common/AlertNotification.vue'
import { supabase, formActionDefault } from '@/utils/supabase.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
const refVForm = ref()

const formDataDefault = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  role: '', // Role field corrected
  password_confirmation: ''
}

const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})

// Register Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.value.email,
      password: formData.value.password,
      options: {
        data: {
          firstname: formData.value.firstname,
          lastname: formData.value.lastname,
          role: 'Borrower', // Store role in Supabase
          is_admin: 'false',// Assign admin if Librarian
          user_status: 'Active'
        }
      }
    })

    if (error) {
      // Add Error Message and Status Code
      formAction.value.formErrorMessage = error.message
      formAction.value.formStatus = error.status
    } else if (data) {
      // Add Success Message
      formAction.value.formSuccessMessage = 'Successfully Registered Account.'

    
      router.replace('/dashboard')
      
    }
  } catch (err) {
    formAction.value.formErrorMessage = 'An unexpected error occurred.'
    console.error(err)
  } finally {
    // Reset Form
    refVForm.value?.reset()
    // Turn off processing
    formAction.value.formProcess = false
  }
}

// Trigger Validators
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
    <!-- First Name and Last Name -->
    <v-row>
      <v-text-field 
        v-model="formData.firstname"
        prepend-icon="mdi-account"
        label="First Name"
        variant="outlined"
        class="v-col-6"
        :rules="[requiredValidator]"
      ></v-text-field>

      <v-text-field
        v-model="formData.lastname"
        label="Last Name"
        variant="outlined"
        class="v-col-6"
        :rules="[requiredValidator]"
      ></v-text-field>
    </v-row>

    <!-- Email -->
    <v-text-field
      v-model="formData.email"
      prepend-icon="mdi-email"
      label="Email"
      variant="outlined"
      :rules="[requiredValidator, emailValidator]"
    ></v-text-field>

    <!-- Password -->
    <v-text-field
      v-model="formData.password"
      prepend-icon="mdi-lock"
      label="Password"
      variant="outlined"
      :type="isPasswordVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordVisible ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append-inner="isPasswordVisible = !isPasswordVisible"
      :rules="[requiredValidator, passwordValidator]"
    ></v-text-field>

    <!-- Password Confirmation -->
    <v-text-field
      v-model="formData.password_confirmation"
      prepend-icon="mdi-lock-check"
      label="Password Confirmation"
      variant="outlined"
      :type="isPasswordConfirmVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordConfirmVisible ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append-inner="isPasswordConfirmVisible = !isPasswordConfirmVisible"
      class="my-2"
      :rules="[requiredValidator, confirmedValidator(formData.password, formData.password_confirmation)]"
    ></v-text-field>


    <!-- Register Button -->
    <v-btn
      class="mx-auto d-flex"
      color="indigo-darken-4"
      prepend-icon="mdi-account-plus"
      :disabled="formAction.formProcess"
      :loading="formAction.formProcess"
      type="submit"
    >
      Register
    </v-btn>
  </v-form>
</template>