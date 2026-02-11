<script setup lang="ts">
import { useAuthStore } from '../stores/AuthStore';
import { reactive, computed, watch, onMounted } from 'vue';
import type { FormField } from '../interfaces/private';
import { useRoute, useRouter } from 'vue-router';
import usersFormFields from './usersFormFields';
import type { User } from '../interfaces/api';
import { Toast } from '../tools/feedbackUI';
import { useUsersStore } from '../stores/usersStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

// 1. Determina la modalità corrente basandosi sul percorso
const isRegisterPage = computed(() => route.path === '/register');

// 2. Imposta dinamicamente titolo e link alternativo
const pageTitle = computed(() => isRegisterPage.value ? 'Registrazione' : 'Accesso');
const switch_text = computed(() => isRegisterPage.value ? 'Hai già un account?' : 'Non hai un account?');
const switch_path = computed(() => isRegisterPage.value ? '/access' : '/register');
const switch_linkName = computed(() => isRegisterPage.value ? 'Accedi' : 'Registrati');
const buttonText = computed(() => isRegisterPage.value ? 'Registrati' : 'Accedi');


const Form = reactive({
  value: [] as FormField[],
  submittedOnce: false,

  // 3. Il metodo reset si adatta in base alla pagina
  reset() {
    this.value = usersFormFields();
    if (!isRegisterPage.value) {
      this.value = this.value.filter(field => field.key === 'email' || field.key === 'password');
    }
    this.submittedOnce = false;
  },

  onchange(e: Event) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const fieldKey = target.name;
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

  async onsubmit(e: Event) {
    e.preventDefault();
    this.submittedOnce = true;
    if (!this.isvalid()) return Toast.danger('Form non valido');

    //  REGISTRAZIONE
    if (isRegisterPage.value) {
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

      let allFieldsValid = true;
      this.value.forEach((field) => {
        if (field.key in newUser) {
          (newUser as any)[field.key] = field.value;
        } else {
          allFieldsValid = false;
          console.error(`Campo ${field.key} non trovato`);
        }
      });

      if (!allFieldsValid) return console.error('Form non valido');

      usersStore.addUser(newUser).then(() => {
        router.push({ name: 'Users' }); // Reindirizza alla pagina degli utenti
        Toast.success("Registrazione effettuata con successo");
      });

    //  ACCESSO
    } else {
      const email = this.value.find((field) => field.key === 'email')?.value ||'';
      const password = this.value.find((field) => field.key === 'password')?.value ||'';

      authStore.login(email as string, password as string).then((res) => {
        if(!res) return Toast.danger("Nessun account corrispondente");
        Toast.success("Accesso effettuato con successo");
        router.push({ name: 'Users' }); // Reindirizza alla pagina degli utenti
      });
    }
  },

  isvalid(fieldKey?: string) {
    function validateField(field: FormField) {
      return !field.validation || field.validation(field.value);
    }
    if (!fieldKey) return this.value.every((field) => validateField(field));

    const fieldMatch = this.value.find((field) => field.key === fieldKey);
    if (!fieldMatch) {
      console.error(`Field ${fieldKey} not found`);
      return false;
    }
    return validateField(fieldMatch);
  },
});

// 4. Esegui il reset del form quando il percorso cambia o al primo caricamento
watch(
  () => route.path,
  () => { Form.reset() },
  { immediate: true }
);
onMounted(() => {
  document.title = pageTitle.value;
  Form.reset();
});
</script>

<template>
  <article class="container mt-2 p-3">
    <form class="text-white mx-auto max-w-400px"
          @submit="Form.onsubmit($event)"
          aria-labelledby="form-title">
      <h2 id="form-title" class="my-3 d-flex justify-content-between">
        <span>{{ pageTitle }}</span>
      </h2>
      <!-- ALERT -->
      <div class="alert alert-info alert-dismissible fade show" role="alert">
        I campi contrassegnati con <b class="text-danger">*</b> sono obbligatori
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>

      <div class="d-flex flex-wrap gap-2 align-items-start">
        <div v-for="field in Form.value" style="flex: 1 0 190px">
          <label :for="field.key" class="mb-2">
            <span>{{ field.label }}</span>
            <span v-if="field.asterisk" class="mx-1 text-danger" aria-hidden="true">*</span>
            <span v-if="field.asterisk" class="visually-hidden">(obbligatorio)</span>
          </label>

          <!-- SELECT -->
          <select v-if="field.type === 'select'"
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
          <textarea v-else-if="field.type === 'textarea'"
                    class="form-control w-100"
                    :class="{ 'is-invalid': Form.submittedOnce && !Form.isvalid(field.key) }"
                    :placeholder="field.placeholder || ''"
                    :id="field.key"
                    :name="field.key"
                    :value="field.value as string || ''"
                    @input="Form.onchange($event)">
          </textarea>

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

          <!-- MESSAGGIO DI ERRORE -->
          <small v-if="Form.submittedOnce && !Form.isvalid(field.key)"
                class="text-danger"
                role="alert"
                aria-live="assertive">
            {{ field.errorMessage || 'Campo non valido' }}
          </small>
        </div>
      </div>

      <p class="my-2">{{ switch_text }} <router-link :to="switch_path">{{ switch_linkName }}</router-link></p>

      <div class="d-flex gap-2 mt-3">
        <button :disabled="Form.submittedOnce && !Form.isvalid()"
                class="btn btn-primary"
                type="submit"
                :aria-label="buttonText">
          {{ buttonText }}
        </button>
      </div>
    </form>
  </article>
</template>

