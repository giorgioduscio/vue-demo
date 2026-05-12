import { createRouter, createWebHistory } from 'vue-router';
import { nextTick } from 'vue';
import { authGuard } from './router/guards';
import { title } from 'valibot';

export const routes = [
  { name: 'Users',
    path: '/users',
    visible: true,
    component: () => import('./pages/UsersPage.vue'),
    meta: { 
      auth:{
        roles: {
          0: ['read', 'create', 'update', 'delete'], // Admin
          1: ['read', 'create'],                     // Editor
        }
      }
    },
  },
  { name: "Reactive",
    path: "/reactive",
    visible: true,
    component: ()=> import('./pages/ReactivePage.vue'),
  },

  // AUTENTICAZIONE E AUTORIZZAZIONE
  { name: 'Registrazione',
    path: '/register',
    component: () => import('./pages/AuthPage.vue'),
  },
  { name: 'Accesso',
    path: '/access',
    component: () => import('./pages/AuthPage.vue'),
  },
  
  // REDIRECT
  { path: '/',
    redirect: '/home',
  },
  { name: "Home",
    path: "/home",
    visible: true,
    component: ()=> import('./pages/HomePage.vue'),
  },
  { path: '/:pathMatch(.*)*', 
    redirect: '/not_found'
  },
  { name: 'Errore',
    path: '/not_found',
    component: () => import('./pages/NotFoundPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// GUARDS
router.beforeEach(authGuard);
router.afterEach((to) => {
  nextTick(() => {
    document.title = to.name || 'Vue Demo';
  });
});

export default router;