# Vue 3 Enterprise Demo

Questa è una Progressive Web Application (PWA) sviluppata come dimostrazione di architettura front-end professionale, focalizzata su scalabilità, performance e accessibilità (A11y).

## 🚀 Quick Start

### Con Docker (Consigliato)
Il progetto è containerizzato per garantire coerenza tra gli ambienti.
*   **Sviluppo:** `npm run docker:up` → [http://localhost:8080](http://localhost:8080)
*   **Produzione:** `npm run docker:prod:up` → [http://localhost:8081](http://localhost:8081)

### Locale
1. `npm install`
2. `npm run dev` → [http://localhost:8080](http://localhost:8080)

## 🛠 Tech Stack & Architecture
*   **Core:** Vue 3 (Composition API) + TypeScript
*   **State Management:** Pinia (Store modulari con persistenza e logica di mapping)
*   **Styling:** Bootstrap 5 + Custom CSS (Mobile First)
*   **Infrastruttura:** Vite, Docker, Docker Compose

## 🏗️ Caratteristiche Enterprise (Best Practices)
*   **Gestione Ambienti:** Architettura multi-ambiente con file `.env` differenziati per Development e Production.
*   **Dockerization:** Configurazione Docker avanzata con iniezione di variabili d'ambiente in fase di build e runtime.
*   **Performance:** Ottimizzazione del bundle tramite Vite e gestione efficiente dello stato con Pinia.
*   **Robustness:** Sistema di mapping dei dati API (Firebase) e gestione centralizzata degli errori negli store.
*   **Accessibilità (A11y):** Implementazione di standard ARIA, contrasti elevati e navigabilità da tastiera.

## 📋 Comandi Docker
*   `npm run docker:build`: Ricostruisce le immagini (necessario dopo modifiche ai file .env).
*   `npm run docker:logs`: Visualizza i log in tempo reale.
*   `npm run docker:down` / `npm run docker:prod:down`: Arresta i servizi.

---
*Sviluppato con enfasi su manutenibilità e clean code.*
