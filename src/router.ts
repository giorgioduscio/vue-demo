import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { nextTick } from 'vue';
import UsersPage from './views/UsersPage.vue';
import AuthPage from './views/AuthPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/users',
    name: 'Users',
    component: UsersPage,
    meta: { title: 'Utenti' },
  },
  {
    path: '/register',
    name: 'Registrazione',
    component: AuthPage,
    meta: { title: 'Registrazione' },
  },
  {
    path: '/access',
    name: 'Accesso',
    component: AuthPage,
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

router.afterEach((to) => {
  nextTick(() => {
    document.title = (to.meta.title as string) || 'Vue Demo';
  });
});

export default router;