import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';
import type { User } from '../interfaces/api';
import { toast } from '../tools/feedbackUI';
import { useUsersStore } from './usersStore'; // Per ottenere i dati dell'utente completo


export const useAuthStore = defineStore('auth', () => {
  const usersStore = useUsersStore(); // Ottieni l'istanza di usersStore
  // const TIMEOUT = 30 * 1000; // 30 secondi
  const TIMEOUT = 600 * 1000; // 10 minuti

  // Carica l'utente dal local storage all'avvio dell'app
  onMounted(async () => {
    const storedUser = localStorage.getItem(localStorageKey);
    if (!storedUser) return logout();

    const { userId, loginTimestamp } = JSON.parse(storedUser);
    if (new Date().getTime() < (loginTimestamp + TIMEOUT)) {
      // Carica gli utenti se non sono già stati caricati per trovare l'utente completo
      if (usersStore.users.length === 0) {
        await usersStore.getUsers(); 
      }
      const user = usersStore.users.find(u => u.id === userId);
      if (user) {
        loggedInUser.value = user;
        const newLoginTimestamp = new Date().getTime();
        localStorage.setItem(localStorageKey, JSON.stringify({ userId: user.id, loginTimestamp: newLoginTimestamp }));
        timer.start();
      } else {
        logout(); 
      }
    }
  });
  
  // TIMER  
  const timer ={
    logoutLabel: ref<string | null>(null),
    // Inizia il timer di logout
    start() {
      if (timer.logoutLabel.value) {
        clearTimeout(parseInt(timer.logoutLabel.value, 10));
      }
      const timerId = setTimeout(() => {
        logout();
      }, TIMEOUT);
      timer.logoutLabel.value = timerId.toString();
    }
  }

  // Logout
  const loggedInUser = ref<User | null>(null);
  const localStorageKey = 'loggedUser';
  function logout() {
    loggedInUser.value = null;
    localStorage.removeItem(localStorageKey);
    if (timer.logoutLabel.value) {
      clearTimeout(parseInt(timer.logoutLabel.value, 10));
      timer.logoutLabel.value = null;
    }
    toast('Logout eseguito.', "danger");
  };

  // Funzione di login
  async function login(email: string, password: string) : Promise<User | null> {
    if (usersStore.users.length === 0) {
      await usersStore.getUsers(); 
    }
    
    const userMatch = usersStore.users.find((u) => u.email === email && u.password === password);
    if(!userMatch) {
      console.error("Credenziali non trovate", email, password, userMatch);
      loggedInUser.value = null;
      localStorage.removeItem(localStorageKey);
      if (timer.logoutLabel.value) {
        clearTimeout(parseInt(timer.logoutLabel.value, 10));
        timer.logoutLabel.value = null;
      }
      
    } else {
      loggedInUser.value = userMatch;
      const loginTimestamp = new Date().getTime();
      localStorage.setItem(localStorageKey, JSON.stringify({ userId: userMatch.id, loginTimestamp }));
      timer.start();
    }
    
    return userMatch || null;
  };
  
  return {
    loggedInUser,
    login,
    doLogout: logout,
  };
});
