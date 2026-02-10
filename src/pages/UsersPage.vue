<script setup lang="ts">
import type { User } from '../interfaces/api';
import { useUsersStore } from '../stores/usersStore';
import { useAuthStore } from '../stores/AuthStore'; // Aggiunto
import { useRoute } from 'vue-router'; // Aggiunto
import { onMounted, reactive, computed } from 'vue';
import { agree, toast } from '../tools/feedbackUI';
import usersFormFields from './usersFormFields';

const usersStore = useUsersStore();
const authStore = useAuthStore(); 
const route = useRoute(); 

onMounted(async () => {
  await usersStore.getUsers();
  app.users = usersStore.users;
});

const app = reactive({
  title: "Utenti",

  columns: [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "role", label: "Ruolo" },
    { key: "suggestion", label: "Suggerimento" },
  ],

  getRole(role: number) {
    switch (role) {
      case 0:
        return "Admin";
      case 1:
        return "User";
      case 2:
        return "Guest";
      default:
        return "Unknown";
    }
  },

  users: [] as User[],

  users_get() {
    let filteredUsers = this.users;
    if (this.filter_value) {
      const filterLower = this.filter_value.toLowerCase();
      filteredUsers = filteredUsers.filter((user) =>
        user.username.toLowerCase().includes(filterLower) ||
        user.email.toLowerCase().includes(filterLower)
      );
    }

    const startIndex = (this.pag_current - 1) * this.pag_limit;
    const endIndex = startIndex + this.pag_limit;
    let paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    if (this.sort_value) {
      const sortKey = Object.keys(this.sort_value)[0];
      const sortDirection = this.sort_value[sortKey as keyof typeof this.sort_value];

      if (sortDirection) {
        paginatedUsers.sort((a, b) => {
          const valueA = a[sortKey as keyof User];
          const valueB = b[sortKey as keyof User];

          if (typeof valueA === "string" && typeof valueB === "string") {
            return sortDirection === "asc"
              ? valueA.localeCompare(valueB)
              : valueB.localeCompare(valueA);
          }

          if (typeof valueA === "number" && typeof valueB === "number") {
            return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
          }

          return 0;
        });
      }
    }

    return paginatedUsers;
  },

  async handleDelete(user: User) {
    if (!can.value('delete')) return; // Aggiunto controllo permessi
    if (!await agree(`Vuoi rimuovere l'utente "${user.username}"?`, "Rimuovi", "danger")) return;
    usersStore.deleteUser(user.id).then(() => {
      toast("Utente rimosso", "success");
      app.users = usersStore.users;
    });
  },

  handleEdit(user: User, key: string, event: Event) {
    if (!can.value('update')) return; // Aggiunto controllo permessi
    const { value, tagName, type } = event.target as HTMLInputElement | HTMLSelectElement;
    const newValue = type === 'number' || tagName === 'SELECT'
      ? parseInt(value)
      : value;

    //  validazione
    const validationMatch = usersFormFields().find(field => field.key === key);
    if(!validationMatch) return console.error(`campo ${key} non trovato`);
    
    const isValid = validationMatch.validation ? validationMatch.validation(newValue) : true;
    if (!isValid) return toast(`campo '${key}' non valido`, "danger");
    
    const updatedUser = { ...user, [key]: newValue };
    if (updatedUser[key as keyof User] == user[key as keyof User])
      console.error(key, 'non risulta modificato');
    
    // aggiorna l'utente
    usersStore.updateUser(updatedUser).then(() => {
      toast(`Campo '${key}' modificato`, "success");
      app.users = usersStore.users;
    });
  },

  // ORDINAMENTO
  sort_value: { username: "asc" } as { [key: string]: string | null },
  sort_set(key: string) {
    if (!this.sort_value[key]) {
      this.sort_value = { [key]: "asc" };
    } else if (this.sort_value[key] === "asc") {
      this.sort_value[key] = "desc";
    } else if (this.sort_value[key] === "desc") {
      this.sort_value[key] = null;
    }
  },

  // FILTRO
  filter_value: "",
  filter_set(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.filter_value = newValue;
  },

  // PAGINAZIONE
  pag_select_values: [5, 10, 20, 50, 100],
  pag_limit: 10,
  pag_select_set(event: Event) {
    const newValue = (event.target as HTMLSelectElement).value;
    this.pag_limit = parseInt(newValue);
    this.pag_current = 1;
  },
  pag_current: 1,
  pag_current_set(current: number) {
    this.pag_current = current;
  },
  pag_total() {
    let filteredUsers = this.users;
    if (this.filter_value) {
      const filterLower = this.filter_value.toLowerCase();
      filteredUsers = filteredUsers.filter((user) =>
        user.username.toLowerCase().includes(filterLower) ||
        user.email.toLowerCase().includes(filterLower)
      );
    }
    return Math.ceil(filteredUsers.length / this.pag_limit);
  },
  pag_prev() {
    if (this.pag_current > 1) {
      this.pag_current_set(this.pag_current - 1);
    }
  },
  pag_next() {
    const totalPages = this.pag_total();
    if (this.pag_current < totalPages) {
      this.pag_current_set(this.pag_current + 1);
    }
  },
  pag_get_range() {
    const totalPages = this.pag_total();
    const current = this.pag_current;
    let start = Math.max(1, current - 2);
    let end = Math.min(totalPages, current + 2);

    if (end - start < 4) {
      if (current <= 3) {
        end = Math.min(totalPages, 5);
      } else {
        start = Math.max(1, totalPages - 4);
      }
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  },
});

const filteredUsers = computed<User[]>(() => {
  return app.users_get();
});

// Proprietà calcolata per verificare i permessi
const can = computed(() => (permission: string) => {
  const authMeta = route.meta.auth as { roles: { [key: number]: string[] } } | undefined;
  if (!authMeta || !authStore.loggedInUser) {
    return false;
  }
  const userRole = authStore.loggedInUser.role;
  const permissionsForRole = authMeta.roles[userRole];
  return permissionsForRole && permissionsForRole.includes(permission);
});
</script>

<template>
  <main class="container" role="main" v-if="can('read')">
    <!-- Header con titolo e pulsante -->
    <header>
      <div class="my-3 d-grid cols-1fr-auto align-items-center">
        <h1 class="text-light" id="page-title">{{ app.title }}</h1>
        <div class="col-auto">
          <router-link
            :to="{ name: 'Registrazione' }"
            class="btn btn-primary d-flex gap-2"
            aria-label="Aggiungi un nuovo utente alla lista"
            title="Aggiungi utente"
            :disabled="!can('create')"
          >
            <i class="bi bi-plus-lg" aria-hidden="true"></i>
            <span class="d-none d-md-inline">Aggiungi utente</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Sezione controlli: filtro e paginazione -->
    <section
      aria-labelledby="controls-heading"
      class="my-3 d-flex flex-wrap gap-2 justify-content-between"
      role="region"
    >
      <h2 id="controls-heading" class="visually-hidden">Controlli utenti</h2>

      <!-- Filtro utenti -->
      <div data-filter role="search">
        <label for="filter" class="text-light mb-1">
          <i class="bi bi-search mx-1" aria-hidden="true"></i>
          <span>Filtro utenti</span>
        </label>
        <input
          type="search"
          id="filter"
          class="form-control max-w-300px"
          placeholder="Username o email"
          @input="app.filter_set($event)"
          aria-label="Cerca utenti per username o email"
          aria-describedby="filter-help"
        >
        <div id="filter-help" class="visually-hidden">
          Inserisci il nome utente o l'email per filtrare la lista.
        </div>
      </div>

      <!-- Paginazione -->
      <div data-pagination>
        <div class="d-flex gap-2 align-items-center">
          <label for="pag_select" class="visually-hidden">Seleziona righe per pagina</label>
          <select
            name="pag_select"
            id="pag_select"
            class="btn btn-dark text-start"
            @change="app.pag_select_set($event)"
            aria-label="Seleziona il numero di righe per pagina"
          >
            <option
              v-for="value in app.pag_select_values"
              :key="value"
              :value="value"
              :selected="value === app.pag_limit"
            >
              {{ value }} righe
            </option>
          </select>

          <nav aria-label="Navigazione pagine utenti" role="navigation">
            <ul class="pagination justify-content-center" role="list">
              <li
                class="page-item"
                :class="{ disabled: app.pag_current === 1 }"
                role="presentation"
              >
                <button
                  class="btn text-white"
                  @click="app.pag_prev()"
                  aria-label="Vai alla pagina precedente"
                  :aria-disabled="app.pag_current === 1"
                >
                  <i class="bi bi-caret-left-fill" aria-hidden="true"></i>
                </button>
              </li>

              <li
                v-for="page in app.pag_get_range()"
                :key="page"
                class="page-item"
                :class="{ active: app.pag_current === page }"
                role="presentation"
              >
                <button
                  class="btn text-secondary"
                  @click="app.pag_current_set(page)"
                  :class="{ 'text-white': app.pag_current === page }"
                  :aria-label="`Vai alla pagina ${page}`"
                  :aria-current="app.pag_current === page ? 'page' : undefined"
                >
                  {{ page }}
                </button>
              </li>

              <li
                class="page-item"
                :class="{ disabled: app.pag_current === app.pag_total() }"
                role="presentation"
              >
                <button
                  class="btn text-white"
                  @click="app.pag_next()"
                  aria-label="Vai alla pagina successiva"
                  :aria-disabled="app.pag_current === app.pag_total()"
                >
                  <i class="bi bi-caret-right-fill" aria-hidden="true"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>

    <!-- Sezione tabella utenti -->
    <section
      aria-labelledby="users-table-heading"
      role="region"
      aria-live="polite"
      data-table
    >
      <h2 id="users-table-heading" class="visually-hidden">Tabella utenti</h2>

      <div
        v-if="filteredUsers.length === 0"
        class="alert alert-info"
        role="alert"
        aria-live="assertive"
      >
        <p>Nessun utente disponibile.</p>
        <p class="visually-hidden">La lista utenti è vuota. Prova a modificare i filtri o aggiungi un nuovo utente.</p>
      </div>

      <div v-else class="border rounded shadow">
        <div class="table-responsive">
          <table
            class="m-0 table table-dark table-striped table-hover"
            aria-describedby="users-table-heading"
          >
            <thead>
              <tr role="row">
                <th
                  v-for="col in app.columns"
                  :key="col.key"
                  scope="col"
                  role="columnheader"
                >
                  <button
                    class="btn btn-dark d-flex justify-content-between w-100 min-w-100px"
                    @click="app.sort_set(col.key)"
                    :aria-label="`Ordina per ${col.label}. Ordine attuale: ${app.sort_value[col.key] || 'nessuno'}`"
                  >
                    <span>{{ col.label }}</span>
                    <i
                      v-if="app.sort_value[col.key] === 'asc'"
                      class="bi bi-caret-down-fill"
                      aria-hidden="true"
                    ></i>
                    <i
                      v-if="app.sort_value[col.key] === 'desc'"
                      class="bi bi-caret-up-fill"
                      aria-hidden="true"
                    ></i>
                  </button>
                </th>
                <th class="py-3" scope="col" role="columnheader">Azioni</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id" role="row">
                <td
                  v-for="col in app.columns"
                  :key="col.key"
                  role="cell"
                  :aria-label="`${col.label} di ${user.username}`"
                >
                  <select
                    v-if="col.key === 'role'"
                    :value="user[col.key as keyof User]"
                    @change="app.handleEdit(user, col.key, $event)"
                    class="form-control bg-dark"
                    :aria-label="`Ruolo di ${user.username}, valore attuale: ${user[col.key as keyof User]}`"
                    :disabled="!can('update')"
                  >
                    <option value="0">Admin</option>
                    <option value="1">User</option>
                    <option value="2">Guest</option>
                  </select>
                  <input
                    v-else
                    type="text"
                    :placeholder="'Aggiungi ' + col.label"
                    :value="user[col.key as keyof User]"
                    @change="app.handleEdit(user, col.key, $event)"
                    class="form-control bg-dark"
                    :aria-label="`${col.label} di ${user.username}, valore attuale: ${user[col.key as keyof User]}`"
                    :disabled="!can('update')"
                  >
                </td>
                <td role="cell">
                  <button
                    @click="app.handleDelete(user)"
                    class="btn btn-danger bi bi-trash"
                    :aria-label="`Elimina utente ${user.username}`"
                    title="Elimina utente"
                    :disabled="!can('delete')"
                  ></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>
</template>

