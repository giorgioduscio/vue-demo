import type { NavigationGuard } from 'vue-router';
import { useAuthStore } from '../stores/AuthStore';

export const authGuard: NavigationGuard = (to, _from, next) => {
  const authStore = useAuthStore();
  const authMeta = to.meta.auth as { roles: { [key: number]: string[] } } | undefined;

  // Se non è definito alcun meta di autorizzazione per la rotta, consentire l'accesso
  if (authMeta === undefined) {
    return next();
  }

  // Se è definito un meta di autorizzazione ma nessun utente è loggato, blocca l'accesso senza reindirizzare
  if (!authStore.loggedInUser) {
    return next({ path: '/access' });
  }

  // Controlla se il ruolo dell'utente loggato è definito nei ruoli autorizzati della rotta
  const userRole = authStore.loggedInUser.role;
  const authorizedRoles = authMeta.roles;

  if (authorizedRoles.hasOwnProperty(userRole)) {
    // Il ruolo dell'utente è trovato nei ruoli autorizzati, consentire l'accesso
    return next();
  } else {
    // Il ruolo dell'utente non è autorizzato per questa rotta, reindirizzare alla pagina di accesso
    return next({ path: '/access' });
  }
};
