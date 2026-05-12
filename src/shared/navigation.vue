<script setup>
import { useRoute, useRouter, RouterLink } from 'vue-router';
import Profile from './profile.vue';
import { routes } from '../router';

const route = useRoute();
const router = useRouter();
const navigate = (path) => router.push(path);
const navItems = routes  .filter(r => r.visible);
const isActive = (path) => route.path === path;
</script>

<template>
  <div class="pt-5"></div>
  <nav class="fixed-top navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary shadow-sm" role="navigation" aria-label="Navigazione principale">
    <div class="container">
      <!-- Brand -->
      <RouterLink class="navbar-brand d-flex align-items-center gap-2" to="/">
        <img src="../assets/vue.svg" alt="Vue-demo" style="height: 30px; width: auto;">
        <span class="fw-bold tracking-tight">Vue-demo</span>
      </RouterLink>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0" role="list">
          <li class="nav-item" v-for="item in navItems" :key="item.path">
            <RouterLink 
              class="nav-link shadow-none border-primary" 
              :class="{ 'text-primary border-bottom': isActive(item.path) }" 
              :to="item.path"
            >{{ item.name }}</RouterLink>
          </li>
        </ul>
        <div class="d-lg-flex align-items-center">
          <Profile />
        </div>
      </div>

      <!-- Mobile: pulsante toggle -->
      <button 
        class="navbar-toggler d-lg-none"
        type="button" 
        data-bs-toggle="offcanvas" 
        data-bs-target="#mobileNav"
        aria-controls="mobileNav"
        aria-label="Apri menu"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
    </div>
  </nav>

  <!-- Offcanvas per mobile -->
  <div 
    class="offcanvas offcanvas-end bg-dark text-white"
    tabindex="-1" 
    id="mobileNav"
    aria-labelledby="mobileNavLabel"
  >
    <div class="offcanvas-header border-bottom border-secondary">
      <h5 class="offcanvas-title" id="mobileNavLabel">Menu</h5>
      <button 
        type="button" 
        class="btn-close btn-close-white"
        data-bs-dismiss="offcanvas"
        aria-label="Chiudi"
      ></button>
    </div>
    <div class="offcanvas-body">
      <ul class="navbar-nav">
        <li class="nav-item" v-for="item in navItems" :key="item.path">
          <a 
            class="text-white border-0 d-block py-2" 
            :class="{ 'text-primary border-bottom': isActive(item.path) }" 
            :href="item.path" 
            data-bs-dismiss="offcanvas"
            @click.prevent="navigate(item.path)"
          >{{ item.name }}</a>
        </li>
      </ul>
      <div class="mt-3 pt-3 border-top border-secondary">
        <Profile />
      </div>
    </div>
  </div>
</template>
