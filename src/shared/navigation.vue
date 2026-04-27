<script setup>
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import Profile from './profile.vue'; // Importa il componente profilo

const route = useRoute();

const navItems = [
  { path: '/users', name: 'Utenti' },
  { path: '/register', name: 'Registrazione' },
  { path: '/access', name: 'Accesso' }
];

const isActive = (path) => {
  return computed(() => route.path === path);
};
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary shadow-sm" role="navigation" aria-label="Navigazione principale">
    <div class="container-fluid">
      <RouterLink class="navbar-brand d-flex align-items-center gap-2" to="/" aria-label="Vai alla home di Vue-demo">
        <img src="../assets/vue.svg" alt="Vue-demo" style="height: 30px; width: auto;">
        <span class="fw-bold tracking-tight">Vue-demo</span>
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Espandi menu di navigazione">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0" role="list">
          <li class="nav-item" v-for="item in navItems" :key="item.path">
            <RouterLink class="nav-link" :class="{ 'active': isActive(item.path).value }" :to="item.path">{{ item.name }}</RouterLink>
          </li>
        </ul>
        
        <!-- Integrazione del componente Profilo -->
        <div class="d-flex align-items-center">
          <Profile />
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar-brand {
  font-size: 1.25rem;
  letter-spacing: -0.025em;
}

.nav-link {
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--bs-primary) !important;
}

.nav-link.active {
  color: #fff !important;
  border-bottom: 2px solid var(--bs-primary);
}
</style>
