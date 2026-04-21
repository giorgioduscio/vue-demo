#!/bin/bash

# Lo script `gen` automatizza la creazione di componenti Vue e store Pinia in un progetto Vue.js.
#
# ---
# **Utilizzo**:
# - **Linux/macOS/Git Bash**:
#   Rendi eseguibile lo script con `chmod +x gen` e avvialo con:
#   `./gen [comp|store|test] [percorso/cartella]`
#
# ---
# **Funzionalità**:
# - **`comp`**: Genera un componente Vue vuoto nel percorso specificato (es. `src/pages/home`).
#   Crea un file `.vue` con template, script e stile predefiniti.
#
# - **`store`**: Genera uno store Pinia vuoto nel percorso specificato (es. `src/stores/home`).
#   Crea un file `.ts` con struttura base per state, getters e actions.
#
# - **`test`**: Genera un test Playwright nel percorso specificato (es. `src/tests/home`).
#
# ---
# **Note**:
# - Il nome del file generato segue il nome della cartella di destinazione (es. `Home.vue` o `useHomeStore.ts`).
# - Se la cartella non esiste, viene creata automaticamente.
# - I file esistenti richiedono conferma prima della sovrascrittura.

# Funzione per convertire in camelCase
to_camel_case() {
    echo "$1" | sed -E 's/[-_ ]+([a-zA-Z0-9])/\U\1/g' | sed -E 's/^([A-Z])/\L\1/'
}

# Funzione per convertire in PascalCase
to_pascal_case() {
    local camel=$(to_camel_case "$1")
    echo "${camel^}"
}

COMMAND=$1
TARGET_PATH=$2

if [[ -z "$COMMAND" || -z "$TARGET_PATH" ]]; then
    echo "Utilizzo: ./gen [comp|store|test] [percorso/del/file]"
    echo "Esempi:"
    echo "  ./gen comp home"
    echo "  ./gen store auth"
    echo "  ./gen test home"
    exit 1
fi

# Aggiusta il percorso in base al comando
if [[ "$COMMAND" == "comp" ]]; then
    [[ "$TARGET_PATH" != src/* ]] && TARGET_PATH="src/$TARGET_PATH"
    EXTENSION=".vue"
elif [[ "$COMMAND" == "store" ]]; then
    [[ "$TARGET_PATH" != src/* ]] && TARGET_PATH="src/$TARGET_PATH"
    EXTENSION=".ts"
elif [[ "$COMMAND" == "test" ]]; then
    [[ "$TARGET_PATH" != src/tests/* ]] && TARGET_PATH="src/tests/$TARGET_PATH"
    EXTENSION=".spec.js"
else
    echo "Comando \"$COMMAND\" non valido. Comandi disponibili: comp, store, test."
    exit 1
fi

DIR_PATH=$(dirname "$TARGET_PATH")
BASE_NAME=$(basename "$TARGET_PATH")
CAMEL_NAME=$(to_camel_case "$BASE_NAME")
PASCAL_NAME=$(to_pascal_case "$BASE_NAME")

if [[ "$COMMAND" == "comp" ]]; then
    FINAL_NAME="$CAMEL_NAME"
    CONTENT="<script setup lang=\"ts\">
// Importa dipendenze qui

// Definisci props
const props = defineProps({
  // Esempio: message: { type: String, required: true }
});

// Definisci emits
const emit = defineEmits([
  // Esempio: 'update'
]);

// Stato reattivo
const state = ref({
  // Esempio: count: 0
});

// Funzioni
const exampleFunction = () => {
  // Logica della funzione
};
</script>

<template>
  <div>
    <!-- Contenuto del componente $CAMEL_NAME -->
  </div>
</template>

<style scoped>
/* Stili specifici del componente $CAMEL_NAME */
</style>"
elif [[ "$COMMAND" == "store" ]]; then
    FINAL_NAME="use${PASCAL_NAME}Store"
    CONTENT="import { defineStore } from 'pinia';

export const use${PASCAL_NAME}Store = defineStore('${CAMEL_NAME,,}', {
  state: () => ({
    // Stato iniziale
    // Esempio: count: 0
  }),
  getters: {
    // Getters
    // Esempio: doubleCount: (state) => state.count * 2
  },
  actions: {
    // Azioni
    // Esempio: increment() { this.count++; }
  },
});"
elif [[ "$COMMAND" == "test" ]]; then
    FINAL_NAME="$CAMEL_NAME"
    CONTENT="import { test, expect } from '@playwright/test';

// Esegui il test con: npx playwright test src/tests/${CAMEL_NAME}.spec.js

test.describe('${PASCAL_NAME}', () => {
  test('should work as expected', async ({ page }) => {
    // Esempio: vai alla pagina
    await page.goto('/');
    // Aggiungi qui la logica del test
  });
});"
fi

FILE_PATH="${DIR_PATH}/${FINAL_NAME}${EXTENSION}"

# Verifica se il file esiste
if [[ -f "$FILE_PATH" ]]; then
    read -p "Il file \"$(basename "$FILE_PATH")\" esiste già. Sovrascriverlo? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Operazione annullata."
        exit 0
    fi
fi

# Crea la directory se non esiste
mkdir -p "$DIR_PATH"

# Scrivi il file
echo "$CONTENT" > "$FILE_PATH"
echo "File creato con successo: $FILE_PATH"
