# Usa Node.js 20 o 22
FROM node:20-alpine

WORKDIR /app

# Copia solo package.json e package-lock.json
COPY package*.json ./

# Installa dipendenze
RUN npm install

# Copia il resto del progetto
COPY . .

# Espone la porta (opzionale, ma utile per documentazione)
EXPOSE 8080

# Avvia il server Vite
CMD ["npm", "run", "dev"]
