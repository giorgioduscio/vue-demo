
<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores/AuthStore';
import { RouterLink } from 'vue-router';

const authStore = useAuthStore();

const loggedInUser = computed(() => {
  return authStore.loggedInUser;
});

const handleLogout = () => {
  authStore.doLogout();
};
</script>


<template lang="pug">
.d-flex.ms-auto
  //- UTENTE LOGGATO
  .dropdown(v-if="loggedInUser?.username")
    a#navbarDropdown.btn.btn-secondary.dropdown-toggle.rounded(
      href="#"
      role="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    ) {{ loggedInUser.username }}
    
    ul.dropdown-menu(aria-labelledby="navbarDropdown")
      li
        a.dropdown-item.text-danger(
          href="#"
          @click.prevent="handleLogout"
        )
          span.bi.bi-box-arrow-right.me-1
          span Logout

  //- NESSUN UTENTE LOGGATO
  div(v-else)
    RouterLink.btn.btn-outline-light.me-2(to="/register") Registrati
    RouterLink.btn.btn-primary(to="/access") Accedi
</template>
