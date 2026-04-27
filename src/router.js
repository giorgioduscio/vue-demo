import { createRouter, createWebHistory } from 'vue-router';
import { nextTick } from 'vue';
import { authGuard } from './router/guards';

const routes = [
  {
    path: '/users',
    name: 'Users',
    component: () => import('./pages/UsersPage.vue'),
    meta: { 
      title: 'Utenti', 
      auth:{
        roles: {
          0: ['read', 'create', 'update', 'delete'], // Admin
          1: ['read', 'create'],                     // Editor
        }
      }
    },
  },
  {
    path: '/register',
    name: 'Registrazione',
    component: () => import('./pages/AuthPage.vue'),
    meta: { title: 'Registrazione' },
  },
  {
    path: '/access',
    name: 'Accesso',
    component: () => import('./pages/AuthPage.vue'),
    meta: { title: 'Accesso' },
  },
  {
    path: '/',
    redirect: '/users',
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
    document.title = to.meta.title || 'Vue Demo';
  });
});

export default router;