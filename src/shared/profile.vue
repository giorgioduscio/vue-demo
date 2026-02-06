
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


<template>
  <div class="d-flex ms-auto">
    <!--UTENTE LOGGATO-->
    <div v-if="loggedInUser?.username" class="dropdown">
      <a class="btn btn-secondary dropdown-toggle rounded" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        {{ loggedInUser.username }}
      </a>
      <ul class="dropdown-menu" 
          aria-labelledby="navbarDropdown">
        <li>
          <a  class="dropdown-item text-danger" 
              href="#" 
              @click.prevent="handleLogout">
            <span class="bi bi-box-arrow-right me-1"></span>
            <span>Logout</span>
          </a>
        </li>
      </ul>
    </div>

    <!--NESSUN UTENTE LOGGATO-->
    <div v-else>
      <RouterLink to="/register" class="btn btn-outline-light me-2">Registrati</RouterLink>
      <RouterLink to="/access" class="btn btn-primary">Accedi</RouterLink>
    </div>
  </div>
</template>
