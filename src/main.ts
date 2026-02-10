import { createApp } from 'vue'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/AuthStore' // Importa AuthStore

async function initializeApp() { // Avvolgi in una funzione async
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  
  // Inizializza AuthStore prima di usare il router
  const authStore = useAuthStore();
  await authStore.initializeAuth(); 

  app.use(router);
  app.mount('#app');
}

initializeApp(); // Chiama la funzione di inizializzazione
