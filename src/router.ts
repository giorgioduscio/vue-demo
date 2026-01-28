import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomePage from './views/HomePage.vue';
import AboutPage from './views/AboutPage.vue';
import ContactPage from './views/ContactPage.vue';
import UsersPage from './views/UsersPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage,
  },
  {
    path: '/contact',
    name: 'Contact',
    component: ContactPage,
  },
  {
    path: '/users',
    name: 'Users',
    component: UsersPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;