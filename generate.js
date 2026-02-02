#!/usr/bin/env node

/*
Lo script `generate.js` automatizza la creazione di componenti Vue e store Pinia in un progetto Vue.js.

---
**Utilizzo**:
- **Linux/macOS**:
  Rendi eseguibile lo script con `chmod +x generate.js` e avvialo con:
  `./generate.js [comp|store] [percorso/cartella]`

- **Windows**:
  Esegui lo script direttamente con Node.js:
  `node generate.js [comp|store] [percorso/cartella]`
  Oppure crea un file `generate.bat` con il contenuto `@echo off\nnode generate.js %*` e avvialo con:
  `generate [comp|store] [percorso/cartella]`

---
**Funzionalità**:
- **`comp`**: Genera un componente Vue vuoto nel percorso specificato (es. `src/pages/home`).
  Crea un file `.vue` con template, script e stile predefiniti.

- **`store`**: Genera uno store Pinia vuoto nel percorso specificato (es. `src/stores/home`).
  Crea un file `.js` con struttura base per state, getters e actions.

---
**Note**:
- Il nome del file generato segue il nome della cartella di destinazione (es. `Home.vue` o `useHomeStore.js`).
- Se la cartella non esiste, viene creata automaticamente.
- I file esistenti con lo stesso nome vengono sovrascritti senza avviso.
*/

import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';

// Oggetto che contiene i template per i vari comandi
const sheet = {
  comp: {
    text: `
<script setup>
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
    <!-- Contenuto del componente -->
  </div>
</template>

<style scoped>
/* Stili specifici del componente */
</style>
`,
    extension: '.vue',
    nameFormat: (fileName) => `${fileName}`,
  },
  store: {
    text: `import { defineStore } from 'pinia';

export const use{{storeName}}Store = defineStore('{{storeNameLowercase}}', {
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
});
`,
    extension: '.ts',
    nameFormat: (fileName) => `use${fileName}Store`,
  },
};

// Ottieni gli argomenti dalla riga di comando
const args = process.argv.slice(2);
const command = args[0]; // 'comp' o 'store'
const targetPath = args[1]; // Percorso della cartella di destinazione

// Funzione per generare il nome del file
const generateFileName = (basePath) => {
  const dirName = path.basename(basePath);
  // Sostituisci trattini e spazi con camelCase
  return dirName.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
};

// Funzione per creare la cartella se non esiste
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
};

// Funzione per chiedere conferma di sovrascrittura
const confirmOverwrite = (filePath) => {
  if (fs.existsSync(filePath)) {
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      readline.question(
        `Il file "${filePath}" esiste già. Sovrascriverlo? (s/n) `,
        (answer) => {
          readline.close();
          resolve(answer.toLowerCase() === 's');
        }
      );
    });
  }
  return Promise.resolve(true);
};

// Funzione per verificare se un percorso è valido
const isValidPath = (filePath) => {
  try {
    fs.accessSync(path.dirname(filePath), fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
};

// Funzione principale
const generateFile = async () => {
  if (!command || !targetPath) {
    console.error('Utilizzo: ./generate [comp|store] [percorso/del/file]');
    process.exit(1);
  }

  try {
    // Verifica se il comando esiste nell'oggetto sheet
    if (!sheet[command]) {
      console.error(`Comando "${command}" non valido. Comandi disponibili: ${Object.keys(sheet).join(', ')}.`);
      process.exit(1);
    }

    const fullPath = path.join(process.cwd(), targetPath);
    const dirPath = path.dirname(fullPath);
    const baseName = path.basename(fullPath);
    const fileName = generateFileName(baseName);

    // Recupera le informazioni dal comando specificato
    const { text, extension, nameFormat } = sheet[command];
    
    const storeNamePascal = fileName.charAt(0).toUpperCase() + fileName.slice(1);
    const finalFileName = nameFormat(command === 'store' ? storeNamePascal : fileName);
    const fileNameWithExtension = `${finalFileName}${extension}`;

    // Sostituisci il placeholder {{storeName}} se presente
    let fileContent = text;
    if (command === 'store') {
      fileContent = fileContent.replace(/{{storeName}}/g, storeNamePascal);
      fileContent = fileContent.replace(/{{storeNameLowercase}}/g, fileName);
    }

    const filePath = path.join(dirPath, fileNameWithExtension);

    // Verifica se il percorso è valido
    if (!isValidPath(filePath)) {
      console.error(`Impossibile scrivere nel percorso: ${filePath}`);
      process.exit(1);
    }

    // Chiedi conferma per la sovrascrittura
    const shouldOverwrite = await confirmOverwrite(filePath);
    if (!shouldOverwrite) {
      console.log('Operazione annullata.');
      process.exit(0);
    }

    // Crea la cartella se non esiste
    ensureDirectoryExistence(filePath);

    // Scrivi il file
    fs.writeFileSync(filePath, fileContent);
    console.log(`File creato con successo: ${filePath}`);
  } catch (err) {
    console.error('Errore durante la creazione del file:', err);
    process.exit(1);
  }
};

// Esegui la funzione principale
generateFile();
