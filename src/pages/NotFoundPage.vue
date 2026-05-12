<script setup></script>

<template>
  <article class="container text-white min-vh-100 d-flex align-items-center justify-content-center">
    <div class="text-center">
      <h1 class="display-1 fw-bold">404</h1>
      <h2 class="mb-4">Pagina non trovata</h2>
      <p class="fs-4 mb-5 text-white-50">
        Spiacenti, la pagina che stai cercando non esiste o è stata spostata.
      </p>
      <router-link to="/" class="btn btn-primary btn-lg px-4">
        <i class="bi bi-house-door me-2"></i> Torna alla Home
      </router-link>
    </div>
  </article>
</template>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
</style>
