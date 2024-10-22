
<template>
     <v-form fast-fail @submit.prevent>
     
     <v-row>
         <v-text-field
        prepend-icon="mdi-account" label="Firstname" variant="outlined" class="v-col-6"></v-text-field>
 
       <v-text-field
         label="Lastname" variant="outlined" class="v-col-6"></v-text-field>
     </v-row>
 
       <v-text-field
        prepend-icon="mdi-email" label="Email" variant="outlined" class="my-2"
       ></v-text-field>
 
       <v-text-field
        prepend-icon="mdi-lock" label="Password" variant="outlined" type="password"
       ></v-text-field>
 
       <v-text-field
        prepend-icon="mdi-lock-check" label="Password Confirmation" variant="outlined" type="password" class="my-2"
       ></v-text-field>
 
       <v-select
     class="pl-10" label="Select Role":items="['Borrower', 'Librarian']"
     variant="outlined" density="compact"></v-select>
 
       <v-btn class="mt-2 mx-auto d-flex" color="red-darken-4" prepend-icon="mdi-account-plus" type="submit">Register</v-btn>
     </v-form>
</template>