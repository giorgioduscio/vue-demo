import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '../interfaces/api';
import { Toast } from '../tools/feedbackUI';
import { useUsersStore } from './usersStore';


export const useAuthStore = defineStore('auth', () => {
  const usersStore = useUsersStore();
  const TIMEOUT = 600 * 1000; // 10 minuti

  const loggedInUser = ref<User | null>(null);
  const localStorageKey = 'loggedUser';
  const isInitialized = ref(false); // Flag per tracciare l'inizializzazione

  // TIMER  
  const timer = {
    logoutLabel: ref<number | null>(null),
    start() {
      if (timer.logoutLabel.value) {
        clearTimeout(timer.logoutLabel.value);
      }
      const timerId = setTimeout(() => {
        logout();
      }, TIMEOUT);
      timer.logoutLabel.value = timerId;
    },
    stop() {
      if (timer.logoutLabel.value) {
        clearTimeout(timer.logoutLabel.value);
        timer.logoutLabel.value = null;
      }
    }
  };

  async function initializeAuth() {
    if (isInitialized.value) return; // Evita di inizializzare più volte

    const storedUser = localStorage.getItem(localStorageKey);
    let userId: number | null = null;
    let loginTimestamp: number | null = null;

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        userId = parsed.userId;
        loginTimestamp = parsed.loginTimestamp;
      } catch (e) {
        console.error("Errore nel parsing di localStorage per l'utente loggato:", e);
        localStorage.removeItem(localStorageKey); // Pulisci dati corrotti
      }
    }

    if (userId !== null && loginTimestamp !== null && new Date().getTime() < (loginTimestamp + TIMEOUT)) {
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
        logout(); // Utente non trovato, logout
      }
    } else if (userId !== null) { // Se c'era un ID ma la sessione è scaduta o corrotta
      logout();
    }
    isInitialized.value = true;
  }

  function logout() {
    timer.stop();
    loggedInUser.value = null;
    localStorage.removeItem(localStorageKey);
    Toast.danger('Logout eseguito.');
    location.reload();
    // isInitialized.value = false; // Reset per un'eventuale nuova inizializzazione
  }

  async function login(email: string, password: string): Promise<User | null> {
    if (usersStore.users.length === 0) {
      await usersStore.getUsers();
    }

    const userMatch = usersStore.users.find((u) => u.email === email && u.password === password);
    if (!userMatch) {
      console.error("Credenziali non trovate", email, password);
      loggedInUser.value = null;
      localStorage.removeItem(localStorageKey);
      timer.stop();
    } else {
      loggedInUser.value = userMatch;
      const loginTimestamp = new Date().getTime();
      localStorage.setItem(localStorageKey, JSON.stringify({ userId: userMatch.id, loginTimestamp }));
      timer.start();
    }

    return userMatch || null;
  }

  return {
    loggedInUser,
    isInitialized,
    initializeAuth,
    login,
    doLogout: logout,
  };
});
