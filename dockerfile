# Usa Node.js 20 o 22
FROM node:20-alpine

WORKDIR /app

# Copia solo package.json e package-lock.json
COPY package*.json ./

# Installa dipendenze
RUN npm install

# Copia il resto del progetto
COPY . .

# Argomenti per le variabili d'ambiente (utili per il build di produzione)
ARG VITE_APP_API_URL
ENV VITE_APP_API_URL=$VITE_APP_API_URL

# Espone la porta
EXPOSE 8080

# Avvia il server Vite
CMD ["npm", "run", "dev"]
