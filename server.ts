import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";

// @ts-ignore
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
// @ts-ignore
import qrcode from "qrcode-terminal";

// Initialize WhatsApp Client for automated notifications
let whatsappReady = false;
let currentQrUrl = "";
const whatsappClient = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(process.cwd(), ".wwebjs_auth") }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--no-first-run",
      "--single-process"
    ]
  }
});

whatsappClient.on("qr", (qr: string) => {
  console.log("\n==================================================================");
  console.log("🔴 WHATSAPP AUTOMATION: LEIA O QR CODE ABAIXO PARA SE CONECTAR:");
  qrcode.generate(qr, { small: true });
  console.log("==================================================================\n");
  currentQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
});

whatsappClient.on("ready", () => {
  whatsappReady = true;
  currentQrUrl = "";
  console.log("🟢 WhatsApp automação conectada e pronta!");
});

whatsappClient.on("auth_failure", (msg: string) => {
  console.error("❌ WhatsApp falha de autenticação:", msg);
  currentQrUrl = "";
});

whatsappClient.on("disconnected", (reason) => {
  whatsappReady = false;
  currentQrUrl = "";
  console.log("❌ WhatsApp desconectado:", reason);
  whatsappClient.initialize().catch((err: any) => {
    console.error("❌ Erro ao reiniciar WhatsApp após desconexão:", err);
  });
});

whatsappClient.initialize().catch((err: any) => {
  console.error("❌ Erro ao inicializar o WhatsApp:", err);
});

async function sendWhatsAppMessage(toPhone: string, messageText: string) {
  try {
    if (!whatsappReady) {
      console.log("⚠️ Envio de WhatsApp ignorado: cliente não está pronto ou conectado.");
      return;
    }
    let cleanPhone = toPhone.replace(/\D/g, "");
    if (!cleanPhone) return;
    
    // In Brazil, WhatsApp numbers might require country code and DDD.
    if (!cleanPhone.startsWith("55") && cleanPhone.length >= 10) {
      cleanPhone = "55" + cleanPhone;
    }
    
    const chatId = `${cleanPhone}@c.us`;
    await whatsappClient.sendMessage(chatId, messageText);
    console.log(`✉️ Mensagem enviada via WhatsApp para ${cleanPhone}`);
  } catch (error) {
    console.error(`❌ Erro ao enviar WhatsApp para ${toPhone}:`, error);
  }
}

function getStatusMessage(niche: string, status: string, clientName: string, firstItemName: string) {
  const normalizedNiche = (niche || "pizzaria").toLowerCase();
  
  if (normalizedNiche === "pizzaria") {
    switch (status) {
      case "PREPARING":
        return `Olá, ${clientName}! Sua pizza *${firstItemName}* está sendo preparada com muito carinho e já vai entrar no forno! 🍕`;
      case "OUT_FOR_DELIVERY":
        return `Boa notícia, ${clientName}! Sua pizza *${firstItemName}* acabou de sair do forno e está a caminho da sua casa. Chega quentinha em instantes! 🛵💨`;
      case "DELIVERED":
        return `Olá, ${clientName}! Seu pedido foi entregue. Esperamos que ame a sua pizza *${firstItemName}*! Bom apetite! 😋🍕`;
      case "CANCELLED":
        return `Olá, ${clientName}! Infelizmente seu pedido de pizza *${firstItemName}* foi cancelado. Se tiver dúvidas, entre em contato conosco por direct ou telefone. 😔🍕`;
      default:
        return null;
    }
  } else if (normalizedNiche === "hamburger" || normalizedNiche === "hamburgueria") {
    switch (status) {
      case "PREPARING":
        return `Olá, ${clientName}! Seu hambúrguer *${firstItemName}* já está na chapa sendo grelhado no ponto perfeito! 🍔🔥`;
      case "OUT_FOR_DELIVERY":
        return `Prepare-se, ${clientName}! Seu hambúrguer *${firstItemName}* saiu para entrega e está a caminho. Vai chegar quentinho! 🛵💨`;
      case "DELIVERED":
        return `Olá, ${clientName}! Seu burger *${firstItemName}* foi entregue. Aproveite cada mordida! 🍔🎉`;
      case "CANCELLED":
        return `Olá, ${clientName}! Infelizmente seu pedido de hambúrguer *${firstItemName}* foi cancelado. Se tiver dúvidas, entre em contato conosco. 😔🍔`;
      default:
        return null;
    }
  } else if (normalizedNiche === "sushi" || normalizedNiche === "japonesa") {
    switch (status) {
      case "PREPARING":
        return `Olá, ${clientName}! Seu *${firstItemName}* está sendo preparado com peixes super frescos pelos nossos sushimen! 🥢🍣`;
      case "OUT_FOR_DELIVERY":
        return `Prepare o hashi, ${clientName}! Seu pedido de *${firstItemName}* saiu para entrega e está a caminho! 🛵💨`;
      case "DELIVERED":
        return `Olá, ${clientName}! Seu *${firstItemName}* foi entregue. Bom apetite! 🍣🥢`;
      case "CANCELLED":
        return `Olá, ${clientName}! Infelizmente seu pedido de *${firstItemName}* foi cancelado. Se tiver dúvidas, entre em contato conosco. 😔🍣`;
      default:
        return null;
    }
  } else if (normalizedNiche === "adega") {
    switch (status) {
      case "PREPARING":
        return `Olá, ${clientName}! Seu pedido de *${firstItemName}* está sendo separado e colocado para gelar! ❄️🍾`;
      case "OUT_FOR_DELIVERY":
        return `Bebidas trincando de geladas a caminho, ${clientName}! Seu pedido de *${firstItemName}* saiu para entrega! 🛵💨`;
      case "DELIVERED":
        return `Olá, ${clientName}! Seu pedido de *${firstItemName}* foi entregue. Saúde! 🥂🍻`;
      case "CANCELLED":
        return `Olá, ${clientName}! Infelizmente seu pedido de *${firstItemName}* foi cancelado. Se tiver dúvidas, entre em contato conosco. 😔🍾`;
      default:
        return null;
    }
  } else {
    // Default fallback
    switch (status) {
      case "PREPARING":
        return `Olá, ${clientName}! Seu pedido de *${firstItemName}* está sendo preparado com muito carinho! ✨`;
      case "OUT_FOR_DELIVERY":
        return `Olá, ${clientName}! Seu pedido de *${firstItemName}* saiu para entrega e está a caminho de você! 🛵💨`;
      case "DELIVERED":
        return `Olá, ${clientName}! Seu pedido de *${firstItemName}* foi entregue. Agradecemos a preferência! 🎉`;
      case "CANCELLED":
        return `Olá, ${clientName}! Infelizmente seu pedido de *${firstItemName}* foi cancelado. Se tiver dúvidas, entre em contato conosco. 😔`;
      default:
        return null;
    }
  }
}

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const DB_FILE = path.join(process.cwd(), "data-db.json");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Structure of Pizza database
interface Pizza {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  imageUrl: string;
  images?: string[];
  category: string;
  likes: number;
  comments?: { username: string; text: string }[];
  priceInPoints?: number;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  customization?: {
    isHalfAndHalf: boolean;
    halfPizza?: Pizza;
    borda: string;
    finalPrice: number;
  };
  quantity: number;
  priceInPoints?: number;
}

interface Order {
  id: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  paymentMethod: "pix" | "card" | "debit" | "points" | "site_license";
  items: OrderItem[];
  totalPrice: number;
  status: "PENDING" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
  trackingUrl?: string;
  createdAt: string;
  comprovanteNum: string;
  observation?: string;
  comprovanteUrl?: string;
  mpPaymentId?: string;
  clientUsername?: string;
}

// Global default seed pizzas
const DEFAULT_PIZZAS: Pizza[] = [];

const PRESET_DEMO_PIZZAS: Pizza[] = [
  {
    id: "1",
    name: "Margherita Suprema",
    description: "Um clássico napolitano com molho de tomate artesanal, muçarela fior di latte fresca, manjericão gigante e um generoso fio de azeite extravirgem.",
    ingredients: ["Molho de tomate italiano", "Muçarela de búfala", "Manjericão fresco", "Azeite trufado", "Parmesão ralado"],
    price: 49.90,
    imageUrl: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&auto=format&fit=crop&q=80",
    category: "Salgada",
    likes: 1242,
    comments: []
  },
  {
    id: "2",
    name: "Calabresa Defumada",
    description: "Calabresa artesanal defumada fatiada fininha, cebola roxa marinada no azeite de ervas, muçarela dourada e azeitonas pretas.",
    ingredients: ["Molho de tomate", "Muçarela especial", "Calabresa artesanal defumada", "Cebola roxa", "Orégano", "Azeitonas pretas"],
    price: 45.90,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    category: "Salgada",
    likes: 932,
    comments: []
  },
  {
    id: "3",
    name: "Gourmet Quatro Formaggi",
    description: "Combinação harmoniosa de queijos nobres: muçarela cremosa, gorgonzola dolce importado, provolone defumado e catupiry original.",
    ingredients: ["Muçarela", "Gorgonzola Dolce", "Provolone defumado", "Catupiry original", "Orégano silvestre"],
    price: 54.90,
    imageUrl: "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&auto=format&fit=crop&q=80",
    category: "Salgada",
    likes: 1530,
    comments: []
  },
  {
    id: "4",
    name: "Pepperoni & Hot Honey",
    description: "Fatias crocantes de pepperoni de alto padrão, muçarela, parmesão curado e finalizado com fio de mel picante artesanal.",
    ingredients: ["Molho de tomate", "Muçarela de cura rápida", "Double Pepperoni", "Mel com pimenta", "Orégano"],
    price: 52.90,
    imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80",
    category: "Salgada",
    likes: 1872,
    comments: []
  },
  {
    id: "5",
    name: "Chocolate com Morangos",
    description: "Base crocante coberta com ganache de chocolate belga ao leite genuíno, fatias generosas de morangos e raspas de chocolate branco.",
    ingredients: ["Chocolate Belga meio-amargo", "Morangos frescos", "Raspas de chocolate branco", "Calda artesanal"],
    price: 46.90,
    imageUrl: "https://images.unsplash.com/photo-1613564834644-a1707b282b86?w=800&auto=format&fit=crop&q=80",
    category: "Doce",
    likes: 2104,
    comments: []
  },
  {
    id: "6",
    name: "Nutella Suprema com Ninho",
    description: "Base crocante com ganache pura de Nutella autêntica e finalizada com generosa cobertura de leite Ninho em pó e morangos frescos.",
    ingredients: ["Nutella original", "Leite Ninho em pó", "Morangos frescos", "Amêndoas em lâminas"],
    price: 52.90,
    imageUrl: "https://images.unsplash.com/photo-1613564834644-a1707b282b86?w=800&auto=format&fit=crop&q=80",
    category: "Doce",
    likes: 1390,
    comments: []
  },
  {
    id: "7",
    name: "Coca-Cola Zero Lata",
    description: "Lata de refrigerante Coca-Cola zero açúcar trincando de gelada.",
    ingredients: ["Refrigerante", "Lata", "Zero açúcar"],
    price: 6.00,
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80",
    category: "Bebida",
    likes: 541,
    comments: []
  },
  {
    id: "8",
    name: "Suco de Uva Integral",
    description: "Garrafa de suco de uva integral 100% natural, sem conservantes e bem gelado.",
    ingredients: ["Uva selecionada", "Integral", "Copo com gelo"],
    price: 12.00,
    imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&auto=format&fit=crop&q=80",
    category: "Bebida",
    likes: 247,
    comments: []
  }
];

const PRESET_DEMO_STORIES: Story[] = [
  {
    id: "promo",
    title: "Ofertas 🔥",
    emoji: "🏷️",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    header: "Combo Prime Ativo",
    description: "Peça qualquer Pizza Grande Salgada e ganhe a Borda Especial de Catupiry ou Provolone grátis! Promoção válida para pagamentos nesta semana."
  },
  {
    id: "meio",
    title: "Meio-Meio ♊",
    emoji: "♊",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80",
    header: "Sabor Duplo Real",
    description: "Não decida por um sabor só! Ao selecionar qualquer pizza, clique na opção 'Meio a Meio' para escolher duas metades diferentes de igual cremosidade."
  },
  {
    id: "bordas",
    title: "As Bordas 🧀",
    emoji: "🧀",
    image: "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&auto=format&fit=crop&q=80",
    header: "Bordas Recheadas Nobres",
    description: "Nossas bordas são preparadas à mão e recheadas com Catupiry Original® ou Cheddar cremoso. Experimente a Borda de Chocolate com o sabor Doce de sobremesa!"
  }
];

interface Story {
  id: string;
  title: string;
  emoji: string;
  image: string;
  header: string;
  description: string;
}

interface Borda {
  id: string;
  name: string;
  price: number;
}

interface UserAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  isAdmin: boolean;
  phone?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  avatarUrl?: string;
  points?: number;
  bio?: string;
}

interface DBStructure {
  pizzas: Pizza[];
  orders: Order[];
  pizzeriaName: string;
  pizzeriaLogo?: string;
  categories: { id: string; emoji: string; label: string }[];
  demoMode: boolean;
  checkoutUrl: string;
  checkoutButtonText: string;
  stories: Story[];
  bordas: Borda[];
  meioMeioEnabled: boolean;
  meioMeioPriceMode: "max" | "average";
  tremEnabled: boolean;
  tremMaxFlavors?: number;
  convenienciaPromoEnabled?: boolean;
  convenienciaDiscountPercent?: number;
  users: UserAccount[];
  pixKey?: string;
  mpAccessToken?: string;
  mpEnabled?: boolean;
  pointsName?: string;
  pointsPerPizza?: number;
  pointsEnabled?: boolean;
  niche?: string;
  pixEnabled?: boolean;
  creditCardEnabled?: boolean;
  debitCardEnabled?: boolean;
  sitePrice?: number;
  siteDriveLink?: string;
  siteMpToken?: string;
}

const DEFAULT_STORIES: Story[] = [];

const DEFAULT_BORDAS: Borda[] = [
  { id: "none", name: "Sem Borda Recheada", price: 0 },
  { id: "catupiry", name: "Borda Catupiry Original", price: 4.90 },
  { id: "cheddar", name: "Borda Creamy Cheddar", price: 5.90 },
  { id: "chocolate", name: "Borda Doce de Chocolate Belga", price: 6.90 }
];

const DEFAULT_CATEGORIES = [
  { id: "Salgada", emoji: "🧀", label: "Salgadas" },
  { id: "Doce", emoji: "🍫", label: "Doces" },
  { id: "Trem", emoji: "🚇", label: "Trem 🚇" },
  { id: "Bebida", emoji: "🥤", label: "Bebidas" },
  { id: "Esfihas", emoji: "🥟", label: "Esfihas" },
  { id: "Sobremesas", emoji: "🍰", label: "Sobremesas" }
];

const DEFAULT_USERS: UserAccount[] = [
  {
    id: "admin",
    name: "Proprietário",
    username: "admin",
    password: "admin",
    isAdmin: true,
    phone: "5511987654321",
    cep: "12345-678",
    street: "Rua dos Sabores",
    number: "1000",
    neighborhood: "Bairro do Queijo",
    city: "Cidade das Massas",
    state: "SP"
  }
];

// Initialize SQLite Database
const SQLITE_FILE = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(process.cwd(), "data-db.sqlite");

// Ensure parent directories exist if DATABASE_PATH is provided
if (process.env.DATABASE_PATH) {
  const parentDir = path.dirname(SQLITE_FILE);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
}

const sqliteDb = new Database(SQLITE_FILE);

// Enable WAL mode for high performance
sqliteDb.pragma("journal_mode = WAL");

// Setup database tables if they do not exist
sqliteDb.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    pizzeriaName TEXT,
    pizzeriaLogo TEXT,
    categories TEXT,
    demoMode INTEGER,
    checkoutUrl TEXT,
    checkoutButtonText TEXT,
    meioMeioEnabled INTEGER,
    meioMeioPriceMode TEXT,
    tremEnabled INTEGER,
    tremMaxFlavors INTEGER,
    convenienciaPromoEnabled INTEGER,
    convenienciaDiscountPercent REAL,
    pixKey TEXT,
    mpAccessToken TEXT,
    mpEnabled INTEGER DEFAULT 0,
    pointsName TEXT DEFAULT 'PizzatoPoints',
    pointsPerPizza INTEGER DEFAULT 120
  );

  CREATE TABLE IF NOT EXISTS pizzas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    ingredients TEXT,
    price REAL NOT NULL,
    imageUrl TEXT,
    images TEXT,
    category TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    comments TEXT,
    priceInPoints INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    clientName TEXT NOT NULL,
    clientAddress TEXT NOT NULL,
    clientPhone TEXT NOT NULL,
    paymentMethod TEXT NOT NULL,
    items TEXT NOT NULL,
    totalPrice REAL NOT NULL,
    status TEXT NOT NULL,
    trackingUrl TEXT,
    createdAt TEXT NOT NULL,
    comprovanteNum TEXT NOT NULL,
    comprovanteUrl TEXT,
    mpPaymentId TEXT,
    clientUsername TEXT
  );

  CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    emoji TEXT NOT NULL,
    image TEXT NOT NULL,
    header TEXT NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bordas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    isAdmin INTEGER DEFAULT 0,
    phone TEXT,
    cep TEXT,
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    avatarUrl TEXT,
    points INTEGER DEFAULT 0
  );
`);

try {
  sqliteDb.exec("ALTER TABLE settings ADD COLUMN pixKey TEXT;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE orders ADD COLUMN comprovanteUrl TEXT;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE settings ADD COLUMN pointsName TEXT DEFAULT 'PizzatoPoints';");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE settings ADD COLUMN pointsPerPizza INTEGER DEFAULT 120;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE pizzas ADD COLUMN priceInPoints INTEGER DEFAULT 0;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE settings ADD COLUMN mpAccessToken TEXT;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE settings ADD COLUMN mpEnabled INTEGER DEFAULT 0;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE orders ADD COLUMN mpPaymentId TEXT;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE orders ADD COLUMN clientUsername TEXT;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE settings ADD COLUMN pointsEnabled INTEGER DEFAULT 1;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE users ADD COLUMN bio TEXT;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE settings ADD COLUMN niche TEXT DEFAULT 'pizzaria';");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE settings ADD COLUMN pixEnabled INTEGER DEFAULT 1;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE settings ADD COLUMN creditCardEnabled INTEGER DEFAULT 1;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE settings ADD COLUMN debitCardEnabled INTEGER DEFAULT 1;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE settings ADD COLUMN sitePrice REAL DEFAULT 97.0;");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE settings ADD COLUMN siteDriveLink TEXT DEFAULT '';");
} catch (e) {}
try {
  sqliteDb.exec("ALTER TABLE settings ADD COLUMN siteMpToken TEXT DEFAULT '';");
} catch (e) {}




function migrateJSONToSQLite() {
  try {
    // Check if settings table has any rows
    const rowCountObj = sqliteDb.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
    if (rowCountObj && rowCountObj.count > 0) {
      return;
    }

    let jsonDB: DBStructure | null = null;
    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        jsonDB = JSON.parse(fileContent);
      } catch (e) {
        console.error("Erro ao ler JSON para migração para SQLite:", e);
      }
    }

    if (!jsonDB) {
      jsonDB = {
        pizzas: [],
        orders: [],
        pizzeriaName: "Minha Pizzaria",
        pizzeriaLogo: "",
        categories: DEFAULT_CATEGORIES,
        demoMode: false,
        checkoutUrl: "https://pay.kiwify.com.br/OsmPMDX",
        checkoutButtonText: "Quero Comprar Meu Site! 🚀",
        stories: [],
        bordas: DEFAULT_BORDAS,
        meioMeioEnabled: true,
        meioMeioPriceMode: "max",
        tremEnabled: true,
        tremMaxFlavors: 4,
        convenienciaPromoEnabled: true,
        convenienciaDiscountPercent: 5,
        users: DEFAULT_USERS
      };
    }

    const transaction = sqliteDb.transaction(() => {
      // 1. Insert settings
      sqliteDb.prepare(`
        INSERT OR REPLACE INTO settings (
          id, pizzeriaName, pizzeriaLogo, categories, demoMode, checkoutUrl, checkoutButtonText,
          meioMeioEnabled, meioMeioPriceMode, tremEnabled, tremMaxFlavors,
          convenienciaPromoEnabled, convenienciaDiscountPercent, pixKey, pointsName, pointsPerPizza, niche,
          pixEnabled, creditCardEnabled, debitCardEnabled
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1)
      `).run(
        jsonDB!.pizzeriaName || "Minha Pizzaria",
        jsonDB!.pizzeriaLogo || "",
        JSON.stringify(jsonDB!.categories || DEFAULT_CATEGORIES),
        jsonDB!.demoMode ? 1 : 0,
        jsonDB!.checkoutUrl || "https://pay.kiwify.com.br/OsmPMDX",
        jsonDB!.checkoutButtonText || "Quero Comprar Meu Site! 🚀",
        jsonDB!.meioMeioEnabled !== false ? 1 : 0,
        jsonDB!.meioMeioPriceMode || "max",
        jsonDB!.tremEnabled !== false ? 1 : 0,
        jsonDB!.tremMaxFlavors !== undefined ? jsonDB!.tremMaxFlavors : 4,
        jsonDB!.convenienciaPromoEnabled !== false ? 1 : 0,
        jsonDB!.convenienciaDiscountPercent !== undefined ? jsonDB!.convenienciaDiscountPercent : 5,
        (jsonDB as any).pixKey || "",
        (jsonDB as any).pointsName || "PizzatoPoints",
        (jsonDB as any).pointsPerPizza !== undefined ? (jsonDB as any).pointsPerPizza : 120,
        (jsonDB as any).niche || "pizzaria"
      );

      // 2. Insert pizzas
      const insertPizza = sqliteDb.prepare(`
        INSERT OR REPLACE INTO pizzas (id, name, description, ingredients, price, imageUrl, images, category, likes, comments, priceInPoints)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of jsonDB!.pizzas || []) {
        insertPizza.run(
          p.id,
          p.name,
          p.description || "",
          JSON.stringify(p.ingredients || []),
          p.price,
          p.imageUrl || "",
          JSON.stringify(p.images || []),
          p.category,
          p.likes || 0,
          JSON.stringify(p.comments || []),
          (p as any).priceInPoints || 0
        );
      }

      // 3. Insert orders
      const insertOrder = sqliteDb.prepare(`
        INSERT OR REPLACE INTO orders (id, clientName, clientAddress, clientPhone, paymentMethod, items, totalPrice, status, trackingUrl, createdAt, comprovanteNum, comprovanteUrl)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const o of jsonDB!.orders || []) {
        insertOrder.run(
          o.id,
          o.clientName,
          o.clientAddress,
          o.clientPhone,
          o.paymentMethod,
          JSON.stringify(o.items || []),
          o.totalPrice,
          o.status,
          o.trackingUrl || "",
          o.createdAt,
          o.comprovanteNum,
          (o as any).comprovanteUrl || ""
        );
      }

      // 4. Insert stories
      const insertStory = sqliteDb.prepare(`
        INSERT OR REPLACE INTO stories (id, title, emoji, image, header, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const s of jsonDB!.stories || []) {
        insertStory.run(s.id, s.title, s.emoji, s.image, s.header, s.description);
      }

      // 5. Insert bordas
      const insertBorda = sqliteDb.prepare(`
        INSERT OR REPLACE INTO bordas (id, name, price)
        VALUES (?, ?, ?)
      `);
      for (const b of jsonDB!.bordas || DEFAULT_BORDAS) {
        insertBorda.run(b.id, b.name, b.price);
      }

      // 6. Insert users
      const insertUser = sqliteDb.prepare(`
        INSERT OR REPLACE INTO users (
          id, name, username, password, isAdmin, phone, cep, street, number, complement, neighborhood, city, state, avatarUrl
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of jsonDB!.users || DEFAULT_USERS) {
        insertUser.run(
          u.id,
          u.name,
          u.username,
          u.password,
          u.isAdmin ? 1 : 0,
          u.phone || "",
          u.cep || "",
          u.street || "",
          u.number || "",
          u.complement || "",
          u.neighborhood || "",
          u.city || "",
          u.state || "",
          u.avatarUrl || ""
        );
      }
    });

    transaction();
    console.log("Migração do banco de dados JSON para SQLite concluída com sucesso!");
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.renameSync(DB_FILE, DB_FILE + ".migrated-to-sqlite");
      } catch (err) {
        console.error("Erro ao renomear arquivo data-db.json após migração:", err);
      }
    }
  } catch (error) {
    console.error("Erro fatal durante a migração SQLite:", error);
  }
}

// Ensure database is initialized/migrated on launch
migrateJSONToSQLite();

function readDB(): DBStructure {
  try {
    const settings = sqliteDb.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
    if (!settings) {
      migrateJSONToSQLite();
      return readDB();
    }

    // Auto-seed default values in persistent databases if empty
    if (!settings.siteMpToken || settings.siteMpToken.trim() === "" || !settings.siteDriveLink || settings.siteDriveLink.trim() === "") {
      try {
        const tokenToSet = !settings.siteMpToken || settings.siteMpToken.trim() === "" ? "APP_USR-2425249541216504-062111-a144598d69e7d76be8b9abdd95363e23-141063585" : settings.siteMpToken;
        const linkToSet = !settings.siteDriveLink || settings.siteDriveLink.trim() === "" ? "https://drive.google.com/drive/u/2/folders/11BUbwwfU4oAEDf0UFUl3aPgNe3_ZpT_6" : settings.siteDriveLink;
        sqliteDb.prepare("UPDATE settings SET siteMpToken = ?, siteDriveLink = ? WHERE id = 1").run(tokenToSet, linkToSet);
        settings.siteMpToken = tokenToSet;
        settings.siteDriveLink = linkToSet;
        console.log("Auto-seeded default siteMpToken and siteDriveLink in readDB.");
      } catch (e) {
        console.error("Erro ao aplicar auto-seeding em readDB:", e);
      }
    }

    const rawPizzas = sqliteDb.prepare("SELECT * FROM pizzas").all() as any[];
    const pizzas: Pizza[] = rawPizzas.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      ingredients: JSON.parse(p.ingredients || "[]"),
      price: p.price,
      imageUrl: p.imageUrl || "",
      images: JSON.parse(p.images || "[]"),
      category: p.category,
      likes: p.likes || 0,
      comments: JSON.parse(p.comments || "[]"),
      priceInPoints: p.priceInPoints || 0
    }));

    const rawOrders = sqliteDb.prepare("SELECT * FROM orders").all() as any[];
    const orders: Order[] = rawOrders.map(o => ({
      id: o.id,
      clientName: o.clientName,
      clientAddress: o.clientAddress,
      clientPhone: o.clientPhone,
      paymentMethod: o.paymentMethod as any,
      items: JSON.parse(o.items || "[]"),
      totalPrice: o.totalPrice,
      status: o.status as any,
      trackingUrl: o.trackingUrl || "",
      createdAt: o.createdAt,
      comprovanteNum: o.comprovanteNum,
      comprovanteUrl: o.comprovanteUrl || "",
      mpPaymentId: o.mpPaymentId || "",
      clientUsername: o.clientUsername || ""
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stories = sqliteDb.prepare("SELECT * FROM stories").all() as Story[];
    const bordas = sqliteDb.prepare("SELECT * FROM bordas").all() as Borda[];

    const rawUsers = sqliteDb.prepare("SELECT * FROM users").all() as any[];
    const users: UserAccount[] = rawUsers.map(u => ({
      id: u.id,
      name: u.name,
      username: u.username,
      password: u.password,
      isAdmin: u.isAdmin === 1,
      phone: u.phone || "",
      cep: u.cep || "",
      street: u.street || "",
      number: u.number || "",
      complement: u.complement || "",
      neighborhood: u.neighborhood || "",
      city: u.city || "",
      state: u.state || "",
      avatarUrl: u.avatarUrl || "",
      points: u.points || 0,
      bio: u.bio || ""
    }));

    return {
      pizzas,
      orders,
      pizzeriaName: settings.pizzeriaName || "Minha Pizzaria",
      pizzeriaLogo: settings.pizzeriaLogo || "",
      categories: JSON.parse(settings.categories || "[]"),
      demoMode: settings.demoMode === 1,
      checkoutUrl: settings.checkoutUrl || "",
      checkoutButtonText: settings.checkoutButtonText || "",
      stories,
      bordas,
      meioMeioEnabled: settings.meioMeioEnabled === 1,
      meioMeioPriceMode: settings.meioMeioPriceMode as any,
      tremEnabled: settings.tremEnabled === 1,
      tremMaxFlavors: settings.tremMaxFlavors !== undefined ? settings.tremMaxFlavors : 4,
      convenienciaPromoEnabled: settings.convenienciaPromoEnabled === 1,
      convenienciaDiscountPercent: settings.convenienciaDiscountPercent !== undefined ? settings.convenienciaDiscountPercent : 5,
      users,
      pixKey: settings.pixKey || "",
      mpAccessToken: settings.mpAccessToken || "",
      mpEnabled: settings.mpEnabled === 1,
      pointsName: settings.pointsName || "PizzatoPoints",
      pointsPerPizza: settings.pointsPerPizza !== undefined ? settings.pointsPerPizza : 120,
      pointsEnabled: settings.pointsEnabled !== 0,
      niche: settings.niche || "pizzaria",
      pixEnabled: settings.pixEnabled !== 0,
      creditCardEnabled: settings.creditCardEnabled !== 0,
      debitCardEnabled: settings.debitCardEnabled !== 0,
      sitePrice: settings.sitePrice !== undefined ? settings.sitePrice : 97.0,
      siteDriveLink: settings.siteDriveLink || "",
      siteMpToken: settings.siteMpToken || ""
    };
  } catch (error) {
    console.error("Erro ao ler banco de dados SQLite:", error);
    return {
      pizzas: [],
      orders: [],
      pizzeriaName: "Minha Pizzaria",
      categories: DEFAULT_CATEGORIES,
      demoMode: false,
      checkoutUrl: "https://pay.kiwify.com.br/OsmPMDX",
      checkoutButtonText: "Quero Comprar Meu Site! 🚀",
      stories: [],
      bordas: DEFAULT_BORDAS,
      meioMeioEnabled: true,
      meioMeioPriceMode: "max",
      tremEnabled: true,
      convenienciaPromoEnabled: true,
      convenienciaDiscountPercent: 5,
      users: DEFAULT_USERS,
      pixKey: "",
      mpAccessToken: "",
      mpEnabled: false,
      pointsName: "PizzatoPoints",
      pointsPerPizza: 120,
      pointsEnabled: true,
      sitePrice: 97.0,
      siteDriveLink: "https://drive.google.com/drive/u/2/folders/11BUbwwfU4oAEDf0UFUl3aPgNe3_ZpT_6",
      siteMpToken: "APP_USR-2425249541216504-062111-a144598d69e7d76be8b9abdd95363e23-141063585"
    };
  }
}

function writeDB(data: DBStructure) {
  try {
    const transaction = sqliteDb.transaction(() => {
      // 1. Update settings
      sqliteDb.prepare(`
        INSERT OR REPLACE INTO settings (
          id, pizzeriaName, pizzeriaLogo, categories, demoMode, checkoutUrl, checkoutButtonText,
          meioMeioEnabled, meioMeioPriceMode, tremEnabled, tremMaxFlavors,
          convenienciaPromoEnabled, convenienciaDiscountPercent, pixKey,
          mpAccessToken, mpEnabled, pointsName, pointsPerPizza, pointsEnabled, niche,
          pixEnabled, creditCardEnabled, debitCardEnabled, sitePrice, siteDriveLink, siteMpToken
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.pizzeriaName || "Minha Pizzaria",
        data.pizzeriaLogo || "",
        JSON.stringify(data.categories || DEFAULT_CATEGORIES),
        data.demoMode ? 1 : 0,
        data.checkoutUrl || "https://pay.kiwify.com.br/OsmPMDX",
        data.checkoutButtonText || "Quero Comprar Meu Site! 🚀",
        data.meioMeioEnabled ? 1 : 0,
        data.meioMeioPriceMode || "max",
        data.tremEnabled ? 1 : 0,
        data.tremMaxFlavors !== undefined ? data.tremMaxFlavors : 4,
        data.convenienciaPromoEnabled ? 1 : 0,
        data.convenienciaDiscountPercent !== undefined ? data.convenienciaDiscountPercent : 5,
        data.pixKey || "",
        data.mpAccessToken || "",
        data.mpEnabled ? 1 : 0,
        (data as any).pointsName || "PizzatoPoints",
        (data as any).pointsPerPizza !== undefined ? (data as any).pointsPerPizza : 120,
        data.pointsEnabled !== false ? 1 : 0,
        data.niche || "pizzaria",
        data.pixEnabled !== false ? 1 : 0,
        data.creditCardEnabled !== false ? 1 : 0,
        data.debitCardEnabled !== false ? 1 : 0,
        data.sitePrice !== undefined ? data.sitePrice : 97.0,
        data.siteDriveLink || "",
        data.siteMpToken || ""
      );

      // 2. Sync pizzas (Delete then insert)
      sqliteDb.prepare(`DELETE FROM pizzas`).run();
      const insertPizza = sqliteDb.prepare(`
        INSERT INTO pizzas (id, name, description, ingredients, price, imageUrl, images, category, likes, comments, priceInPoints)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of data.pizzas || []) {
        insertPizza.run(
          p.id,
          p.name,
          p.description || "",
          JSON.stringify(p.ingredients || []),
          p.price,
          p.imageUrl || "",
          JSON.stringify(p.images || []),
          p.category,
          p.likes || 0,
          JSON.stringify(p.comments || []),
          (p as any).priceInPoints || 0
        );
      }

      // 3. Sync orders (Delete then insert)
      sqliteDb.prepare(`DELETE FROM orders`).run();
      const insertOrder = sqliteDb.prepare(`
        INSERT INTO orders (id, clientName, clientAddress, clientPhone, paymentMethod, items, totalPrice, status, trackingUrl, createdAt, comprovanteNum, comprovanteUrl, mpPaymentId, clientUsername)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const o of data.orders || []) {
        insertOrder.run(
          o.id,
          o.clientName,
          o.clientAddress,
          o.clientPhone,
          o.paymentMethod,
          JSON.stringify(o.items || []),
          o.totalPrice,
          o.status,
          o.trackingUrl || "",
          o.createdAt,
          o.comprovanteNum,
          o.comprovanteUrl || "",
          o.mpPaymentId || "",
          (o as any).clientUsername || ""
        );
      }

      // 4. Sync stories (Delete then insert)
      sqliteDb.prepare(`DELETE FROM stories`).run();
      const insertStory = sqliteDb.prepare(`
        INSERT INTO stories (id, title, emoji, image, header, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const s of data.stories || []) {
        insertStory.run(s.id, s.title, s.emoji, s.image, s.header, s.description);
      }

      // 5. Sync bordas (Delete then insert)
      sqliteDb.prepare(`DELETE FROM bordas`).run();
      const insertBorda = sqliteDb.prepare(`
        INSERT INTO bordas (id, name, price)
        VALUES (?, ?, ?)
      `);
      for (const b of data.bordas || []) {
        insertBorda.run(b.id, b.name, b.price);
      }

      // 6. Sync users (Delete then insert)
      sqliteDb.prepare(`DELETE FROM users`).run();
      const insertUser = sqliteDb.prepare(`
        INSERT INTO users (
          id, name, username, password, isAdmin, phone, cep, street, number, complement, neighborhood, city, state, avatarUrl, points, bio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of data.users || []) {
        insertUser.run(
          u.id,
          u.name,
          u.username,
          u.password,
          u.isAdmin ? 1 : 0,
          u.phone || "",
          u.cep || "",
          u.street || "",
          u.number || "",
          u.complement || "",
          u.neighborhood || "",
          u.city || "",
          u.state || "",
          u.avatarUrl || "",
          u.points || 0,
          u.bio || ""
        );
      }
    });

    transaction();
  } catch (error) {
    console.error("Erro ao gravar no banco de dados SQLite:", error);
  }
}

// ---------------------- API ROUTES ----------------------

// Auth Login API
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password, isAdminMode } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Preencha usuário e senha!" });
    }
    const db = readDB();
    const cleanUsername = username.trim().toLowerCase();

    // Find custom match
    let user = db.users.find(u => u.username.toLowerCase() === cleanUsername);

    // Backward compatibility for newly configured db
    if (!user && cleanUsername === "admin" && password === "admin") {
      user = db.users.find(u => u.id === "admin");
    }

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado!" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Senha incorreta!" });
    }

    if (isAdminMode && !user.isAdmin) {
      return res.status(403).json({ error: "Este usuário não possui privilégios de Admin." });
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Auth Register API
app.post("/api/auth/register", (req, res) => {
  try {
    const { username, password, name, phone, cep, street, number, complement, neighborhood, city, state } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ error: "Usuário, senha e nome completo são obrigatórios!" });
    }

    const db = readDB();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

    const exists = db.users.some(u => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      return res.status(400).json({ error: "Este nome de usuário já está sendo usado por outro cliente!" });
    }

    const newUser: UserAccount = {
      id: Date.now().toString(),
      name,
      username: cleanUsername,
      password,
      isAdmin: false,
      phone: phone || "",
      cep: cep || "",
      street: street || "",
      number: number || "",
      complement: complement || "",
      neighborhood: neighborhood || "",
      city: city || "",
      state: state || "",
      points: 0
    };

    db.users.push(newUser);
    writeDB(db);

    res.status(201).json({ success: true, user: newUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Auth Update Profile API (Supports changing username and password for Admin and Client!)
app.post("/api/auth/update-profile", (req, res) => {
  try {
    const { 
      currentUsername, 
      username, 
      password, 
      name, 
      phone, 
      cep, 
      street, 
      number, 
      complement, 
      neighborhood, 
      city, 
      state,
      avatarUrl,
      bio
    } = req.body;

    if (!currentUsername) {
      return res.status(400).json({ error: "Sessão inválida!" });
    }

    const db = readDB();
    let userIndex = db.users.findIndex(u => u.username.toLowerCase() === currentUsername.trim().toLowerCase() || u.id === currentUsername.trim().toLowerCase());

    if (userIndex === -1) {
      // Create user dynamically so whitelabel customization behaves exactly as expected!
      const isUserAdmin = currentUsername.trim().toLowerCase().includes("admin") || 
                          currentUsername.trim().toLowerCase().includes("premium") || 
                          currentUsername.trim().toLowerCase().includes("comprador") || 
                          currentUsername.trim().toLowerCase().includes("dono");
      const newUser = {
        id: currentUsername.trim().toLowerCase(),
        username: currentUsername.trim().toLowerCase(),
        password: "password",
        isAdmin: isUserAdmin,
        name: name || "Dono / Comprador Demo",
        phone: phone || "5511987654321",
        cep: cep || "12345-678",
        street: street || "Rua dos Sabores",
        number: number || "1000",
        neighborhood: neighborhood || "Bairro do Queijo",
        city: city || "Cidade das Massas",
        state: state || "SP"
      };
      db.users.push(newUser);
      userIndex = db.users.length - 1;
    }

    const user = db.users[userIndex];

    // If changing username, verify uniqueness
    if (username && username.trim().toLowerCase() !== user.username.toLowerCase()) {
      const cleanNewUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
      const exists = db.users.some((u, idx) => u.username.toLowerCase() === cleanNewUsername && idx !== userIndex);
      if (exists) {
        return res.status(400).json({ error: "Este novo nome de usuário já está em uso!" });
      }
      user.username = cleanNewUsername;
    }

    // Update fields if provided
    if (password !== undefined) user.password = password;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (cep !== undefined) user.cep = cep;
    if (street !== undefined) user.street = street;
    if (number !== undefined) user.number = number;
    if (complement !== undefined) user.complement = complement;
    if (neighborhood !== undefined) user.neighborhood = neighborhood;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (bio !== undefined) user.bio = bio;

    db.users[userIndex] = user;
    writeDB(db);

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch user points for synchronization
app.get("/api/users/:username", (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.username.toLowerCase() === req.params.username.trim().toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json({
      username: user.username,
      points: user.points || 0
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch configuration (pizzeria name and categories)
app.get("/api/config", (req, res) => {
  try {
    const db = readDB();
    const adminUser = db.users.find(u => u.isAdmin);
    res.json({
      pizzeriaName: db.pizzeriaName,
      pizzeriaLogo: db.pizzeriaLogo || "",
      demoMode: db.demoMode,
      checkoutUrl: db.checkoutUrl,
      checkoutButtonText: db.checkoutButtonText,
      categories: db.categories,
      stories: db.stories,
      bordas: db.bordas,
      meioMeioEnabled: db.meioMeioEnabled,
      meioMeioPriceMode: db.meioMeioPriceMode,
      tremEnabled: db.tremEnabled,
      tremMaxFlavors: db.tremMaxFlavors !== undefined ? db.tremMaxFlavors : 4,
      convenienciaPromoEnabled: db.convenienciaPromoEnabled !== false,
      convenienciaDiscountPercent: db.convenienciaDiscountPercent !== undefined ? db.convenienciaDiscountPercent : 5,
      pixKey: db.pixKey || "",
      mpAccessToken: db.mpAccessToken || "",
      mpEnabled: db.mpEnabled || false,
      pointsName: db.pointsName || "PizzatoPoints",
      pointsPerPizza: db.pointsPerPizza !== undefined ? db.pointsPerPizza : 120,
      pointsEnabled: db.pointsEnabled !== false,
      niche: db.niche || "pizzaria",
      pixEnabled: db.pixEnabled !== false,
      creditCardEnabled: db.creditCardEnabled !== false,
      debitCardEnabled: db.debitCardEnabled !== false,
      adminPhone: adminUser ? adminUser.phone : "5511987654321",
      sitePrice: db.sitePrice !== undefined ? db.sitePrice : 97.0,
      siteDriveLink: db.siteDriveLink || "",
      siteMpToken: db.siteMpToken || ""
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update configuration
app.post("/api/config", (req, res) => {
  try {
    const { 
      pizzeriaName, 
      pizzeriaLogo,
      categories, 
      demoMode, 
      checkoutUrl, 
      checkoutButtonText,
      stories,
      bordas,
      meioMeioEnabled,
      meioMeioPriceMode,
      tremEnabled,
      pixEnabled,
      creditCardEnabled,
      debitCardEnabled,
      tremMaxFlavors,
      convenienciaPromoEnabled,
      convenienciaDiscountPercent,
      pixKey,
      mpAccessToken,
      mpEnabled,
      pointsName,
      pointsPerPizza,
      pointsEnabled,
      niche,
      sitePrice,
      siteDriveLink,
      siteMpToken
    } = req.body;
    const db = readDB();
    
    if (pizzeriaName !== undefined) {
      db.pizzeriaName = pizzeriaName;
    }
    if (pizzeriaLogo !== undefined) {
      db.pizzeriaLogo = pizzeriaLogo;
    }
    if (demoMode !== undefined) {
      db.demoMode = demoMode === true || demoMode === "true";
    }
    if (checkoutUrl !== undefined) {
      db.checkoutUrl = checkoutUrl;
    }
    if (checkoutButtonText !== undefined) {
      db.checkoutButtonText = checkoutButtonText;
    }
    
    if (categories && Array.isArray(categories)) {
      db.categories = categories;
    }

    if (stories !== undefined && Array.isArray(stories)) {
      db.stories = stories;
    }

    if (bordas !== undefined && Array.isArray(bordas)) {
      db.bordas = bordas;
    }

    if (meioMeioEnabled !== undefined) {
      db.meioMeioEnabled = meioMeioEnabled === true || meioMeioEnabled === "true";
    }

    if (meioMeioPriceMode !== undefined) {
      db.meioMeioPriceMode = meioMeioPriceMode;
    }

    if (tremEnabled !== undefined) {
      db.tremEnabled = tremEnabled === true || tremEnabled === "true";
    }

    if (tremMaxFlavors !== undefined) {
      db.tremMaxFlavors = parseInt(tremMaxFlavors) || 4;
    }

    if (convenienciaPromoEnabled !== undefined) {
      db.convenienciaPromoEnabled = convenienciaPromoEnabled === true || convenienciaPromoEnabled === "true";
    }

    if (convenienciaDiscountPercent !== undefined) {
      db.convenienciaDiscountPercent = parseFloat(convenienciaDiscountPercent) || 0;
    }

    if (pixKey !== undefined) {
      db.pixKey = pixKey;
    }

    if (mpAccessToken !== undefined) {
      db.mpAccessToken = mpAccessToken;
    }

    if (mpEnabled !== undefined) {
      db.mpEnabled = mpEnabled === true || mpEnabled === "true" || mpEnabled === 1;
    }

    if (pointsName !== undefined) {
      db.pointsName = pointsName;
    }

    if (pointsPerPizza !== undefined) {
      db.pointsPerPizza = parseInt(pointsPerPizza) !== undefined ? parseInt(pointsPerPizza) : 120;
    }
    if (pointsEnabled !== undefined) {
      db.pointsEnabled = pointsEnabled === true || pointsEnabled === "true" || pointsEnabled === 1;
    }
    if (niche !== undefined) {
      db.niche = niche;
    }
    if (pixEnabled !== undefined) {
      db.pixEnabled = pixEnabled === true || pixEnabled === "true" || pixEnabled === 1;
    }
    if (creditCardEnabled !== undefined) {
      db.creditCardEnabled = creditCardEnabled === true || creditCardEnabled === "true" || creditCardEnabled === 1;
    }
    if (debitCardEnabled !== undefined) {
      db.debitCardEnabled = debitCardEnabled === true || debitCardEnabled === "true" || debitCardEnabled === 1;
    }
    
    if (sitePrice !== undefined) {
      db.sitePrice = parseFloat(String(sitePrice)) || 97.0;
    }
    if (siteDriveLink !== undefined) {
      db.siteDriveLink = siteDriveLink;
    }
    if (siteMpToken !== undefined) {
      db.siteMpToken = siteMpToken;
    }
    
    writeDB(db);
    
    res.json({ 
      success: true, 
      pizzeriaName: db.pizzeriaName, 
      pizzeriaLogo: db.pizzeriaLogo || "",
      demoMode: db.demoMode,
      checkoutUrl: db.checkoutUrl,
      checkoutButtonText: db.checkoutButtonText,
      categories: db.categories,
      stories: db.stories,
      bordas: db.bordas,
      meioMeioEnabled: db.meioMeioEnabled,
      meioMeioPriceMode: db.meioMeioPriceMode,
      tremEnabled: db.tremEnabled,
      tremMaxFlavors: db.tremMaxFlavors !== undefined ? db.tremMaxFlavors : 4,
      convenienciaPromoEnabled: db.convenienciaPromoEnabled,
      convenienciaDiscountPercent: db.convenienciaDiscountPercent,
      pixKey: db.pixKey || "",
      mpAccessToken: db.mpAccessToken || "",
      mpEnabled: db.mpEnabled || false,
      pointsName: db.pointsName || "PizzatoPoints",
      pointsPerPizza: db.pointsPerPizza !== undefined ? db.pointsPerPizza : 120,
      pointsEnabled: db.pointsEnabled !== false,
      niche: db.niche || "pizzaria",
      pixEnabled: db.pixEnabled !== false,
      creditCardEnabled: db.creditCardEnabled !== false,
      debitCardEnabled: db.debitCardEnabled !== false,
      sitePrice: db.sitePrice !== undefined ? db.sitePrice : 97.0,
      siteDriveLink: db.siteDriveLink || "",
      siteMpToken: db.siteMpToken || ""
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// WhatsApp connection status endpoint
app.get("/api/whatsapp/status", (req, res) => {
  res.json({
    ready: whatsappReady,
    qrUrl: currentQrUrl
  });
});

// WhatsApp disconnect endpoint
app.post("/api/whatsapp/disconnect", async (req, res) => {
  try {
    if (whatsappReady) {
      await whatsappClient.logout();
      whatsappReady = false;
      currentQrUrl = "";
      res.json({ success: true, message: "WhatsApp desconectado com sucesso!" });
    } else {
      res.status(400).json({ error: "WhatsApp não está conectado." });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Load standard demo catalog (pizzas + stories)
app.post("/api/config/load-demo-catalog", (req, res) => {
  try {
    const db = readDB();
    db.pizzas = PRESET_DEMO_PIZZAS;
    db.stories = PRESET_DEMO_STORIES;
    writeDB(db);
    res.json({
      success: true,
      pizzas: db.pizzas,
      stories: db.stories
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch pizzas list
app.get("/api/pizzas", (req, res) => {
  try {
    const db = readDB();
    res.json(db.pizzas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add new pizza (Admin)
app.post("/api/pizzas", (req, res) => {
  try {
    const { name, description, ingredients, price, imageUrl, images, category, priceInPoints } = req.body;
    
    const hasPrice = price !== undefined && parseFloat(price) > 0;
    const hasPoints = priceInPoints !== undefined && parseInt(priceInPoints) > 0;

    if (!name || !hasPrice || !imageUrl || !category) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes! Forneça o preço em dinheiro." });
    }

    const ingredientsArr = Array.isArray(ingredients) ? ingredients : ingredients ? ingredients.split(",").map((i: string) => i.trim()) : [];
    const imagesArr = Array.isArray(images) ? images : [];

    const db = readDB();
    const newPizza: Pizza = {
      id: Date.now().toString(),
      name,
      description: description || "",
      ingredients: ingredientsArr,
      price: hasPrice ? parseFloat(price) : 0,
      imageUrl,
      images: imagesArr,
      category,
      likes: Math.floor(Math.random() * 50) + 10,
      comments: [],
      priceInPoints: hasPoints ? parseInt(priceInPoints) : 0
    };

    db.pizzas.push(newPizza);
    writeDB(db);
    res.status(201).json(newPizza);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Edit existing pizza (Admin)
app.put("/api/pizzas/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, ingredients, price, imageUrl, images, category, priceInPoints } = req.body;

    const db = readDB();
    const pIndex = db.pizzas.findIndex(p => p.id === id);
    if (pIndex === -1) {
      return res.status(404).json({ error: "Pizza não encontrada!" });
    }

    const existing = db.pizzas[pIndex];

    let ingredientsArr = existing.ingredients;
    if (ingredients !== undefined) {
      ingredientsArr = Array.isArray(ingredients) ? ingredients : ingredients ? ingredients.split(",").map((i: string) => i.trim()) : [];
    }

    let imagesArr = existing.images || [];
    if (images !== undefined) {
      imagesArr = Array.isArray(images) ? images : [];
    }

    const updated: Pizza = {
      ...existing,
      name: name || existing.name,
      description: description !== undefined ? description : existing.description,
      ingredients: ingredientsArr,
      price: price !== undefined ? parseFloat(price) : existing.price,
      imageUrl: imageUrl || existing.imageUrl,
      images: imagesArr,
      category: category || existing.category,
      priceInPoints: priceInPoints !== undefined ? parseInt(priceInPoints) : existing.priceInPoints
    };

    db.pizzas[pIndex] = updated;
    writeDB(db);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete pizza (Admin)
app.delete("/api/pizzas/:id", (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const originalLength = db.pizzas.length;
    db.pizzas = db.pizzas.filter(p => p.id !== id);
    if (db.pizzas.length === originalLength) {
      return res.status(404).json({ error: "Pizza não encontrada!" });
    }
    writeDB(db);
    res.json({ message: "Pizza removida com sucesso!" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all orders (Admin)
app.get("/api/orders", (req, res) => {
  try {
    const db = readDB();
    // Exclude automated Pix orders that have not been approved/paid yet
    const visibleOrders = db.orders.filter(o => !(o.status === "PENDING" && o.mpPaymentId));
    res.json(visibleOrders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch an order by ID (Tracking)
app.get("/api/orders/:id", async (req, res) => {
  try {
    const db = readDB();
    const orderIndex = db.orders.findIndex(o => o.id === req.params.id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: "Pedido não localizado" });
    }
    const order = db.orders[orderIndex];

    // If order is PENDING and has a Mercado Pago payment ID, check status on the fly
    if (order.status === "PENDING" && order.mpPaymentId) {
      const settings = sqliteDb.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
      if (settings && settings.mpAccessToken) {
        try {
          const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${order.mpPaymentId}`, {
            headers: {
              Authorization: `Bearer ${settings.mpAccessToken}`
            }
          });
          if (mpRes.ok) {
            const paymentData = await mpRes.json() as any;
            if (paymentData.status === "approved") {
              db.orders[orderIndex].status = "PREPARING";
              writeDB(db);
              order.status = "PREPARING";
            }
          }
        } catch (err) {
          console.error("Erro ao verificar status do pagamento via API de tracking:", err);
        }
      }
    }

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Place order
app.post("/api/orders", (req, res) => {
  try {
    const { clientName, clientAddress, clientPhone, paymentMethod, items, totalPrice, observation, comprovanteUrl, mpPaymentId, status, clientUsername } = req.body;
    if (!clientName || !clientAddress || !clientPhone || !items || !items.length) {
      return res.status(400).json({ error: "Parâmetros incorretos do pedido." });
    }

    const db = readDB();
    
    // Find user to check/deduct points
    let userIndex = -1;
    if (clientUsername) {
      userIndex = db.users.findIndex(u => u.username.toLowerCase() === clientUsername.trim().toLowerCase());
    }

    let totalPointsCost = 0;
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.priceInPoints && item.priceInPoints > 0) {
          totalPointsCost += (item.priceInPoints * item.quantity);
        }
      }
    }

    if (totalPointsCost > 0) {
      if (userIndex === -1) {
        return res.status(400).json({ error: "Sessão inválida ou usuário não encontrado para resgatar pontos." });
      }
      const user = db.users[userIndex];
      const userPoints = user.points || 0;
      if (userPoints < totalPointsCost) {
        return res.status(400).json({ error: `Saldo de pontos insuficiente. Você precisa de ${totalPointsCost} pontos.` });
      }
      // Deduct points
      db.users[userIndex].points = userPoints - totalPointsCost;
    }

    const count = db.orders.length + 1;
    const orderId = `PZ-${Date.now().toString().slice(-4)}-${count}`;
    const comprovanteNum = `COMP-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: orderId,
      clientName,
      clientAddress,
      clientPhone,
      paymentMethod,
      items,
      totalPrice,
      status: status || (paymentMethod === "points" ? "PREPARING" : "PENDING"),
      trackingUrl: `/tracking/${orderId}`,
      createdAt: new Date().toISOString(),
      comprovanteNum,
      observation: observation || undefined,
      comprovanteUrl: comprovanteUrl || undefined,
      mpPaymentId: mpPaymentId || undefined,
      clientUsername: clientUsername || undefined
    };

    db.orders.unshift(newOrder); // unshift to put newest order first
    writeDB(db);

    // Send WhatsApp notification to Admin asynchronously
    const adminUser = db.users.find(u => u.isAdmin);
    if (adminUser && adminUser.phone) {
      const itemsSummary = newOrder.items.map(item => {
        let itemStr = `• ${item.quantity}x ${item.name}`;
        if (item.customization) {
          const cust = item.customization;
          const parts = [];
          if (cust.isHalfAndHalf && cust.halfPizza) {
            parts.push(`Metade: ${cust.halfPizza.name}`);
          }
          if (cust.borda && cust.borda !== "none" && cust.borda !== "Sem Borda Recheada") {
            parts.push(`Borda: ${cust.borda}`);
          }
          if (parts.length > 0) {
            itemStr += ` (${parts.join(", ")})`;
          }
        }
        return itemStr;
      }).join("\n");

      const adminMessage = `🔔 *Novo Pedido Recebido!*
*Código:* ${newOrder.id}
*Cliente:* ${newOrder.clientName}
*Telefone:* ${newOrder.clientPhone}
*Método:* ${newOrder.paymentMethod.toUpperCase()}
*Total:* R$ ${newOrder.totalPrice.toFixed(2)}

*Itens:*
${itemsSummary}

*Endereço:*
${newOrder.clientAddress}

*Observações:*
${newOrder.observation || "Nenhuma"}`;

      sendWhatsAppMessage(adminUser.phone, adminMessage).catch(err => {
        console.error("Erro ao enviar mensagem WhatsApp para o admin:", err);
      });
    }

    const updatedUser = userIndex !== -1 ? db.users[userIndex] : undefined;
    res.status(201).json({ order: newOrder, user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (Admin toggle status and generate notifications)
app.patch("/api/orders/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].includes(status)) {
      return res.status(400).json({ error: "Status inválido." });
    }

    const db = readDB();
    const orderIndex = db.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: "Pedido não localizado!" });
    }

    const oldStatus = db.orders[orderIndex].status;
    db.orders[orderIndex].status = status;

    const order = db.orders[orderIndex];

    // Send WhatsApp notification to client if status changed
    if (oldStatus !== status && order.clientPhone) {
      const firstItemName = order.items && order.items.length > 0 ? order.items[0].name : "Pedido";
      const statusMsg = getStatusMessage(db.niche || "pizzaria", status, order.clientName, firstItemName);
      if (statusMsg) {
        sendWhatsAppMessage(order.clientPhone, statusMsg).catch(err => {
          console.error("Erro ao enviar mensagem WhatsApp para o cliente:", err);
        });
      }
    }

    // Award loyalty points to user when order transitions to DELIVERED
    if (status === "DELIVERED" && oldStatus !== "DELIVERED" && db.pointsEnabled !== false) {
      const order = db.orders[orderIndex];
      const pointsPerPizza = db.pointsPerPizza !== undefined ? db.pointsPerPizza : 120;
      let earned = 0;
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          if (!(item.priceInPoints && item.priceInPoints > 0) && item.category !== "Bebida") {
            earned += (item.quantity * pointsPerPizza);
          }
        }
      }
      if (earned > 0 && order.clientUsername) {
        const uIdx = db.users.findIndex(u => u.username.toLowerCase() === order.clientUsername.trim().toLowerCase());
        if (uIdx !== -1) {
          db.users[uIdx].points = (db.users[uIdx].points || 0) + earned;
        }
      }
    }

    writeDB(db);
    res.json(db.orders[orderIndex]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mercado Pago Payment Creation Route
app.post("/api/payments/create-pix", async (req, res) => {
  try {
    const { email, amount, description } = req.body;
    if (!email || !amount) {
      return res.status(400).json({ error: "E-mail e valor são obrigatórios." });
    }

    // Retrieve settings
    const settings = sqliteDb.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
    if (!settings || !settings.mpAccessToken) {
      return res.status(400).json({ error: "Pagamento automático via Mercado Pago não configurado (Access Token ausente)." });
    }

    // Create payment in Mercado Pago
    const idempotencyKey = `pizagram-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.mpAccessToken}`,
        "X-Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify({
        transaction_amount: parseFloat(amount),
        description: description || "Pedido Pizagram",
        payment_method_id: "pix",
        payer: {
          email: email.trim(),
          first_name: "Cliente",
          last_name: "Pizagram"
        }
      })
    });

    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      console.error("Erro na API do Mercado Pago:", errText);
      return res.status(mpResponse.status).json({ error: "Erro ao gerar pagamento com Mercado Pago." });
    }

    const paymentData = await mpResponse.json() as any;
    
    // Check if the required transaction data is present
    const transactionData = paymentData.point_of_interaction?.transaction_data;
    if (!transactionData) {
      return res.status(500).json({ error: "Mercado Pago não retornou dados da transação Pix." });
    }

    res.json({
      paymentId: paymentData.id.toString(),
      qr_code: transactionData.qr_code,
      qr_code_base64: transactionData.qr_code_base64
    });
  } catch (err: any) {
    console.error("Erro no endpoint create-pix:", err);
    res.status(500).json({ error: err.message });
  }
});

// Mercado Pago Card Payment Creation Route
app.post("/api/sales/create-payment", async (req, res) => {
  try {
    const { name, email, phone, cpf, method, cardNumber, cardExpiry, cardCvv, cardName } = req.body;
    if (!name || !email || !phone || !cpf || !method) {
      return res.status(400).json({ error: "Nome, e-mail, telefone, CPF e método de pagamento são obrigatórios." });
    }

    const settings = sqliteDb.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
    const token = settings.siteMpToken || settings.mpAccessToken;
    if (!token) {
      return res.status(400).json({ error: "Integração do Mercado Pago para vendas do site não configurada (Access Token ausente)." });
    }

    const sitePrice = settings.sitePrice !== undefined ? settings.sitePrice : 97.0;

    let mpPaymentId = "";
    let qr_code = "";
    let qr_code_base64 = "";

    if (method === "pix") {
      const idempotencyKey = `site-pix-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({
          transaction_amount: sitePrice,
          description: `Compra do Site Pizagram - ${name}`,
          payment_method_id: "pix",
          payer: {
            email: email.trim(),
            first_name: name.split(" ")[0] || "Cliente",
            last_name: name.split(" ").slice(1).join(" ") || "Pizagram",
            identification: {
              type: "CPF",
              number: cpf.replace(/\D/g, "")
            }
          }
        })
      });

      if (!mpResponse.ok) {
        const errText = await mpResponse.text();
        console.error("Erro MP Pix Venda:", errText);
        return res.status(400).json({ error: "Mercado Pago recusou a geração do Pix." });
      }

      const paymentData = await mpResponse.json() as any;
      mpPaymentId = paymentData.id.toString();
      qr_code = paymentData.point_of_interaction?.transaction_data?.qr_code || "";
      qr_code_base64 = paymentData.point_of_interaction?.transaction_data?.qr_code_base64 || "";
    } else {
      // Credit card purchase
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        return res.status(400).json({ error: "Todos os campos do cartão são obrigatórios para pagamento em cartão." });
      }

      const expiryParts = cardExpiry.split("/");
      if (expiryParts.length !== 2) {
        return res.status(400).json({ error: "Formato de validade inválido. Use MM/AA." });
      }
      const month = parseInt(expiryParts[0].trim());
      const yearStr = expiryParts[1].trim();
      const year = parseInt(yearStr.length === 2 ? `20${yearStr}` : yearStr);

      const cleanCardNumber = cardNumber.replace(/\D/g, "");
      const cleanCvv = cardCvv.replace(/\D/g, "");
      const cleanCpf = cpf.replace(/\D/g, "");

      // 1. Card Token
      const tokenRes = await fetch("https://api.mercadopago.com/v1/card_tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          card_number: cleanCardNumber,
          expiration_month: month,
          expiration_year: year,
          security_code: cleanCvv,
          cardholder: {
            name: cardName.trim()
          }
        })
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("Erro MP Card Token Venda:", errText);
        return res.status(400).json({ error: "Dados do cartão recusados." });
      }

      const tokenData = await tokenRes.json() as any;
      const cardToken = tokenData.id;

      // Guess card brand
      let paymentMethodId = "visa";
      if (cleanCardNumber.startsWith("4")) paymentMethodId = "visa";
      else if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(cleanCardNumber)) paymentMethodId = "master";
      else if (/^3[47]/.test(cleanCardNumber)) paymentMethodId = "amex";
      else if (/^(50|56|57|58|59|60|62|63|65)/.test(cleanCardNumber)) paymentMethodId = "elo";

      // 2. Create Payment
      const idempotencyKey = `site-card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({
          token: cardToken,
          description: `Compra do Site Pizagram - ${name}`,
          installments: 1,
          transaction_amount: sitePrice,
          payment_method_id: paymentMethodId,
          payer: {
            email: email.trim(),
            identification: {
              type: "CPF",
              number: cleanCpf
            }
          }
        })
      });

      if (!mpResponse.ok) {
        const errText = await mpResponse.text();
        console.error("Erro MP Card Payment Venda:", errText);
        return res.status(400).json({ error: "Pagamento não autorizado pelo Mercado Pago." });
      }

      const paymentData = await mpResponse.json() as any;
      mpPaymentId = paymentData.id.toString();
    }

    // Now, write this order to database so the status tracking works!
    const db = readDB();
    const orderId = `site_${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      clientName: name,
      clientAddress: "Download Digital",
      clientPhone: phone,
      paymentMethod: "site_license",
      items: [{
        id: "site_license",
        name: "Licença Completa Site Pizagram",
        category: "licença",
        price: sitePrice,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&auto=format&fit=crop&q=80"
      }],
      totalPrice: sitePrice,
      status: method === "pix" ? "PENDING" : "PREPARING", // Cards are instant approved if ok
      trackingUrl: "",
      createdAt: new Date().toISOString(),
      comprovanteNum: `T-${Date.now()}`,
      comprovanteUrl: method === "pix" ? "Pix Digital (Pendente)" : "Cartão Aprovado",
      mpPaymentId: mpPaymentId
    };

    db.orders.unshift(newOrder);
    writeDB(db);

    res.json({
      success: true,
      orderId,
      mpPaymentId,
      qr_code,
      qr_code_base64,
      status: newOrder.status
    });
  } catch (err: any) {
    console.error("Erro no create-payment da venda do site:", err);
    res.status(500).json({ error: err.message });
  }
});

// Mercado Pago Webhook Route
app.post("/api/webhooks/mercadopago", async (req, res) => {
  try {
    const paymentId = req.body?.data?.id || req.query?.id;
    if (!paymentId) {
      return res.status(200).send("No payment ID provided. Ignored.");
    }

    const db = readDB();
    const paymentIdStr = paymentId.toString();
    const matchedOrder = db.orders.find(o => o.mpPaymentId === paymentIdStr);

    let tokenToUse = "";
    if (matchedOrder && matchedOrder.paymentMethod === "site_license" && db.siteMpToken) {
      tokenToUse = db.siteMpToken;
    } else {
      tokenToUse = db.mpAccessToken || "";
    }

    if (!tokenToUse) {
      return res.status(200).send("Mercado Pago token not set. Ignored.");
    }

    // Query payment status
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${tokenToUse}`
      }
    });

    if (mpRes.ok) {
      const paymentData = await mpRes.json() as any;
      if (paymentData.status === "approved") {
        const db = readDB();
        const pidStr = paymentId.toString();
        
        // Find order with this mpPaymentId
        const orderIdx = db.orders.findIndex(o => o.mpPaymentId === pidStr);
        if (orderIdx !== -1) {
          db.orders[orderIdx].status = "PREPARING";
          writeDB(db);
          console.log(`Pedido ${db.orders[orderIdx].id} atualizado para PREPARING via Webhook (Pagamento ID: ${paymentId})`);
        } else {
          console.log(`Nenhum pedido correspondente encontrado para o Pagamento ID: ${paymentId}`);
        }
      }
    }

    res.status(200).send("OK");
  } catch (err: any) {
    console.error("Erro no webhook do Mercado Pago:", err);
    res.status(500).send("Internal Server Error");
  }
});

// --------------------------------------------------------

async function startServer() {
  // Initialize JSON database
  readDB();

  // Vite dev server integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production build configuration
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pizzaria Instagram Server running at http://localhost:${PORT}`);
  });
}

startServer();
