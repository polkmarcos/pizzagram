FROM node:20-slim

# Instala dependências do sistema para o Puppeteer, WhatsApp Web JS e compilação de módulos nativos (node-gyp)
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libxtst6 \
    curl \
    python3 \
    make \
    g++ \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Instala o navegador Google Chrome estável
RUN curl -LO https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && apt-get update \
    && apt-get install -y ./google-chrome-stable_current_amd64.deb \
    && rm google-chrome-stable_current_amd64.deb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia arquivos de dependência e instala
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copia o código fonte e gera o build de produção (Vite + Server compiling)
COPY . .
RUN npm run build

# Expõe a porta padrão do servidor
EXPOSE 3000

# Define variáveis de ambiente padrão de produção
ENV NODE_ENV=production
ENV DATABASE_PATH=/data/data-db.sqlite

# Inicializa a aplicação
CMD ["npm", "start"]
