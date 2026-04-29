# Usa Debian Slim invece di Alpine per compatibilità con Playwright
FROM node:20-slim

WORKDIR /app

# Installa le dipendenze di sistema necessarie per Playwright
# (Libnss3, libatk, libcups2, ecc. vengono gestite da playwright install-deps)
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Installa Chromium e le sue dipendenze specifiche di sistema
RUN npx playwright install --with-deps chromium

# Copia il resto del progetto
COPY . .

# Espone la porta di Vite
EXPOSE 8080

# Avvia Vite (npm install viene comunque eseguito all'avvio nel docker-compose)
CMD ["npm", "run", "dev"]
