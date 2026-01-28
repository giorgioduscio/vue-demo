import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import UsersPage from './views/UsersPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/users',
    name: 'Users',
    component: UsersPage,
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

export default router;