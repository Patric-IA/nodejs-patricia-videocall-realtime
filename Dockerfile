# Usa una imagen base de Node.js con glibc
FROM node:20-slim

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instala pnpm globalmente
RUN npm install -g pnpm@9.2.0

# Copia los archivos necesarios para instalar dependencias
COPY package.json pnpm-lock.yaml ./

# Instala las dependencias
RUN pnpm install --frozen-lockfile --strict-peer-dependencies=false

# Copia el resto del código fuente al contenedor
COPY . .

# Construye la aplicación
RUN pnpm build

# Expone el puerto de la aplicación
EXPOSE 3000

# Define el comando de inicio del contenedor
CMD ["node", "dist/agent.js", "dev"]
