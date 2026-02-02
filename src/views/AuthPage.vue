<script setup lang="ts">
import { useUsersStore } from '../stores/usersStore';
import { reactive, computed, watch, onMounted } from 'vue';
import type { FormField } from '../interfaces/private';
import { useRoute, useRouter } from 'vue-router';
import usersFormFields from './usersFormFields';
import type { User } from '../interfaces/api';
import { toast } from '../tools/feedbackUI';

const route = useRoute();
const router = useRouter();
const usersStore = useUsersStore();

// 1. Determina la modalità corrente basandosi sul percorso
const isRegisterPage = computed(() => route.path === '/register');

// 2. Imposta dinamicamente titolo e link alternativo
const pageTitle = computed(() => isRegisterPage.value ? 'Registrazione' : 'Accesso');
const linkText = computed(() => isRegisterPage.value ? 'Hai già un account?' : 'Non hai un account?');
const linkTo = computed(() => isRegisterPage.value ? '/access' : '/register');
const linkToText = computed(() => isRegisterPage.value ? 'Accedi' : 'Registrati');
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
    if (!this.isvalid()) return toast('Form non valido', 'danger');

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
      });

    //  ACCESSO
    } else {
      const email = this.value.find((field) => field.key === 'email')?.value ||'';
      const password = this.value.find((field) => field.key === 'password')?.value ||'';

      usersStore.login(email as string, password as string).then((res) => {
        if(!res) return toast("Nessun account corrispondente", "danger");
        toast("Accesso effettuato con successo", "success");
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
  <article class="container">
    <form class="text-white"
          @submit="Form.onsubmit($event)"
          aria-labelledby="form-title">
      <h2 id="form-title" class="my-3 d-flex justify-content-between">
        <span>{{ pageTitle }}</span>
      </h2>
      <!-- MESSAGGIO -->
      <div class="alert alert-info" aria-live="polite">
        I campi contrassegnati con <b class="text-danger">*</b> sono obbligatori
      </div>

      <div class="row">
        <div v-for="field in Form.value" class="col-12 col-sm-6 col-md-4 col-lg-3 py-2">
          <label :for="field.key" class="mb-2">
            <span>{{ field.label }}</span>
            <span v-if="field.asterisk" class="mx-1 text-danger" aria-hidden="true">*</span>
            <span v-if="field.asterisk" class="sr-only">(obbligatorio)</span>
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

      <p>{{ linkText }} <router-link :to="linkTo">{{ linkToText }}</router-link></p>

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

