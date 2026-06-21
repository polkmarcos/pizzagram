/**
 * Type declarations for the Pizzaria Estilo Instagram application
 */

export interface Pizza {
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

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  customization?: {
    isHalfAndHalf: boolean;
    halfPizza?: Pizza; // The second flavor
    borda: string;
    finalPrice: number;
    // Niche-specific choices:
    meatPoint?: string;      // hamburgueria (ex: Ao Ponto)
    temperature?: string;    // adega (ex: Trincando de Gelada)
    giftMessage?: string;    // doceria (dedicatória personalizada)
    needsHashi?: boolean;    // sushi (sim/não)
  };
  quantity: number;
  priceInPoints?: number;
}

export interface Order {
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

export interface SystemNotification {
  id: string;
  type: "curtida" | "comentario" | "pedido_status" | "admin_novo_pedido";
  username: string; // sender
  avatarUrl?: string;
  message: string;
  pizzaId?: string;
  orderId?: string;
  timeString: string;
  read: boolean;
}

export interface StoryTextOverlay {
  id: string;
  text: string;
  color: string;
  fontFamily: string;
  fontSize: number; // in px or scale
  x: number; // percentage width 0-100
  y: number; // percentage height 0-100
}

export interface Story {
  id: string;
  title: string;
  emoji: string;
  image: string;
  header: string;
  description: string;
  textOverlays?: StoryTextOverlay[];
}

export interface Borda {
  id: string;
  name: string;
  price: number;
}

export type BordaType = string;

export const BORDAS_CONFIG = [
  { id: "none", name: "Sem Borda Recheada", price: 0 },
  { id: "catupiry", name: "Borda Catupiry Original", price: 4.90 },
  { id: "cheddar", name: "Borda Creamy Cheddar", price: 5.90 },
  { id: "chocolate", name: "Borda Doce de Chocolate Belga", price: 6.90 }
];

export type FoodNiche = 'pizzaria' | 'hamburgueria' | 'sushi' | 'adega' | 'doceria';

export const NICHE_CONFIGS: Record<FoodNiche, {
  storeNoun: string;
  productNoun: string;
  productPlural: string;
  addOnsName: string;
  preparingMessage: string;
}> = {
  pizzaria: {
    storeNoun: "Pizzaria",
    productNoun: "Pizza",
    productPlural: "Pizzas",
    addOnsName: "Borda Recheada",
    preparingMessage: "está sendo preparada no forno de lenha! 🔥"
  },
  hamburgueria: {
    storeNoun: "Hamburgueria",
    productNoun: "Hambúrguer",
    productPlural: "Hambúrgueres",
    addOnsName: "Ingrediente Extra",
    preparingMessage: "está na grelha sendo preparado! 🍔🔥"
  },
  sushi: {
    storeNoun: "Sushi",
    productNoun: "Combinado",
    productPlural: "Combinados",
    addOnsName: "Acompanhamento",
    preparingMessage: "está sendo montado pelo sushiman! 🍣"
  },
  adega: {
    storeNoun: "Adega",
    productNoun: "Bebida",
    productPlural: "Bebidas",
    addOnsName: "Acessório/Adicional",
    preparingMessage: "está sendo separada e embalada na geladeira! 🍾"
  },
  doceria: {
    storeNoun: "Doceria",
    productNoun: "Doce",
    productPlural: "Doces",
    addOnsName: "Cobertura/Vela",
    preparingMessage: "está sendo confeitado e decorado no atelier! 🍰✨"
  }
};

