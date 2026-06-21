# Pizagram 🍕 - Sistema de Delivery Estilo Instagram

O **Pizagram** é um sistema de delivery inovador que simula a interface do Instagram para a venda direta de alimentos (pizzarias, hamburguerias, docerias, etc.). O cliente navega pelos posts do feed (produtos), adiciona itens na sacola e finaliza o pedido diretamente através de um fluxo intuitivo de Mensagem Direta (DM).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* **Node.js** instalado na máquina (versão 18 ou superior recomendada).

### Passo a Passo
1. Abra a pasta do projeto no seu terminal.
2. Instale as dependências executando:
   ```bash
   npm install
   ```
3. Renomeie o arquivo `.env.example` para `.env` (ou crie um arquivo `.env` na raiz) e configure as chaves caso necessário.
4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acesse o sistema no seu navegador no endereço: **`http://localhost:3000`**

---

## 💬 Integração com o WhatsApp

O sistema possui disparo automático de avisos (Preparo, Saída para Entrega com rastreamento GPS e Recibos Pix/Cartão) por WhatsApp.

1. Acesse o **Painel Administrativo** no endereço `http://localhost:3000` clicando no botão **Admin** no menu inferior.
2. Faça login com o usuário padrão (se configurado como admin).
3. Vá na aba **Configurações ⚙️**.
4. No card **Conectividade do WhatsApp Automático**, aponte a câmera do seu WhatsApp (Aparelhos Conectados > Conectar um Aparelho) para o QR Code exibido na tela.
5. Quando conectar, o indicador ficará verde (`🟢 Serviço Ativo & Conectado`).

---

## ☁️ Hospedagem na Nuvem (Render / Railway / VPS)

Como o sistema utiliza a biblioteca `whatsapp-web.js` (que roda um navegador Puppeteer interno em segundo plano), a hospedagem precisa de algumas configurações específicas:

1. **Variáveis de Ambiente (`.env`)**:
   * Configure a variável `APP_URL` com a URL final do seu site hospedado (ex: `https://minhapizzaria.up.railway.app`).
2. **Dependências do Puppeteer (Linux/Cloud)**:
   * Se for hospedar no **Render** ou **Railway**, adicione o buildpack ou pacote do Google Chrome/Puppeteer no ambiente para evitar erros de inicialização do navegador virtual.
   * Nas configurações do projeto (por exemplo no Railway), inclua a variável de ambiente:
     `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
     E instale o buildpack do Chrome/Chromium.

---

## 📦 Instruções para o Vendedor (Como Limpar e Colocar no Drive)

**IMPORTANTE**: Antes de compactar (zipar) a pasta e enviá-la ao Google Drive para vender aos seus clientes, você **deve** limpar os seus dados de teste e credenciais pessoais para evitar que seus compradores acessem seu WhatsApp ou Mercado Pago.

Siga estes passos simples de higienização da pasta:

1. **Pare o servidor** no seu terminal (Ctrl + C).
2. **Exclua a pasta `.wwebjs_auth`**:
   * Esta pasta contém a sua sessão ativa do WhatsApp. Excluí-la garante que o comprador inicie com um painel limpo para parear o próprio celular.
3. **Exclua a pasta `node_modules`**:
   * Esta pasta é extremamente pesada e pode ser recriada facilmente pelo comprador rodando `npm install`. Removê-la torna o download do Drive muito mais rápido (de centenas de MBs para poucos KBs).
4. **Exclua os arquivos de Banco de Dados local**:
   * Exclua os arquivos `data-db.sqlite`, `data-db.sqlite-wal` e `data-db.sqlite-shm`.
   * **Nota**: Não se preocupe, o backend foi projetado para recriar e inicializar um banco de dados limpo e zerado automaticamente na primeira execução do cliente!
5. **Compacte a pasta**:
   * Comprima a pasta em um arquivo `.zip` ou `.rar` e faça o upload no seu Google Drive. Pronto para venda!
