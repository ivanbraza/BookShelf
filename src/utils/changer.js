// src/composables/useChangePassword.js
import { ref } from "vue";
import { supabase } from "@/utils/supabase";

export function useChangePassword() {
  const changePasswordDialog = ref(false);
  const isPasswordFormValid = ref(false);

  const passwordForm = ref({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const rules = {
    required: (v) => !!v || "This field is required",
    minLength: (v) =>
      (v && v.length >= 6) || "Password must be at least 6 characters",
    passwordMatch: (v) =>
      v === passwordForm.value.newPassword || "Passwords do not match",
  };

  const openChangePasswordModal = () => {
    changePasswordDialog.value = true;
  };

  const handleChangePassword = async () => {
    try {
      // Reauthenticate the user with the current password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user.email,
        password: passwordForm.value.currentPassword,
      });

      if (authError) {
        throw new Error("Incorrect current password.");
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.value.newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      alert("Password updated successfully.");
      changePasswordDialog.value = false;
      passwordForm.value = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
    } catch (err) {
      alert(err.message || "An error occurred.");
    }
  };

  return {
    changePasswordDialog,
    isPasswordFormValid,
    passwordForm,
    rules,
    openChangePasswordModal,
    handleChangePassword,
  };
}
