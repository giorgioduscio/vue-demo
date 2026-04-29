#!/bin/sh

# AVVIA TERMINALE DOCKER DEL PROGETTO
echo "[1/3] Avvio servizi in corso..."
docker compose up --detach --build

echo "[2/3] Entrata nel terminale (http://localhost:8080)"
docker compose exec vue-demo sh  # terminale realtime

echo "[3/3] Ferma container..."
docker compose stop
echo "
