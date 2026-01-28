<script setup lang="ts">
import type { User } from '../interfaces/api';
import { useUsersStore } from '../stores/usersStore';
import { onMounted, reactive, computed } from 'vue';
import { agree } from '../tools/feedbackUI';
import type { FormField } from '../interfaces/private';

onMounted(async () => {
  await usersStore.getUsers();
  app.users = usersStore.users;
  document.title = app.title;
});

const usersStore = useUsersStore();
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
    // filtra app.users in base al filtro
    let filteredUsers = this.users;
    if (this.filter_value) {
      const filterLower = this.filter_value.toLowerCase();
      filteredUsers = filteredUsers.filter((user) =>
        user.username.toLowerCase().includes(filterLower) ||
        user.email.toLowerCase().includes(filterLower)
      );
    }

    // imposta gli utenti in base alla paginazione
    const startIndex = (this.pag_current - 1) * this.pag_limit;
    const endIndex = startIndex + this.pag_limit;
    let paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // ordina usersStore.users in base all'ordinamento
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

    // restituisce gli utenti filtrati, ordinati e paginati
    return paginatedUsers;
  },

  async handleDelete(user:User){
    if(!await agree(`Vuoi rimuovere l'utente "${user.username}"?`, "Rimuovi", "danger")) return;
    usersStore.deleteUser(user.id).then(() => {
      app.users = usersStore.users;
    });
  },

  handleEdit(user: User, key: string, event: Event) {
    const {value, tagName, type} = event.target as HTMLInputElement | HTMLSelectElement;
    const newValue =type === 'number' || tagName === 'SELECT' 
                    ? parseInt(value) : value;    
    const updatedUser = { ...user, [key]: newValue };

    if(updatedUser[key as keyof User] == user[key as keyof User])
      console.error(key, 'non risulta modificato');
    
    usersStore.updateUser(updatedUser).then(() => {
      app.users = usersStore.users;
    });
  },

  //  ORDINAMENTO
  sort_value: { username: "asc" } as { [key: string]: string | null },
  sort_set(key: string) {
    // se la chiave non esiste, resetta username e aggiungi key:"asc"
    if (!this.sort_value[key]) {
      this.sort_value = { [key]: "asc" };
    }
    // se la chiave esiste ed è =="asc", diventa "desc"
    else if (this.sort_value[key] === "asc") {
      this.sort_value[key] = "desc";
    }
    // se la chiave esiste ed è =="desc", diventa null
    else if (this.sort_value[key] === "desc") {
      this.sort_value[key] = null;
    }
  },

  //  FILTRO
  filter_value: "",
  filter_set(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.filter_value = newValue;
  },

  //  PAGINAZIONE
  pag_select_values: [5, 10, 20, 50, 100],
  pag_limit: 10,
  pag_select_set(event: Event) {
    const newValue = (event.target as HTMLSelectElement).value;
    this.pag_limit = parseInt(newValue);
    this.pag_current = 1; // Reset to first page when changing limit
  },
  pag_current: 1,
  pag_current_set(current: number) {
    this.pag_current = current;
  },
  pag_total() {
    // Calcola il numero totale di pagine in base agli utenti filtrati
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
    
    // Adjust if we're at the edges
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



const Form = reactive({
  isRendered: false,
  value: [] as FormField[],
  init(){
    this.value=[
      { type: 'text',
        key: 'username',
        label: 'Username',
        value: '', 
        placeholder: 'Es: mario88',
        asterisk:true,
        validation(value:string) {
          return value.trim().length > 0;
        },
        errorMessage:'Il campo username è obbligatorio'
      },
      { type: 'email',
        key: 'email',
        label: 'Email',
        value: '', 
        placeholder: 'Es: mario@gmail.com',
        asterisk:true,
        validation(value:string) {
          return value.trim().includes('@') && value.trim().includes('.');
        },
        errorMessage:'Il campo deve contenere un indirizzo email valido'
      },
      { type: 'password',
        key: 'password',
        label: 'Password',
        value: '', 
        placeholder: 'Es: Password123!',
        asterisk:true,
        validation(value:string) {
          const password = value.trim();
          return password.length >= 8 && password.length <= 16 // caratteri tra 8 e 16
                // && /[A-Z]/.test(password) // almeno una lettera maiuscola
                // && /[a-z]/.test(password) // almeno una lettera minuscola
                // && /[0-9]/.test(password) // almeno un numero
                // && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password); // almeno un simbolo speciale
        },
        errorMessage:'La password deve contenere tra 8 e 16 caratteri, includere lettere maiuscole e minuscole, numeri e simboli speciali'
      },
      { type: 'select',
        key: 'role',
        label: 'Ruolo',
        value: 2, 

        asterisk:true,
        validation(value:number) {
          return value >= 0 && value <= 2;
        },
        options:[
          { label: 'Admin', value: 0 },
          { label: 'User', value: 1 },
          { label: 'Guest', value: 2 },
        ],
        errorMessage:'Il ruolo deve essere compreso tra 0 e 2'
      },
      { type: 'textarea',
        key: 'suggestion',
        label: 'Suggerimento',
        value: '',
        placeholder: 'Es: Piatto preferito',
      }
    ];
  },
  reset(){
    this.init();
    this.submittedOnce = false;
    this.isRendered = false;
  },

  submittedOnce: false,
  onchange(e:Event){
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const fieldKey = target.name;
    
    // Gestione speciale per il campo role che è un numero
    const field = this.value.find(f => f.key === fieldKey);
    if (!field) return console.error(fieldKey, `non trovato`);
    
    let fieldValue;
    if (fieldKey === 'role') {
      fieldValue = parseInt(target.value);
    } else {
      fieldValue = target.value;
    }
    field.value = fieldValue;
  },
    
  onsubmit(e:Event){
    e.preventDefault();
    
    // Verifica se il form è valido
    this.submittedOnce = true;
    if (!this.isvalid()) return console.error('form non valido');
    
    // Crea un nuovo utente dai valori del form
    let allFieldsValid = true;
    const randomNumber = Math.round(Math.random() * 100000);
    let newUser: User = {
      id: randomNumber,
      email: '',
      username: '',
      password: '',
      imageUrl: '',
      role: 0,
      suggestion: '',
    };
    this.value.forEach((field) => { 
      // todo verifica che il nome del campo faccia parte dell'interfaccia
      if((field.key in newUser))  
        (newUser as any)[field.key] = field.value;
      else{ 
        allFieldsValid = false;
        console.error(`campo ${field.key} non trovato`);}
    });
    if(!allFieldsValid) return console.error('form non valido');
    

    // Aggiungi l'utente allo store
    usersStore.addUser(newUser).then(() => {
      app.users = usersStore.users;
      // Nascondi il form dopo l'invio
      this.reset();
    });
    
  },

  // controlla se un campo o il form è valido
  isvalid(fieldKey?:string){
    function validateField(field:FormField){
      return !field.validation || field.validation(field.value);
    }
    if(!fieldKey) return this.value.every((field) => validateField(field));

    const fieldMatch = this.value.find((field) => field.key === fieldKey);
    if(!fieldMatch){ 
      console.error(`Field ${fieldKey} not found`);
      return false;
    }
    return validateField(fieldMatch);
  },
});

// Inizializza il form
Form.init();

const filteredUsers = computed<User[]>(() => {
  return app.users_get();
});
</script>

<template> <article class="container">
  <!-- FORM -->
  <form class="mt-2 p-2 p-md-5 border rounded text-bg-dark" 
        v-if="Form.isRendered" 
        @submit="Form.onsubmit($event)" 
        aria-labelledby="form-title">
    <!-- TITOLO -->
    <h2 id="form-title" class="my-3 d-flex justify-content-between">
      <span>Inserisci utente</span>
      <button type="button" class="btn bi bi-x-lg" @click="Form.reset()" aria-label="Chiudi form"></button>
    </h2>
    <!-- MESSAGGIO -->
    <div class="alert alert-info" aria-live="polite">I campi contrassegnati con <b class="text-danger">*</b> sono obbligatori</div>
    
    <div class="row">
      <div v-for="field in Form.value" class="col-12 col-md-6 col-lg-4">
        <label :for="field.key" class="mb-2">
          <span>{{ field.label }}</span>
          <span v-if="field.asterisk" class="mx-1 text-danger" aria-hidden="true">*</span>
          <span v-if="field.asterisk" class="sr-only">(obbligatorio)</span>
        </label>

        <!-- SELECT -->
        <select v-if="field.type==='select'" 
                class="form-control w-100"
                :class="{ 'is-invalid': Form.submittedOnce && !Form.isvalid(field.key) }"
                :id="field.key"
                :name="field.key"
                :value="field.value"
                @change="Form.onchange($event)">
          <option v-for="option in field.options" 
                  :value="option.value"
                  :selected="option.value === field.value">
            {{ option.label }}
          </option>
        </select>
        <!-- TEXTAREA -->
        <textarea v-else-if="field.type==='textarea'" 
                  class="form-control w-100"
                  :class="{ 'is-invalid': Form.submittedOnce && !Form.isvalid(field.key) }"
                  :placeholder="field.placeholder || ''"
                  :id="field.key"
                  :name="field.key"
                  @input="Form.onchange($event)"
                  >{{ field.value }}</textarea>
        <!-- INPUT -->
        <input v-else
                class="form-control w-100"
                :class="{ 'is-invalid': Form.submittedOnce && !Form.isvalid(field.key) }"
                :type="field.type"
                :id="field.key"
                :name="field.key"
                :value="field.value"
                :placeholder="field.placeholder || ''"
                @input="Form.onchange($event)">

        <small v-if="Form.submittedOnce && !Form.isvalid(field.key)" 
              class="text-danger" 
              role="alert"
              aria-live="assertive"
              >{{ field.errorMessage || 'Campo non valido' }}</small>
      </div>
    </div>

    <div class="d-flex gap-2 mt-3">
      <button :disabled="Form.submittedOnce && !Form.isvalid()" 
              class="btn btn-primary" 
              type="submit" 
              aria-label="Aggiungi utente"
              >Aggiungi</button>
      <button @click="Form.reset()" 
              class="btn btn-dark" 
              type="button" 
              aria-label="Annulla e chiudi form"
              >Annulla</button>
    </div>
  </form>

  <!-- TABELLA -->
  <header v-if="!Form.isRendered">
    <h1 class="text-light my-2">{{ app.title }}</h1>
    <div class="m-2 d-flex gap-2 align-items-center justify-content-between">
      <div>
        <button @click="Form.isRendered = true" 
                class="btn btn-primary"
                aria-label="Aggiungi nuovo utente"
                >Aggiungi utente</button>
      </div>
  
      <div>
        <label for="filter" class="text-light mb-1"> 
          <i class="bi bi-search mx-1" aria-hidden="true"></i> 
          <span>Filtro utenti</span>
        </label>
        <input type="text" 
               id="filter"
               class="form-control"
               placeholder="Username o email"
               @input="app.filter_set($event)"
               aria-label="Cerca utenti per username o email">
      </div>
  
      <div class="d-flex gap-2 align-items-center">
        <label for="pag_select" class="sr-only">Righe per pagina</label>
        <select name="pag_select" id="pag_select"
                class="btn btn-dark text-start"
                @change="app.pag_select_set($event)"
                aria-label="Seleziona numero di righe per pagina">
          <option v-for="value in app.pag_select_values" 
                  :value="value"
                  :selected="value === app.pag_limit"
                  >{{ value }} righe</option>
        </select>

        <nav aria-label="Page navigation" class="mt-3">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: app.pag_current === 1 }">
              <button class="btn text-white" 
                      @click="app.pag_prev()" 
                      tabindex="-1" 
                      aria-label="Pagina precedente">
                <i class="bi bi-caret-left-fill" aria-hidden="true"></i>
              </button>
            </li>
            
            <li v-for="page in app.pag_get_range()" 
                class="page-item" 
                :class="{ active: app.pag_current === page }">
              <button class="btn text-secondary" 
                      @click="app.pag_current_set(page)" 
                      :class="{ 'text-white': app.pag_current === page }"
                      :aria-label="`Vai a pagina ${page}`"
                      >{{ page }}</button>
            </li>
            
            <li class="page-item" :class="{ disabled: app.pag_current === app.pag_total() }">
              <button class="btn text-white" 
                      @click="app.pag_next()" 
                      aria-label="Pagina successiva">
                <i class="bi bi-caret-right-fill" aria-hidden="true"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    
    </div>
  </header>

  
  <main v-if="!Form.isRendered">
    <div v-if="filteredUsers.length === 0" 
         class="alert alert-info"
         role="alert"
         aria-live="polite">
      Nessun utente disponibile.
    </div>
    
    <div v-else class="border rounded shadow">
      <div class="table-responsive">
        <table class="m-0 table table-dark table-striped table-hover">
          <thead>
            <tr>
              <th v-for="col in app.columns" scope="col"> 
                <button class="btn btn-dark d-flex justify-content-between w-100 min-w-100px"
                        @click="app.sort_set(col.key)"
                        :aria-label="`Ordina per ${col.label}. Attuale: ${app.sort_value[col.key] || 'nessuno'}`">
                  <span>{{ col.label }}</span>
                  <i v-if="app.sort_value[col.key] === 'asc'" 
                    class="bi bi-caret-down-fill" 
                    aria-hidden="true"></i>
                  <i v-if="app.sort_value[col.key] === 'desc'" 
                    class="bi bi-caret-up-fill" 
                    aria-hidden="true"></i>
                </button> 
              </th>
              <th class="py-3" scope="col">Azioni</th>
            </tr>
          </thead>
          
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td v-for="col in app.columns">
                <select v-if="col.key === 'role'"
                        :value="user[col.key as keyof User]"
                        @change="app.handleEdit(user, col.key, $event)"
                        class="form-control bg-dark"
                        :aria-label="`Ruolo di ${user.username}`">
                  <option value="0">Admin</option>
                  <option value="1">User</option>
                  <option value="2">Guest</option>
                </select>
                <input v-else
                       type="text"
                       :placeholder="'Aggiungi '+ col.label"
                       :value="user[col.key as keyof User]"
                       @change="app.handleEdit(user, col.key, $event)"
                       class="form-control bg-dark"
                       :aria-label="`${col.label} di ${user.username}`">
              </td>
              <td>
                <button @click="app.handleDelete(user)" 
                        class="btn btn-danger bi bi-trash"
                        :aria-label="`Elimina utente ${user.username}`"></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </main>
</article> </template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
