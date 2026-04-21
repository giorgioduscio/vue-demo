#!/bin/sh

# AVVIA TERMINALE DOCKER DEL PROGETTO
echo "[1/3] Avvio servizi in corso..."
docker compose up --detach

echo "[2/3] Entrata nel terminale (http://localhost:8080)"
docker compose exec vite-demo sh  # terminale realtime

echo "[3/3] Uscita rilevata. Spegnimento e pulizia..."
docker compose down
clear
