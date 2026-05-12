<script setup>
import { ref } from 'vue';

const features = ref([
  {
    icon: 'bi-people-fill',
    color: 'primary',
    title: 'Gestione Utenti',
    description: 'Visualizza, crea e modifica gli utenti del sistema con ruoli personalizzati.',
    path: '/users',
    buttonText: 'Vai agli Utenti'
  },
  {
    icon: 'bi-pencil-square',
    color: 'success',
    title: 'Pagina reattiva',
    description: 'Test di contatore, lista filtrabile e gestione elementi.',
    path: '/reactive',
    buttonText: 'Vai alla pagina'
  },
  {
    icon: 'bi-key-fill',
    color: 'info',
    title: 'Autenticazione',
    description: 'Registrati o accedi per utilizzare le funzionalità protette.',
    path: null,
    buttonText: null,
    buttons: [
      { text: 'Registrati', path: '/register', outline: true },
      { text: 'Accedi', path: '/access', outline: false }
    ]
  }
]);
</script>

<template>
  <article class="container text-white py-5">
    <section class="text-center mb-5">
      <h1 class="display-4 fw-bold mb-3">Benvenuto in Vue Demo</h1>
      <p class="fs-5 text-white-50">
        Esplora le funzionalità disponibili nel sito
      </p>
    </section>

    <section class="row g-4 justify-content-center">
      <div v-for="feature in features" :key="feature.title" class="col-md-5 col-lg-3">
        <div class="card bg-dark h-100" :class="`border-${feature.color}`">
          <div class="card-body text-center">
            <i :class="`bi ${feature.icon} text-${feature.color} fs-1 mb-3`"></i>
            <h3 class="card-title mb-3" :class="'text-'+feature.color">{{ feature.title }}</h3>
            <p class="card-text text-white-50 mb-4">
              {{ feature.description }}
            </p>
            
            <!-- Single button -->
            <router-link 
              v-if="feature.buttonText && feature.path"
              :to="feature.path" 
              class="btn" 
              :class="`btn-${feature.color}`"
            >
              {{ feature.buttonText }}
            </router-link>
            
            <!-- Multiple buttons -->
            <div v-if="feature.buttons" class="d-grid gap-2">
              <router-link 
                v-for="(btn, idx) in feature.buttons" 
                :key="idx"
                :to="btn.path" 
                class="btn" 
                :class="btn.outline ? `btn-outline-${feature.color}` : `btn-${feature.color}`"
              >
                {{ btn.text }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </article>
</template>
