<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { computed } from 'vue';
import router from '../router';
import Profile from './profile.vue';

const route = useRoute();

// Filter out redirect routes and get only routes with names
const navItems = computed(() => {
  return router.options.routes
    .filter(route => route.name && route.path !== '/')
    .map(route => ({
      path: route.path,
      name: route.name?.toString() || ''
    }));
});

const isActive = (path: string) => {
  return computed(() => route.path === path);
};
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">Vue Demo</RouterLink>
      
      <button class="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item" v-for="item in navItems" :key="item.path">
            <RouterLink class="nav-link" :class="{ 'active': isActive(item.path).value }" :to="item.path">{{ item.name }}</RouterLink>
          </li>
        </ul>
        <Profile />
      </div>

    </div>
  </nav>
</template>