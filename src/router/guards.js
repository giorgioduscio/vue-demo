import { useAuthStore } from '../stores/AuthStore';

export const authGuard = (to, _from, next) => {
  const authStore = useAuthStore();
  const authMeta = to.meta.auth;

  // Se la rotta richiede autenticazione (es. la pagina Utenti)
  if (authMeta) {
    if (!authStore.loggedInUser) {
      // Prova a recuperare dal localStorage se non è presente nello store
      const storedUser = localStorage.getItem('loggedUser');
      if (!storedUser) {
        // REGOLA RICHIESTA: Se l'utente non è loggato, rimandalo alla Registrazione
        return next({ name: 'Registrazione' });
      }
      
      // Se c'è nel localStorage ma non nello store, l'inizializzazione 
      // dovrebbe averlo già caricato, ma per sicurezza controlliamo.
      const loggedUser = JSON.parse(storedUser);
      if (!loggedUser) {
        // Fallback alla Registrazione se i dati sono corrotti o mancanti
        return next({ name: 'Registrazione' });
      }
    }

    // Controllo dei ruoli per le rotte protette
    // Recuperiamo il ruolo dell'utente (dallo store o dal localStorage)
    const userRole = authStore.loggedInUser ? authStore.loggedInUser.role : JSON.parse(localStorage.getItem('loggedUser')).role;
    
    // Se il ruolo dell'utente non è contemplato nei ruoli autorizzati per la rotta
    if (authMeta.roles && authMeta.roles[userRole] === undefined) {
      // REGOLA RICHIESTA: Se non autorizzato, rimandiamo alla Registrazione
      return next({ name: 'Registrazione' }); 
    }
  }

  // Se non ci sono blocchi o la rotta non richiede auth, procediamo
  next();
};
