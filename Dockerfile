# Usa una imagen base oficial de Node.js
FROM node:20-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instala pnpm globalmente
RUN npm install -g pnpm@9.2.0

# Copia los archivos necesarios para instalar dependencias
COPY package.json pnpm-lock.yaml ./

# Instala las dependencias (sin generar un node_modules global)
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

# Define las 
CMD ["node", "dist/agent.js", "dev"]
