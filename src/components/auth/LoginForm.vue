
<script setup>
import { formActionDefault, supabase } from '@/utils/supabase';
import { requiredValidator, emailValidator } from '@/utils/validators'
import { ref } from 'vue'
import AlertNotification from '../common/AlertNotification.vue'



const formDataDefault = {
  email: '',
  password: '',
  role: '',
}

const formData = ref({
  ...formDataDefault,
})

const formAction = ref({
  ...formActionDefault,
})

const isPasswordVisible = ref(false)
const refVForm = ref()

const onSubmit = async () => {
  formAction.value = { ...formActionDefault }
  formAction.value.formProcess = true

  const { data, error } = await supabase.auth.signInWithPassword({
  email: formData.value.email,
  password: formData.value.password,
  role: formData.value.role,
})

if (error) {
    
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status
  } else if (data) {
   
    formAction.value.formSuccessMessage = 'Successfully Logged Account.'
  }

refVForm.value?.reset()
formAction.value.formProcess = false
}


const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid}) => {
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
      :append-inner-icon="isPasswordVisible ? 'mdi-eye' : 'mdi-eye-off'"
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