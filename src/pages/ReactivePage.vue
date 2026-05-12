<script setup>
import { computed, onMounted, reactive, ref, watchEffect } from 'vue';

const contatore = ref(0);
function contatore_set(action ="reset") {
  switch (action) {
    case "increment":
      contatore.value += 1;
      break;

    case "decrement":
      contatore.value -= 1;
      break;
  
    case "reset":
    default:
      contatore.value =0
      break;
  }
}

const list_filtered =computed(()=> {
  const filter_value =list.filter.value.toLowerCase();
  return list.value.filter(el=> el.description.toLowerCase().includes(filter_value)) 
});
const list = {
    filter: ref(''),
    value: reactive([
      { id: 12, description: "Fagioli", amount: 20, complete: false },
      { id: 22, description: "Fragole", amount: 1, complete: true },
      { id: 42, description: "Cetrioli", amount: 1, complete: false },
    ]),
    add(newElement) {
      newElement['id'] = Math.floor(Math.random() * 9999);
      list.value.push(newElement);
      if (!list.value[list.value.length - 1].id) return console.error("Elemento non aggiunto");
    },
    delete(index = -1) {
      if (index < 0) return console.error("inserire valore valido");
      list.value.splice(index, 1);
      if (list.value[index]) return console.error("Elemento ancora esistente");
    },
};
</script>

<template>
  <article class="container py-4">
    <!-- Sezione Contatore -->
    <section class="mb-3 mx-auto max-w-500px border rounded overflow-hidden">
      <h2 class="p-3 border-bottom text-bg-primary fw-bold">
        <i class="bi bi-calculator"></i>
        Contatore
      </h2>
      <div class="bg-dark rounded-3 p-3 shadow-sm">
        <div class="d-flex align-items-center gap-2">
          <button
            @click="contatore_set('decrement')"
            class="btn btn-outline-light btn-sm px-3 py-2"
            aria-label="Decrementa"
          >
            <i class="bi bi-dash-lg"></i>
          </button>
          <span class="fs-4 fw-semibold text-white px-4 py-2 bg-secondary rounded-2">
            {{ contatore }}
          </span>
          <button
            @click="contatore_set('increment')"
            class="btn btn-outline-light btn-sm px-3 py-2"
            aria-label="Incrementa"
          >
            <i class="bi bi-plus-lg"></i>
          </button>
          <button
            @click="contatore_set('reset')"
            class="btn btn-outline-danger btn-sm px-3 py-2 ms-auto"
            aria-label="Resetta"
          >
            <i class="bi bi-arrow-clockwise"></i> Reset
          </button>
        </div>
      </div>
    </section>

    <!-- Sezione Oggetti -->
    <section class="mb-3 mx-auto max-w-1000px border rounded overflow-hidden">
      <div class="p-2 text-bg-secondary d-flex gap-2 align-items-center">
        <h2 class="text-light fw-bold">Oggetti</h2>
        <input
          v-model.trim.lazy="list.filter.value"
          placeholder="Cerca: Fagioli, Cetrioli, Fragole..."
          class="form-control bg-dark max-w-200px"
          type="search"
          aria-label="Filtra oggetti"
        >
      </div>

      <!-- Messaggio "Nessun elemento" -->
      <div v-if="list_filtered.length === 0" class="alert alert-info bg-dark text-white border-0">
        <i class="bi bi-info-circle me-2"></i> Nessun elemento trovato.
      </div>

      <!-- Lista elementi -->
      <div v-else v-for="(el, index) in list_filtered"
            :key="el.id"
            class="p-3 shadow border border-secondary">
        <div class="row">
          <!-- Pulsante Elimina -->
          <div class="col-3 col-md-auto">
            <button @click="() => list.delete(index)"
                    class="btn btn-outline-danger"
                    aria-label="Elimina">
              <i class="bi bi-trash"></i>
            </button>
          </div>

          <!-- input -->
          <div class="p-0 col-9 col-md d-flex flex-wrap gap-2">
            <!-- Checkbox Completato -->
            <div class="">
              <div class="form-check">
                <label :for="el.id + '-complete'" 
                        class="form-check-label text-white">
                        {{ el.complete ?'Fatto' :'In corso' }}</label>
                <input
                  v-model="el.complete"
                  type="checkbox"
                  :id="el.id + '-complete'"
                  :name="el.id + '-complete'"
                  class="form-check-input"
                >
              </div>
            </div>

            <!-- Descrizione -->
            <div class="">
              <label :for="el.id + '-description'" class="text-white">
                Descrizione | {{ el.description }}</label>
              <input
                v-model.trim="el.description"
                type="text"
                :id="el.id + '-description'"
                :name="el.id + '-description'"
                class="form-control form-control-dark bg-secondary border-0"
                placeholder="Descrizione..."
              >
            </div>

            <!-- Quantità -->
            <div class="">
              <label :for="el.id + '-amount'" class="text-white">
                Quantità | {{ el.amount }}</label>
              <input
                v-model.number="el.amount"
                type="number"
                :id="el.id + '-amount'"
                class="form-control form-control-dark bg-secondary border-0"
                placeholder="0"
                min="0"
              >
            </div>
          </div>
        </div>
      </div>
    </section>
  </article>
</template>

<!-- Stile aggiuntivo (opzionale, se non usi Bootstrap) -->
<style scoped>
/* Spaziatura verticale tra gli elementi */
.space-y-3 > * + * {
  margin-top: 1rem;
}

/* Ombra personalizzata per i card */
.shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.3);
}

/* Bordo personalizzato per gli input */
.form-control-dark {
  color: #fff;
  background-color: #212529;
  border-color: #495057;
}

.form-control-dark:focus {
  color: #fff;
  background-color: #2b3035;
  border-color: #6ea8fe;
  box-shadow: 0 0 0 0.25rem rgba(110, 168, 254, 0.25);
}
</style>