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

const filteredUsers = computed(() => {
  return app.users_get();
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
</script>

<template> <article class="container">
  <!-- FORM -->
  <form class="shadow p-2 p-md-5 border rounded" 
        v-if="Form.isRendered" 
        @submit="Form.onsubmit($event)">
    <h2 class="d-flex justify-content-between">
      <span>Inserisci utente</span>
      <button class="btn bi bi-x-lg" @click="Form.reset()"></button>
    </h2>
    <div class="small">I campi contrassegnati con <b class="text-danger">*</b> sono obbligatori</div>
    
    <div class="d-flex flex-wrap gap-2">
      <div v-for="field in Form.value" class="min-w-200px max-w-300px" style="flex: auto;">
        <label :for="field.key">
          <span>{{ field.label }}</span>
          <span v-if="field.asterisk" class="mx-1 text-danger">*</span>
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
              class="text-danger">{{ field.errorMessage || 'Campo non valido' }}</small>
      </div>
    </div>

    <div class="d-flex gap-2 mt-3">
      <button :disabled="Form.submittedOnce && !Form.isvalid()" class="btn btn-primary" type="submit">Aggiungi</button>
      <button @click="Form.reset()" class="btn btn-secondary" type="button">Annulla</button>
    </div>
  </form>

  <!-- TABELLA -->
  <header v-if="!Form.isRendered">
    <h1>{{ app.title }}</h1>
    <div class="d-flex gap-2 align-items-center justify-content-between">
      <div>
        <button @click="Form.isRendered = true; Form.init()" 
                class="btn btn-primary"
                >Aggiungi utente</button>
      </div>
  
      <div>
        <label for="filter"> <i class="bi bi-search"></i> Utenti</label>
        <input type="text" 
               id="filter"
               class="form-control"
               placeholder="Username o email"
               @input="app.filter_set($event)">
      </div>
  
      <div class="d-flex gap-2 align-items-center">
        <select name="pag_select" id="pag_select"
                class="btn btn-light"
                @change="app.pag_select_set($event)">
          <option v-for="value in app.pag_select_values" 
                  :value="value"
                  :selected="value === app.pag_limit"
                  >{{ value }} righe</option>
        </select>

        <nav aria-label="Page navigation" class="mt-3">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: app.pag_current === 1 }">
              <button class="page-link" @click="app.pag_prev()" tabindex="-1">
                <i class="bi bi-caret-left-fill"></i>
              </button>
            </li>
            
            <li v-for="page in app.pag_get_range()" 
                class="page-item" 
                :class="{ active: app.pag_current === page }">
              <button class="page-link" @click="app.pag_current_set(page)">{{ page }}</button>
            </li>
            
            <li class="page-item" :class="{ disabled: app.pag_current === app.pag_total() }">
              <button class="page-link" @click="app.pag_next()">
                <i class="bi bi-caret-right-fill"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    
    </div>
  </header>

  
  <main v-if="!Form.isRendered">
    <div v-if="usersStore.users.length === 0" 
         class="alert alert-info">
      Nessun utente disponibile.
    </div>
    
    <div v-else class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th v-for="col in app.columns"> 
              <button class="btn btn-light w-100 position-relative text-start"
                      @click="app.sort_set(col.key)">
                <span>{{ col.label }}</span>
                <i v-if="app.sort_value[col.key] === 'asc'" 
                  class="bi bi-caret-down-fill position-absolute top-50 end-0 translate-middle"></i>
                <i v-if="app.sort_value[col.key] === 'desc'" 
                  class="bi bi-caret-up-fill position-absolute top-50 end-0 translate-middle"></i>
              </button> 
            </th>
            <th class="py-3">Azioni</th>
          </tr>
        </thead>
        
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td v-for="col in app.columns">
              <select v-if="col.key === 'role'"
                      :value="user[col.key as keyof User]"
                      @change="app.handleEdit(user, col.key, $event)"
                      class="form-control">
                <option value="0">Admin</option>
                <option value="1">User</option>
                <option value="2">Guest</option>
              </select>
              <input v-else
                     type="text"
                     :value="user[col.key as keyof User]"
                     @change="app.handleEdit(user, col.key, $event)"
                     class="form-control">
            </td>
            <td>
              <button @click="app.handleDelete(user)" 
                      class="btn btn-danger bi bi-trash"></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </main>
</article> </template>

