import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Grid, Heart, Send, Shield, ShoppingBag, BellRing, ChevronLeft, MapPin, CheckCircle, Clock, Truck, ShieldAlert, X, Sparkles, AlertCircle, Award, Bookmark, Plus } from "lucide-react";
import InstagramHeader from "./components/InstagramHeader";
import ProfileSection from "./components/ProfileSection";
import PizzaPostCard, { PizzaPostCardSkeleton } from "./components/PizzaPostCard";
import PostDetailsModal from "./components/PostDetailsModal";
import DirectMessagesContainer from "./components/DirectMessagesContainer";
import AdminPanel from "./components/AdminPanel";
import InstagramLogin from "./components/InstagramLogin";
import CreatePostModal from "./components/CreatePostModal";
import StoryViewer from "./components/StoryViewer";
import SiteSalesPage from "./components/SiteSalesPage";
import { Pizza, OrderItem, Order, SystemNotification, Story, Borda, FoodNiche, NICHE_CONFIGS } from "./types";

export default function App() {
  // Application tabs
  const [activeTab, setActiveTab] = useState<"feed" | "direct" | "admin" | "comprar_site">("feed");
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const prevOrdersStatusRef = useRef<Record<string, string>>({});

  // Live GPS rider simulation progress
  const [deliveryProgress, setDeliveryProgress] = useState(15);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (trackingOrderId) {
      interval = setInterval(() => {
        setDeliveryProgress(prev => {
          if (prev >= 100) return 10; // Reset to loop transit
          const step = Math.floor(Math.random() * 4) + 1; // move 1% - 5% forward
          return Math.min(prev + step, 100);
        });
      }, 1500);
    } else {
      setDeliveryProgress(15);
    }
    return () => clearInterval(interval);
  }, [trackingOrderId]);

  const getRiderPosition = (progress: number) => {
    // Interpolates coordinates smoothly along the white street lines of our simulation map
    if (progress <= 20) {
      const factor = progress / 20;
      return { left: `${15 + factor * 10}%`, top: `25%` };
    } else if (progress <= 50) {
      const factor = (progress - 20) / 30;
      return { left: `25%`, top: `${25 + factor * 41}%` };
    } else if (progress <= 80) {
      const factor = (progress - 50) / 30;
      return { left: `${25 + factor * 50}%`, top: `66%` };
    } else if (progress <= 90) {
      const factor = (progress - 80) / 10;
      return { left: `75%`, top: `${66 + factor * 14}%` };
    } else {
      const factor = (progress - 90) / 10;
      return { left: `${75 + factor * 10}%`, top: `80%` };
    }
  };

  // Auto-hide header and footer on scroll logic (only active inside Carrinho/Direct tab)
  const [showHeader, setShowHeader] = useState(true);
  const [showBottomNav, setShowBottomNav] = useState(true);
  const lastScrollY = useRef(0);

  const handleMainScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    // Auto-hide scroll behavior ONLY happens on the Cart/Direct tab to ease typing/viewing items
    if (activeTab === "direct") {
      if (currentScrollY > lastScrollY.current && currentScrollY > 40) {
        // Scrolling down -> hide bars
        if (showHeader) setShowHeader(false);
        if (showBottomNav) setShowBottomNav(false);
      } else if (currentScrollY < lastScrollY.current || currentScrollY <= 15) {
        // Scrolling up -> show bars
        if (!showHeader) setShowHeader(true);
        if (!showBottomNav) setShowBottomNav(true);
      }
    } else {
      // For any other tab (Feed, Admin), make sure bars are ALWAYS 100% visible
      if (!showHeader) setShowHeader(true);
      if (!showBottomNav) setShowBottomNav(true);
    }
    
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    setShowHeader(true);
    setShowBottomNav(true);
  }, [activeTab]);

  // Auth State
  const [currentUser, setCurrentUser] = useState<{ 
    name: string; 
    username: string; 
    isAdmin: boolean;
    password?: string;
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
  } | null>(() => {
    const cached = localStorage.getItem("pizzato_user");
    return cached ? JSON.parse(cached) : null;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Category highlights filter
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  // Dynamic Configuration State
  const [pizzeriaName, setPizzeriaName] = useState<string>("Minha Pizzaria");
  const [pizzeriaLogo, setPizzeriaLogo] = useState<string>("");
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>("https://pay.kiwify.com.br/OsmPMDX");
  const [checkoutButtonText, setCheckoutButtonText] = useState<string>("Quero Comprar Meu Site! 🚀");
  const [sitePrice, setSitePrice] = useState<number>(97.0);
  const [siteDriveLink, setSiteDriveLink] = useState<string>("");
  const [siteMpToken, setSiteMpToken] = useState<string>("");
  const [stories, setStories] = useState<Story[]>([]);
  const [bordas, setBordas] = useState<Borda[]>([]);
  const [meioMeioEnabled, setMeioMeioEnabled] = useState<boolean>(true);
  const [meioMeioPriceMode, setMeioMeioPriceMode] = useState<"max" | "average">("max");
  const [tremEnabled, setTremEnabled] = useState<boolean>(true);
  const [tremMaxFlavors, setTremMaxFlavors] = useState<number>(4);
  const [convenienciaPromoEnabled, setConvenienciaPromoEnabled] = useState<boolean>(true);
  const [convenienciaDiscountPercent, setConvenienciaDiscountPercent] = useState<number>(5);
  const [pixKey, setPixKey] = useState<string>("");
  const [mpAccessToken, setMpAccessToken] = useState<string>("");
  const [mpEnabled, setMpEnabled] = useState<boolean>(false);
  const [pointsName, setPointsName] = useState<string>("PizzatoPoints");
  const [pointsPerPizza, setPointsPerPizza] = useState<number>(120);
  const [pointsEnabled, setPointsEnabled] = useState<boolean>(true);
  const [niche, setNiche] = useState<FoodNiche>("pizzaria");
  const [adminPhone, setAdminPhone] = useState<string>("5511987654321");
  const [pixEnabled, setPixEnabled] = useState<boolean>(true);
  const [creditCardEnabled, setCreditCardEnabled] = useState<boolean>(true);
  const [debitCardEnabled, setDebitCardEnabled] = useState<boolean>(true);
  const [profileSubTab, setProfileSubTab] = useState<"menu" | "favorites">("menu");
  const [favoritePizzaIds, setFavoritePizzaIds] = useState<string[]>([]);
  // Post Creator and Story Viewer States
  const [createPostOpen, setCreatePostOpen] = useState<boolean>(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number>(0);
  const [storyViewerOpen, setStoryViewerOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<{ id: string; emoji: string; label: string }[]>([
    { id: "Salgada", emoji: "🧀", label: "Salgadas" },
    { id: "Doce", emoji: "🍫", label: "Doces" },
    { id: "Trem", emoji: "🚇", label: "Trem 🚇" },
    { id: "Bebida", emoji: "🥤", label: "Bebidas" },
    { id: "Esfihas", emoji: "🥟", label: "Esfihas" },
    { id: "Sobremesas", emoji: "🍰", label: "Sobremesas" }
  ]);

  // States
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [isLoadingPizzas, setIsLoadingPizzas] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<OrderItem[]>(() => {
    const cached = localStorage.getItem("pizzato_cart");
    return cached ? JSON.parse(cached) : [];
  });

  // Client info customized starting values matching metadata
  const [clientName, setClientName] = useState(() => localStorage.getItem("pizzato_client_name") || "Seu Nome");
  const [clientPhone, setClientPhone] = useState(() => localStorage.getItem("pizzato_client_phone") || "(11) 99999-9999");
  const [clientCep, setClientCep] = useState(() => localStorage.getItem("pizzato_client_cep") || "12345-678");
  const [clientStreet, setClientStreet] = useState(() => localStorage.getItem("pizzato_client_street") || "Rua dos Sabores");
  const [clientNumber, setClientNumber] = useState(() => localStorage.getItem("pizzato_client_number") || "1000");
  const [clientComplement, setClientComplement] = useState(() => localStorage.getItem("pizzato_client_complement") || "");
  const [clientNeighborhood, setClientNeighborhood] = useState(() => localStorage.getItem("pizzato_client_neighborhood") || "Bairro do Queijo");
  const [clientCity, setClientCity] = useState(() => localStorage.getItem("pizzato_client_city") || "Cidade das Massas");
  const [clientState, setClientState] = useState(() => localStorage.getItem("pizzato_client_state") || "SP");

  const clientAddress = `${clientStreet}, ${clientNumber}${clientComplement ? " - " + clientComplement : ""} - ${clientNeighborhood}, ${clientCity} - ${clientState} (CEP: ${clientCep})`;

  // Dynamic affiliate and checkout URL builder
  const getDynamicCheckoutUrl = (): string => {
    // Under all circumstances, this is a locked sales funnel page.
    // The checkout URL must always lead to the official Kiwify checkout!
    const base = "https://pay.kiwify.com.br/OsmPMDX";
    if (typeof window === "undefined") return base;
    const searchParams = new URLSearchParams(window.location.search);
    
    try {
      const parsedUrl = new URL(base);
      // Merge other query parameters in so parameters like UTMs, src, etc. propagate cleanly
      searchParams.forEach((val, key) => {
        parsedUrl.searchParams.set(key, val);
      });
      return parsedUrl.toString();
    } catch {
      return base;
    }
  };

  const finalCheckoutUrl = getDynamicCheckoutUrl();

  const [searchValue, setSearchValue] = useState("");
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Notifications feed
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activePush, setActivePush] = useState<SystemNotification | null>(null);

  // URL query parameter routing parsing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackId = params.get("tracking");
    if (trackId) {
      setTrackingOrderId(trackId);
    }

    // Load initial client data from cache
    const cachedName = localStorage.getItem("pizzato_client_name");
    const cachedPhone = localStorage.getItem("pizzato_client_phone");
    const cachedCep = localStorage.getItem("pizzato_client_cep");
    const cachedStreet = localStorage.getItem("pizzato_client_street");
    const cachedNumber = localStorage.getItem("pizzato_client_number");
    const cachedComp = localStorage.getItem("pizzato_client_complement");
    const cachedNeigh = localStorage.getItem("pizzato_client_neighborhood");
    const cachedCity = localStorage.getItem("pizzato_client_city");
    const cachedState = localStorage.getItem("pizzato_client_state");

    if (cachedName) setClientName(cachedName);
    if (cachedPhone) setClientPhone(cachedPhone);
    if (cachedCep) setClientCep(cachedCep);
    if (cachedStreet) setClientStreet(cachedStreet);
    if (cachedNumber) setClientNumber(cachedNumber);
    if (cachedComp !== null) setClientComplement(cachedComp);
    if (cachedNeigh) setClientNeighborhood(cachedNeigh);
    if (cachedCity) setClientCity(cachedCity);
    if (cachedState) setClientState(cachedState);
  }, []);

  // Sync cart cash
  useEffect(() => {
    localStorage.setItem("pizzato_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync favorites when current user session changes
  useEffect(() => {
    const username = currentUser?.username || "guest";
    const cachedFavs = localStorage.getItem(`pizzato_favorites_${username}`);
    setFavoritePizzaIds(cachedFavs ? JSON.parse(cachedFavs) : []);
  }, [currentUser]);

  const handleToggleFavoritePizza = (pizzaId: string) => {
    const username = currentUser?.username || "guest";
    setFavoritePizzaIds((prev) => {
      const isFav = prev.includes(pizzaId);
      const updated = isFav ? prev.filter((id) => id !== pizzaId) : [...prev, pizzaId];
      localStorage.setItem(`pizzato_favorites_${username}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Initial loads
  useEffect(() => {
    fetchPizzas();
    fetchOrders();
    fetchConfig();

    // Default notifications seed
    const seedNotifs: SystemNotification[] = [
      {
        id: "n1",
        type: "pedido_status",
        username: "dono",
        message: "enviou uma mensagem: 'Olá! Obrigado por usar o nosso aplicativo. Caso precise de suporte ou queira personalizar seu pedido, envie um Direct!' 💬",
        timeString: "há 2 min",
        read: false
      },
      {
        id: "n2",
        type: "pedido_status",
        username: "dono",
        message: "publicou um aviso: 'Novidade no forno! Experimente hoje a Margherita Suprema com nossa borda recheada premium. 🍕'",
        timeString: "há 15 min",
        read: true
      },
      {
        id: "n3",
        type: "pedido_status",
        username: "dono",
        message: "publicou uma promoção: 'Ganhe Borda de Catupiry grátis pedindo qualquer pizza grande salgada nesta semana!' 🏷️",
        timeString: "há 1h",
        read: true
      }
    ];
    setNotifications(seedNotifs);
  }, []);

  // Long polling simulation to fetch and show real-time changes
  useEffect(() => {
    const timer = setInterval(() => {
      fetchPizzas();
      fetchOrders();
      fetchConfig();
    }, 4000); // Poll database updates each 4s for real-time menu and orders syncing

    return () => clearInterval(timer);
  }, []);

  // Poll user profile to keep points in sync
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/users/${currentUser.username}`);
        if (res.ok) {
          const data = await res.json();
          if (data.points !== undefined && data.points !== currentUser.points) {
            setCurrentUser(prev => {
              if (!prev) return null;
              const updated = { ...prev, points: data.points };
              localStorage.setItem("pizzato_user", JSON.stringify(updated));
              return updated;
            });
          }
        }
      } catch (err) {
        console.error("Erro ao sincronizar pontos do usuário:", err);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Fetch functions
  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        if (data.pizzeriaName !== undefined) setPizzeriaName(data.pizzeriaName);
        if (data.pizzeriaLogo !== undefined) setPizzeriaLogo(data.pizzeriaLogo);
        if (data.categories !== undefined) setCategories(data.categories);
        if (data.demoMode !== undefined) setDemoMode(data.demoMode);
        if (data.checkoutUrl !== undefined) setCheckoutUrl(data.checkoutUrl);
        if (data.checkoutButtonText !== undefined) setCheckoutButtonText(data.checkoutButtonText);
        if (data.sitePrice !== undefined) setSitePrice(Number(data.sitePrice));
        if (data.siteDriveLink !== undefined) setSiteDriveLink(data.siteDriveLink);
        if (data.siteMpToken !== undefined) setSiteMpToken(data.siteMpToken);
        if (data.stories !== undefined) setStories(data.stories);
        if (data.bordas !== undefined) setBordas(data.bordas);
        if (data.meioMeioEnabled !== undefined) setMeioMeioEnabled(data.meioMeioEnabled === true);
        if (data.meioMeioPriceMode !== undefined) setMeioMeioPriceMode(data.meioMeioPriceMode);
        if (data.tremEnabled !== undefined) setTremEnabled(data.tremEnabled === true);
        if (data.tremMaxFlavors !== undefined) setTremMaxFlavors(Number(data.tremMaxFlavors));
        if (data.convenienciaPromoEnabled !== undefined) setConvenienciaPromoEnabled(data.convenienciaPromoEnabled === true);
        if (data.convenienciaDiscountPercent !== undefined) setConvenienciaDiscountPercent(data.convenienciaDiscountPercent);
        if (data.pixKey !== undefined) setPixKey(data.pixKey);
        if (data.mpAccessToken !== undefined) setMpAccessToken(data.mpAccessToken);
        if (data.mpEnabled !== undefined) setMpEnabled(data.mpEnabled === true);
        if (data.pointsName !== undefined) setPointsName(data.pointsName);
        if (data.pointsPerPizza !== undefined) setPointsPerPizza(Number(data.pointsPerPizza));
        if (data.pointsEnabled !== undefined) setPointsEnabled(data.pointsEnabled === true);
        if (data.pixEnabled !== undefined) setPixEnabled(data.pixEnabled === true);
        if (data.creditCardEnabled !== undefined) setCreditCardEnabled(data.creditCardEnabled === true);
        if (data.debitCardEnabled !== undefined) setDebitCardEnabled(data.debitCardEnabled === true);
        if (data.adminPhone !== undefined) setAdminPhone(data.adminPhone);
      }
    } catch (err) {
      console.error("Erro ao buscar configurações", err);
    }
  };

  const handleUpdateSalesConfig = async (demo: boolean, url: string, btnText: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoMode: demo, checkoutUrl: url, checkoutButtonText: btnText })
      });
      if (res.ok) {
        setDemoMode(demo);
        setCheckoutUrl(url);
        setCheckoutButtonText(btnText);
        return true;
      }
    } catch (err) {
      console.error("Erro ao atualizar configurações de vendas", err);
    }
    return false;
  };

  const handleLoadDemoCatalog = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/config/load-demo-catalog", {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPizzas(data.pizzas);
          setStories(data.stories);
          return true;
        }
      }
    } catch (err) {
      console.error("Erro ao carregar cardápio demonstrativo", err);
    }
    return false;
  };

  const handleUpdatePizzeriaName = async (name: string, logo?: string): Promise<boolean> => {
    try {
      const payload: any = { pizzeriaName: name };
      if (logo !== undefined) payload.pizzeriaLogo = logo;
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setPizzeriaName(name);
        if (logo !== undefined) setPizzeriaLogo(logo);
        return true;
      }
    } catch (err) {
      console.error("Erro ao atualizar nome da pizzaria", err);
    }
    return false;
  };

  const handleAddStory = async (storyData: { title: string; emoji: string; image: string; header: string; description: string }): Promise<boolean> => {
    try {
      const newStory: Story = {
        id: `story_${Date.now()}`,
        ...storyData
      };
      const success = await handleUpdateConfigWithExtra({
        stories: [...stories, newStory]
      });
      return success;
    } catch (err) {
      console.error("Erro ao adicionar story", err);
      return false;
    }
  };

  const handleDeleteStory = async (storyId: string): Promise<boolean> => {
    try {
      const success = await handleUpdateConfigWithExtra({
        stories: stories.filter(s => s.id !== storyId)
      });
      return success;
    } catch (err) {
      console.error("Erro ao excluir story", err);
      return false;
    }
  };

  const handleUpdateConfigWithExtra = async (params: {
    stories?: Story[];
    bordas?: Borda[];
    categories?: { id: string; emoji: string; label: string }[];
    meioMeioEnabled?: boolean;
    meioMeioPriceMode?: "max" | "average";
    tremEnabled?: boolean;
    tremMaxFlavors?: number;
    convenienciaPromoEnabled?: boolean;
    convenienciaDiscountPercent?: number;
    pixKey?: string;
    mpAccessToken?: string;
    mpEnabled?: boolean;
    pointsName?: string;
    pointsPerPizza?: number;
    pointsEnabled?: boolean;
    niche?: FoodNiche;
    pixEnabled?: boolean;
    creditCardEnabled?: boolean;
    debitCardEnabled?: boolean;
    sitePrice?: number;
    siteDriveLink?: string;
    siteMpToken?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stories !== undefined) setStories(data.stories);
        if (data.bordas !== undefined) setBordas(data.bordas);
        if (data.categories !== undefined) setCategories(data.categories);
        if (data.meioMeioEnabled !== undefined) setMeioMeioEnabled(data.meioMeioEnabled === true);
        if (data.meioMeioPriceMode !== undefined) setMeioMeioPriceMode(data.meioMeioPriceMode);
        if (data.tremEnabled !== undefined) setTremEnabled(data.tremEnabled === true);
        if (data.tremMaxFlavors !== undefined) setTremMaxFlavors(Number(data.tremMaxFlavors));
        if (data.convenienciaPromoEnabled !== undefined) setConvenienciaPromoEnabled(data.convenienciaPromoEnabled === true);
        if (data.convenienciaDiscountPercent !== undefined) setConvenienciaDiscountPercent(data.convenienciaDiscountPercent);
        if (data.pixKey !== undefined) setPixKey(data.pixKey);
        if (data.mpAccessToken !== undefined) setMpAccessToken(data.mpAccessToken);
        if (data.mpEnabled !== undefined) setMpEnabled(data.mpEnabled === true);
        if (data.pointsName !== undefined) setPointsName(data.pointsName);
        if (data.pointsPerPizza !== undefined) setPointsPerPizza(Number(data.pointsPerPizza));
        if (data.pointsEnabled !== undefined) setPointsEnabled(data.pointsEnabled === true);
        if (data.niche !== undefined) setNiche(data.niche as FoodNiche);
        if (data.pixEnabled !== undefined) setPixEnabled(data.pixEnabled === true);
        if (data.creditCardEnabled !== undefined) setCreditCardEnabled(data.creditCardEnabled === true);
        if (data.debitCardEnabled !== undefined) setDebitCardEnabled(data.debitCardEnabled === true);
        if (data.sitePrice !== undefined) setSitePrice(Number(data.sitePrice));
        if (data.siteDriveLink !== undefined) setSiteDriveLink(data.siteDriveLink);
        if (data.siteMpToken !== undefined) setSiteMpToken(data.siteMpToken);
        return true;
      }
    } catch (e) {
      console.error("Erro ao atualizar configurações extras", e);
    }
    return false;
  };

  const handleAddCategory = async (category: { id: string; emoji: string; label: string }): Promise<boolean> => {
    try {
      const updatedCategories = [...categories, category];
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: updatedCategories })
      });
      if (res.ok) {
        setCategories(updatedCategories);
        return true;
      }
    } catch (err) {
      console.error("Erro ao adicionar categoria", err);
    }
    return false;
  };

  const handleDeleteCategory = async (id: string): Promise<boolean> => {
    try {
      const updatedCategories = categories.filter(c => c.id !== id);
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: updatedCategories })
      });
      if (res.ok) {
        setCategories(updatedCategories);
        return true;
      }
    } catch (err) {
      console.error("Erro ao excluir categoria", err);
    }
    return false;
  };

  const fetchPizzas = async () => {
    try {
      const res = await fetch("/api/pizzas");
      if (res.ok) {
        const data = await res.json();
        setPizzas(data);
      }
    } catch (err) {
      console.error("Erro ao buscar pizzas", err);
    } finally {
      setIsLoadingPizzas(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data: Order[] = await res.json();
        setOrders(data);

        // Automatic status change notifications listener for the logged-in client
        if (currentUser) {
          const clientOrders = data.filter(o => o.clientUsername === currentUser.username || o.clientName === currentUser.name);
          
          clientOrders.forEach(order => {
            const oldStatus = prevOrdersStatusRef.current[order.id];
            
            // Trigger notification only if the status has changed and we had a previous status recorded
            if (oldStatus !== undefined && oldStatus !== order.status) {
              const pizzaNames = order.items.map(it => it.name).join(", ");
              let msg = "";
              
              if (order.status === "PREPARING") {
                msg = `notificou: 'Sua pizza ${pizzaNames} está sendo preparada no forno de lenha! 🔥'`;
              } else if (order.status === "OUT_FOR_DELIVERY") {
                msg = `notificou: 'Sua pizza ${pizzaNames} saiu para entrega, chega quentinha em 15 a 25 min! 🛵'`;
              } else if (order.status === "DELIVERED") {
                msg = `notificou: 'Sua pizza ${pizzaNames} foi entregue com sucesso! Bom apetite! 🎉🍕'`;
              } else if (order.status === "PENDING") {
                msg = `notificou: 'Seu pedido da pizza ${pizzaNames} foi recebido e está aguardando confirmação. ⏳'`;
              } else if (order.status === "CANCELLED") {
                msg = `notificou: 'Infelizmente seu pedido de ${pizzaNames} foi cancelado. Se tiver dúvidas, entre em contato conosco! 😔'`;
              }
              
              if (msg) {
                triggerNotificationPush({
                  id: `notif-status-${order.id}-${order.status}-${Date.now()}`,
                  type: "pedido_status",
                  username: "dono",
                  message: msg,
                  orderId: order.id,
                  timeString: "Agora",
                  read: false
                });
              }
            }
            
            // Cache current status
            prevOrdersStatusRef.current[order.id] = order.status;
          });
        }

        // Update trackingOrderId instance if matches
        if (trackingOrderId) {
          const matched = data.find((o: Order) => o.id === trackingOrderId);
          // If status changes to OUT_FOR_DELIVERY and client hasn't been notified yet
          if (matched && matched.status === "OUT_FOR_DELIVERY") {
            const pizzaNames = matched.items.map(it => it.name).join(", ");
            triggerNotificationPush({
              id: `notif-${Date.now()}`,
              type: "pedido_status",
              username: "dono",
              message: `enviou um status do seu pedido: 'Sua pizza ${pizzaNames} saiu para entrega com o motoboy! Acompanhe pelo GPS.' 🛵`,
              timeString: "Agora",
              orderId: matched.id,
              read: false
            });
          }
        }
      }
    } catch (err) {
      console.error("Erro ao buscar pedidos", err);
    }
  };

  // Profile updaters
  const handleUpdateProfileDetails = async (
    name: string,
    phone: string,
    cep: string,
    street: string,
    number: string,
    complement: string,
    neighborhood: string,
    city: string,
    state: string,
    username?: string,
    password?: string,
    bio?: string
  ) => {
    // Call server API for persistent state change!
    if (currentUser) {
      try {
        const response = await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentUsername: currentUser.username,
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
            bio
          })
        });
        const data = await response.json();
        if (!response.ok) {
          alert(data.error || "Erro ao atualizar dados.");
          return;
        }
        
        // Update local React state and storage with response data
        const updatedUser = data.user;
        setCurrentUser(updatedUser);
        localStorage.setItem("pizzato_user", JSON.stringify(updatedUser));
        
        setClientName(updatedUser.name);
        setClientPhone(updatedUser.phone || "");
        setClientCep(updatedUser.cep || "");
        setClientStreet(updatedUser.street || "");
        setClientNumber(updatedUser.number || "");
        setClientComplement(updatedUser.complement || "");
        setClientNeighborhood(updatedUser.neighborhood || "");
        setClientCity(updatedUser.city || "");
        setClientState(updatedUser.state || "");

        localStorage.setItem("pizzato_client_name", updatedUser.name);
        localStorage.setItem("pizzato_client_phone", updatedUser.phone || "");
        localStorage.setItem("pizzato_client_cep", updatedUser.cep || "");
        localStorage.setItem("pizzato_client_street", updatedUser.street || "");
        localStorage.setItem("pizzato_client_number", updatedUser.number || "");
        localStorage.setItem("pizzato_client_complement", updatedUser.complement || "");
        localStorage.setItem("pizzato_client_neighborhood", updatedUser.neighborhood || "");
        localStorage.setItem("pizzato_client_city", updatedUser.city || "");
        localStorage.setItem("pizzato_client_state", updatedUser.state || "");

        const comb = `${updatedUser.street || ""}, ${updatedUser.number || ""}${updatedUser.complement ? " - " + updatedUser.complement : ""} - ${updatedUser.neighborhood || ""}, ${updatedUser.city || ""} - ${updatedUser.state || ""} (CEP: ${updatedUser.cep || ""})`;
        localStorage.setItem("pizzato_client_addr", comb);
        
        // Show success notification!
        const successNotify: SystemNotification = {
          id: `profile-${Date.now()}`,
          type: "pedido_status",
          username: "dono",
          message: `confirmou a alteração cadastral: 'Seus dados de usuário e endereço foram atualizados com sucesso no sistema!' ✨`,
          timeString: "Agora",
          read: false
        };
        setNotifications(prev => [successNotify, ...prev]);
        setActivePush(successNotify);
        setTimeout(() => setActivePush(null), 4000);
      } catch (err) {
        console.error("Erro ao atualizar perfil:", err);
        alert("Erro de rede ao salvar perfil.");
      }
    } else {
      // Fallback fallback if no logged in session
      setClientName(name);
      setClientPhone(phone);
      setClientCep(cep);
      setClientStreet(street);
      setClientNumber(number);
      setClientComplement(complement);
      setClientNeighborhood(neighborhood);
      setClientCity(city);
      setClientState(state);
    }
  };

  const handleLoginSuccess = (user: {
    name: string;
    username: string;
    isAdmin: boolean;
    phone?: string;
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  }) => {
    setCurrentUser(user);
    localStorage.setItem("pizzato_user", JSON.stringify(user));

    setClientName(user.name);
    localStorage.setItem("pizzato_client_name", user.name);

    if (user.phone) {
      setClientPhone(user.phone);
      localStorage.setItem("pizzato_client_phone", user.phone);
    }
    if (user.cep) {
      setClientCep(user.cep);
      localStorage.setItem("pizzato_client_cep", user.cep);
    }
    if (user.street) {
      setClientStreet(user.street);
      localStorage.setItem("pizzato_client_street", user.street);
    }
    if (user.number) {
      setClientNumber(user.number);
      localStorage.setItem("pizzato_client_number", user.number);
    }
    if (user.complement) {
      setClientComplement(user.complement);
      localStorage.setItem("pizzato_client_complement", user.complement);
    } else {
      setClientComplement("");
      localStorage.setItem("pizzato_client_complement", "");
    }
    if (user.neighborhood) {
      setClientNeighborhood(user.neighborhood);
      localStorage.setItem("pizzato_client_neighborhood", user.neighborhood);
    }
    if (user.city) {
      setClientCity(user.city);
      localStorage.setItem("pizzato_client_city", user.city);
    }
    if (user.state) {
      setClientState(user.state);
      localStorage.setItem("pizzato_client_state", user.state);
    }

    if (user.isAdmin) {
      setIsAdminMode(true);
      setActiveTab("admin");
    } else {
      setIsAdminMode(false);
      setActiveTab("feed");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("pizzato_user");
    setIsAdminMode(false);
    setActiveTab("feed");
  };

  const handleUpdateAvatar = (avatarUrl: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, avatarUrl };
    setCurrentUser(updated);
    localStorage.setItem("pizzato_user", JSON.stringify(updated));
  };

  const handleUpdateCartItemQuantity = (id: string, newQty: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  // Cart operations
  const handleAddToCart = (item: OrderItem) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(x => x.id === item.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });

    // Fire simulated Instagram toast
    triggerNotificationPush({
      id: `toast-${Date.now()}`,
      type: "curtida",
      username: "dono",
      message: `notou sua sacola: 'Você adicionou "${item.name}" no carrinho de compras. Venha finalizar seu pedido por Direct!' 👜`,
      timeString: "Agora",
      read: false
    });
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(x => x.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Placing order API REST driver
  const handlePlaceOrder = async (orderData: any): Promise<Order | null> => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const { order, user } = await res.json();
        if (user) {
          setCurrentUser(user);
          localStorage.setItem("pizzato_user", JSON.stringify(user));
        }
        // pre-unshift orders list
        setOrders(prev => [order, ...prev]);
        return order;
      }
      return null;
    } catch (err) {
      console.error("Erro ao finalizar pedido", err);
      return null;
    }
  };

  // Modifying orders status from admin dashboard
  const handleUpdateOrderStatus = async (id: string, status: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchOrders();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro ao atualizar status", err);
      return false;
    }
  };

  // Adding pizzas (Admin)
  const handleAddPizza = async (pizzaData: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/pizzas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pizzaData)
      });
      if (res.ok) {
        await fetchPizzas();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro ao criar pizza", err);
      return false;
    }
  };

  // Editting pizzas (Admin)
  const handleEditPizza = async (id: string, pizzaData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/pizzas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pizzaData)
      });
      if (res.ok) {
        await fetchPizzas();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro ao salvar edits", err);
      return false;
    }
  };

  // Deleting pizzas (Admin)
  const handleDeletePizza = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/pizzas/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchPizzas();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro ao excluir", err);
      return false;
    }
  };

  const handleLikePizza = (pizzaId: string) => {
    const pName = pizzas.find(p => p.id === pizzaId)?.name || "opção";
    triggerNotificationPush({
      id: `like-${Date.now()}`,
      type: "curtida",
      username: "dono",
      message: `agradeceu seu feedback: 'Ficamos muito felizes que você gostou do item "${pName}"! Bom apetite!' ❤️`,
      timeString: "Agora",
      read: false
    });
  };

  // Notification management (mimics app alerts)
  const triggerNotificationPush = (notif: SystemNotification) => {
    setNotifications(prev => [notif, ...prev]);
    setActivePush(notif);
    setTimeout(() => {
      setActivePush(null);
    }, 4500); // floating banner stays on screen for 4.5s
  };

  const handleViewNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setNotificationsOpen(false);

    const match = notifications.find(n => n.id === id);
    if (match && match.orderId) {
      setTrackingOrderId(match.orderId);
    }
  };

  const handleAdminTriggeredNotification = (order: Order, status: string) => {
    const pizzaNames = order.items.map(it => it.name).join(", ");
    let msg = `notificou: 'O progresso do seu pedido #${order.id} foi alterado.'`;
    if (status === "PREPARING") {
      msg = `notificou: 'Sua pizza ${pizzaNames} está sendo preparada no forno de lenha! 🔥'`;
    } else if (status === "OUT_FOR_DELIVERY") {
      msg = `notificou: 'Sua pizza ${pizzaNames} saiu para entrega, chega quentinha em 15 a 25 min! 🛵'`;
    } else if (status === "DELIVERED") {
      msg = `notificou: 'Sua pizza ${pizzaNames} foi entregue com sucesso! Bom apetite! 🎉🍕'`;
    }

    triggerNotificationPush({
      id: `notif-${Date.now()}`,
      type: "pedido_status",
      username: "dono",
      message: msg,
      orderId: order.id,
      timeString: "Agora",
      read: false
    });
  };

  // Search and Category filter
  const filteredPizzas = pizzas.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                          p.ingredients.some(ing => ing.toLowerCase().includes(searchValue.toLowerCase()));
    const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Translate Status helper
  const translateStatusName = (st: string) => {
    switch(st) {
      case "PENDING": return "Aguardando confirmação comercial";
      case "PREPARING": return "Sendo assada no forno de lenha";
      case "OUT_FOR_DELIVERY": return "Saiu para entrega com o motoboy";
      case "DELIVERED": return "Entregue! Desejamos uma excelente refeição";
      default: return st;
    }
  };

  if (activeTab === "comprar_site") {
    return (
      <SiteSalesPage
        onBackToMenu={() => setActiveTab("feed")}
        sitePrice={sitePrice}
        siteDriveLink={siteDriveLink}
        pizzeriaName={pizzeriaName}
      />
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-[#fafafa] flex flex-col relative overflow-hidden" id="app-frame">
      
      {/* 🚀 REAL-TIME SYSTEM PUSH NOTIFICATION BANNER (INSTAGRAM BANNER STYLE) */}
      {activePush && (
        <div 
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in slide-in-from-top-12 duration-300"
          id="system-floating-toast"
        >
          <div className="bg-gray-900 border border-gray-800 text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink p-[1.5px] shrink-0">
              <div className="w-full h-full rounded-full border border-gray-900 bg-instagram-pink flex items-center justify-center text-white font-serif text-[10px] font-black">
                PZ
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-neutral-200">@{activePush.username}</span>
                <span className="text-[9px] text-gray-400">agora</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-snug truncate mt-0.5">{activePush.message}</p>
            </div>
            
            {/* Action button inside toast */}
            {activePush.orderId && (
              <button
                onClick={() => {
                  setTrackingOrderId(activePush.orderId!);
                  setActivePush(null);
                }}
                className="px-2 py-1 bg-instagram-blue text-white text-[9px] font-black rounded-md flex items-center shrink-0 transition-all hover:brightness-105"
              >
                Rastrear
              </button>
            )}

            <button onClick={() => setActivePush(null)} className="text-gray-400 hover:text-white p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}


      {/* --- FLOATING TRACKING GPS VIEW MODAL (When tracking is focused) --- */}
      <AnimatePresence>
        {trackingOrderId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-0 md:p-6 backdrop-blur-xs"
            id="radar-tracking-layout"
          >
          {(() => {
            const currentTrackedOrder = orders.find(o => o.id === trackingOrderId);
            
            if (!currentTrackedOrder) {
              return (
                <div className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-2xl space-y-4">
                  <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
                  <h3 className="font-bold text-gray-900 text-lg">Transmissão não localizada</h3>
                  <p className="text-xs text-gray-500">
                    O link de rastreamento de pedido {trackingOrderId} expirou ou é estruturalmente incorreto.
                  </p>
                  <button
                    onClick={() => {
                      setTrackingOrderId(null);
                      // Clear URL get parameter cleanly without page reloads
                      window.history.pushState({}, document.title, window.location.pathname);
                    }}
                    className="w-full py-2 bg-instagram-pink text-white rounded-xl text-xs font-bold"
                  >
                    Voltar para o Feed
                  </button>
                </div>
              );
            }

            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="w-full max-w-xl h-full md:h-auto md:max-h-[85vh] bg-white rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                id="radar-card"
              >
                {/* Header title */}
                <div className="px-5 py-4 border-b border-gray-150 flex items-center justify-between bg-neutral-900 text-white shrink-0">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-yellow-400 animate-bounce" />
                    <div>
                      <h4 className="font-bold text-xs">GPS de Entrega em Tempo Real</h4>
                      <p className="text-[8px] font-mono uppercase text-gray-400 leading-none">Pedido: #{currentTrackedOrder.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setTrackingOrderId(null);
                      window.history.pushState({}, document.title, window.location.pathname);
                    }}
                    className="p-1 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tracking Progress timeline segment */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between text-center select-none text-[10px] font-bold">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</div>
                    <span className="text-gray-900 mt-1">Pedido Recebido</span>
                  </div>
                  <div className="h-0.5 bg-gray-300 flex-1 my-3">
                    <div className={`h-full bg-emerald-500 ${currentTrackedOrder.status !== "PENDING" ? "w-full" : "w-0"}`}></div>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      currentTrackedOrder.status !== "PENDING" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      {currentTrackedOrder.status !== "PENDING" ? "✓" : "2"}
                    </div>
                    <span className={`${currentTrackedOrder.status !== "PENDING" ? "text-gray-900" : "text-gray-400"} mt-1`}>No Forno 🔥</span>
                  </div>
                  <div className="h-0.5 bg-gray-300 flex-1 my-3">
                    <div className={`h-full bg-emerald-500 ${
                      currentTrackedOrder.status === "OUT_FOR_DELIVERY" || currentTrackedOrder.status === "DELIVERED" ? "w-full" : "w-0"
                    }`}></div>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      currentTrackedOrder.status === "OUT_FOR_DELIVERY" || currentTrackedOrder.status === "DELIVERED"
                        ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      {currentTrackedOrder.status === "DELIVERED" ? "✓" : "3"}
                    </div>
                    <span className={`${
                      currentTrackedOrder.status === "OUT_FOR_DELIVERY" || currentTrackedOrder.status === "DELIVERED"
                        ? "text-gray-900" : "text-gray-400"
                    } mt-1`}>Em Rota 🛵</span>
                  </div>
                  <div className="h-0.5 bg-gray-300 flex-1 my-3">
                    <div className={`h-full bg-emerald-500 ${currentTrackedOrder.status === "DELIVERED" ? "w-full" : "w-0"}`}></div>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      currentTrackedOrder.status === "DELIVERED" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      {currentTrackedOrder.status === "DELIVERED" ? "✓" : "4"}
                    </div>
                    <span className={`${currentTrackedOrder.status === "DELIVERED" ? "text-gray-900" : "text-gray-400"} mt-1`}>Entregue!</span>
                  </div>
                </div>

                {/* MAP AREA */}
                <div className="flex-1 min-h-[300px] md:min-h-[360px] relative bg-sky-100 p-4">
                  {/* Map Roads vectors */}
                  <div className="absolute inset-x-0 top-1/3 h-3.5 bg-white shadow-2xs rotate-[-2deg]"></div>
                  <div className="absolute inset-x-0 top-2/3 h-3.5 bg-white shadow-2xs rotate-[1deg]"></div>
                  <div className="absolute inset-y-0 left-1/4 w-3.5 bg-white shadow-2xs rotate-[20deg]"></div>
                  <div className="absolute inset-y-0 right-1/4 w-3.5 bg-white shadow-2xs rotate-[-15deg]"></div>

                  {/* Pin: Pizzato */}
                  <div className="absolute top-[25%] left-[15%] text-center z-10">
                    <span className="w-10 h-10 bg-instagram-pink text-white rounded-full flex items-center justify-center font-sans font-black text-sm shadow-xl border-2 border-white">
                      PZ
                    </span>
                    <span className="text-[9px] font-black tracking-tight text-gray-900 bg-white/95 px-2 py-0.5 rounded-lg mt-1 block">{pizzeriaName}</span>
                  </div>

                  {/* Pin: client */}
                  <div className="absolute bottom-[20%] right-[15%] text-center z-10">
                    <span className="w-10 h-10 bg-[#0095f6] text-white rounded-full flex items-center justify-center text-lg shadow-xl border-2 border-white">
                      🏠
                    </span>
                    <span className="text-[9px] font-black tracking-tight text-gray-900 bg-white/95 px-2 py-0.5 rounded-lg mt-1 block">Sua Casa</span>
                  </div>

                  {/* Rider sprite */}
                  {currentTrackedOrder.status === "OUT_FOR_DELIVERY" && (() => {
                    const pos = getRiderPosition(deliveryProgress);
                    return (
                      <div 
                        className="absolute z-20 text-center transition-all duration-1000 ease-linear transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: pos.left, top: pos.top }}
                      >
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-lg shadow-2xl border-2 border-white animate-map-pulse">
                          🛵
                        </div>
                        <span className="text-[9px] font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-lg mt-1 block uppercase font-sans shrink-0 whitespace-nowrap">
                          Motoboy no GPS • {deliveryProgress}%
                        </span>
                      </div>
                    );
                  })()}

                  {currentTrackedOrder.status === "PREPARING" && (
                    <div className="absolute top-[28%] left-[28%] z-20 text-center">
                      <div className="w-9 h-9 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm shadow-xl border-2 border-white animate-pulse">
                        🍳
                      </div>
                      <span className="text-[8px] font-semibold text-orange-600 bg-orange-50 px-1 rounded-md block mt-0.5">Assando sua pizza...</span>
                    </div>
                  )}

                  {currentTrackedOrder.status === "PENDING" && (
                    <div className="absolute top-[28%] left-[28%] z-20 text-center">
                      <div className="w-9 h-9 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm shadow-xl border-2 border-white">
                        ⏳
                      </div>
                      <span className="text-[8px] font-semibold text-amber-600 bg-amber-50 px-1 rounded-sm block mt-0.5">Aguardando Forno</span>
                    </div>
                  )}

                  {currentTrackedOrder.status === "DELIVERED" && (
                    <div className="absolute bottom-[22%] right-[25%] z-20 text-center">
                      <div className="w-10 h-10 bg-gradient-to-tr from-instagram-yellow to-instagram-pink rounded-full flex items-center justify-center text-lg shadow-2xl border-2 border-white">
                        🎉
                      </div>
                      <span className="text-[9px] font-black text-emerald-600 bg-white border border-emerald-200 px-2 rounded-lg block mt-0.5">ENTREGUE!</span>
                    </div>
                  )}
                </div>

                {/* Dashboard metadata footer */}
                <div className="p-5 bg-white border-t border-gray-150 space-y-4 shrink-0 font-sans">
                  <div className="flex justify-between gap-4 items-baseline">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none">Status</span>
                      <h3 className="font-extrabold text-base text-gray-900 mt-1 truncate">
                        {translateStatusName(currentTrackedOrder.status)}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none">Previsão</span>
                      <span className="font-black text-base text-instagram-pink tracking-tight font-mono block mt-1">
                        {currentTrackedOrder.status === "OUT_FOR_DELIVERY"
                          ? `${Math.max(1, Math.round(((100 - deliveryProgress) / 100) * 20))} min (GPS)`
                          : currentTrackedOrder.status === "DELIVERED"
                          ? "Entregue!"
                          : "15 - 25 min"
                        }
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl space-y-1.5 text-xs text-gray-600 border border-neutral-100">
                    <p className="truncate"><span className="font-semibold text-gray-900">Entregar em:</span> {currentTrackedOrder.clientAddress}</p>
                    <p className="truncate"><span className="font-semibold text-gray-900">Itens e Valores:</span> {currentTrackedOrder.items.map(it => `${it.quantity}x ${it.name}`).join(", ")} • <span className="font-semibold font-mono text-gray-900">R$ {currentTrackedOrder.totalPrice.toFixed(2)}</span></p>
                  </div>

                  <button
                    onClick={() => {
                      setTrackingOrderId(null);
                      window.history.pushState({}, document.title, window.location.pathname);
                    }}
                    className="w-full py-3 bg-neutral-900 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1 hover:bg-neutral-800 transition-colors"
                  >
                    Voltar para o Feed PizzatoGram
                  </button>
                </div>
              </motion.div>
            );
          })()}
        </motion.div>
      )}
    </AnimatePresence>


      {/* --- RECONSTRUCTING INSTAGRAM BAR --- */}
      <InstagramHeader
        pizzeriaName={pizzeriaName}
        pizzeriaLogo={pizzeriaLogo}
        onSearch={setSearchValue}
        searchValue={searchValue}
        cartCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
        onOpenCartDirect={() => {
          setActiveTab("direct");
          setNotificationsOpen(false);
        }}
        notifications={notifications}
        onOpenNotifications={() => {
          setNotificationsOpen(!notificationsOpen);
        }}
        notificationsOpen={notificationsOpen}
        onViewNotification={handleViewNotification}
        currentUser={currentUser}
        onGoToAdmin={() => setActiveTab("admin")}
        onLogout={handleLogout}
        onGoToProfile={() => {
          setActiveTab("feed");
          setNotificationsOpen(false);
        }}
        activeTab={activeTab}
        visible={showHeader}
        onLoginClick={() => setShowLoginModal(true)}
      />


      {/* --- CENTRAL MAIN CANVAS SCROLLER --- */}
      <main 
        onScroll={handleMainScroll}
        className="flex-1 px-4 sm:px-6 pb-20 pt-[62px] sm:pt-[72px] max-w-5xl mx-auto w-full overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          {/* VIEW 1: HOME POST FEED LAYOUT */}
          {activeTab === "feed" && (
            <motion.div
              key="feed"
              id="view-feed-layout"
              className="space-y-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              
              {/* INSTAGRAM-STYLE STORIES BAR - CLEAN AND TRANSPARENT (ONLY CIRCULAR THUMBNAILS) */}
              <div className="py-2.5 bg-white sm:bg-transparent border-t border-b sm:border-t-0 sm:border-b border-gray-100 mb-0 px-1" id="instagram-stories-bar">
                <div className="flex items-center gap-4 overflow-x-auto py-1 scrollbar-none">
                  {/* Plus Creator button inside Stories list for quick access */}
                  {currentUser?.isAdmin && (
                    <button
                      onClick={() => setCreatePostOpen(true)}
                      className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none cursor-pointer"
                    >
                      <div className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full p-[2px] bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center transition-all group-hover:from-instagram-yellow group-hover:via-instagram-orange group-hover:to-instagram-pink">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-instagram-pink shadow-xs font-extrabold p-[1.5px]">
                          <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-instagram-pink group-hover:bg-white transition-colors">
                            <Plus className="w-5 h-5 font-black group-hover:scale-110 transition-transform" />
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 leading-tight">Novo</span>
                    </button>
                  )}

                  {/* Dynamic Stories List */}
                  {stories.length === 0 ? (
                    <div className="flex-1 flex flex-col items-start justify-center pl-2">
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Stories do Dia</p>
                      <p className="text-[9px] text-gray-400 font-medium">Nenhum story ativo hoje.</p>
                    </div>
                  ) : (
                    stories.map((story, index) => (
                      <button
                        key={story.id}
                        onClick={() => {
                          setSelectedStoryIndex(index);
                          setStoryViewerOpen(true);
                        }}
                        className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none cursor-pointer"
                      >
                        <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-full p-[2.5px] bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform duration-150">
                          <div className="w-full h-full rounded-full bg-white p-[1.5px] flex items-center justify-center shadow-inner">
                            {story.image ? (
                              <img
                                src={story.image}
                                alt={story.title}
                                className="w-full h-full rounded-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  // Fallback to title placeholder if loading fails
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-red-100 to-pink-150 flex items-center justify-center text-sm">
                                {story.emoji || "🍕"}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 max-w-[62px] truncate leading-tight mt-0.5">
                          {story.title}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* 2. Customer Profile Header representation */}
              <ProfileSection
                clientName={clientName}
                clientPhone={clientPhone}
                clientCep={clientCep}
                clientStreet={clientStreet}
                clientNumber={clientNumber}
                clientComplement={clientComplement}
                clientNeighborhood={clientNeighborhood}
                clientCity={clientCity}
                clientState={clientState}
                ordersCount={orders.filter(o => o.clientName === currentUser?.name).length}
                onUpdateProfileDetails={handleUpdateProfileDetails}
                currentUser={currentUser}
                onUpdateAvatar={handleUpdateAvatar}
                totalPizzasCount={pizzas.length}
                pointsName={pointsName}
                pointsEnabled={pointsEnabled}
                niche={niche}
                onLoginClick={() => setShowLoginModal(true)}
              />

              {/* Highlights (Categorias) Row */}
              <div className="py-2.5 border-t border-b border-gray-150 bg-white p-4 rounded-xl shadow-2xs" id="highlights-categories-bar">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider text-center mb-3">
                  Destaques do Cardápio (Categorias)
                </h4>
                <div className="flex justify-center flex-wrap gap-4 sm:gap-6 overflow-x-auto py-1">
                  {[
                    { id: "Todos", emoji: "🍕", label: "Destaques" },
                    ...categories
                  ].map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer transition-transform duration-150 active:scale-95 group"
                      >
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] transition-all flex items-center justify-center ${
                          isSelected 
                            ? "bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink shadow-md" 
                            : "bg-gray-100 hover:bg-gray-200 border border-gray-200"
                        }`}>
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-lg sm:text-xl">
                            {cat.emoji}
                          </div>
                        </div>
                        <span className={`text-[10px] sm:text-xs tracking-tight ${isSelected ? "font-black text-instagram-pink" : "font-medium text-gray-600 group-hover:text-gray-900"}`}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-Tabs: Menu Posts vs Saved Favorites */}
              <div className="flex items-center justify-center gap-8 border-t border-gray-200 mt-4" id="profile-subtabs-bar">
                <button
                  type="button"
                  onClick={() => setProfileSubTab("menu")}
                  className={`flex items-center gap-1.5 py-4 border-t-2 -mt-[2px] transition-all cursor-pointer ${
                    profileSubTab === "menu"
                      ? "border-gray-900 text-gray-900 font-extrabold text-[11px] tracking-widest uppercase"
                      : "border-transparent text-gray-400 font-bold text-[11px] tracking-widest uppercase hover:text-gray-600"
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 shrink-0" />
                  <span>Publicações</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProfileSubTab("favorites")}
                  className={`flex items-center gap-1.5 py-4 border-t-2 -mt-[2px] transition-all cursor-pointer ${
                    profileSubTab === "favorites"
                      ? "border-gray-900 text-gray-900 font-extrabold text-[11px] tracking-widest uppercase"
                      : "border-transparent text-gray-400 font-bold text-[11px] tracking-widest uppercase hover:text-gray-600"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 shrink-0" />
                  <span>Salvos ({favoritePizzaIds.length})</span>
                </button>
              </div>

              {/* 3. Catalog / Favorites Post grids */}
              {profileSubTab === "menu" ? (
                isLoadingPizzas ? (
                  <div 
                    className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 pb-12 animate-in fade-in duration-200" 
                    id="main-pizzas-loading-grid"
                  >
                    {Array.from({ length: 6 }).map((_, index) => (
                      <PizzaPostCardSkeleton key={`skeleton-${index}`} />
                    ))}
                  </div>
                ) : filteredPizzas.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-gray-200 rounded-xl max-w-lg mx-auto animate-in fade-in duration-200" id="empty-feed">
                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-500">Nenhum item cadastrado neste quadrante.</p>
                    <p className="text-xs text-gray-400 mt-1">Busque por outro termo ou carregue o cardápio padrão nas configurações do adm!</p>
                  </div>
                ) : (
                  <div 
                    className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 pb-12 animate-in fade-in duration-200" 
                    id="main-pizzas-grid"
                  >
                    {filteredPizzas.map((pizza) => (
                      <PizzaPostCard
                        key={pizza.id}
                        pizza={pizza}
                        onSelect={(p) => setSelectedPizza(p)}
                        pointsEnabled={pointsEnabled}
                        niche={niche}
                      />
                    ))}
                  </div>
                )
              ) : (
                // Favorites Tab View
                (() => {
                  const favPizzas = pizzas.filter(p => favoritePizzaIds.includes(p.id));
                  return favPizzas.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-gray-200 rounded-xl max-w-lg mx-auto animate-in fade-in duration-200" id="empty-favorites-feed">
                      <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-gray-500">Nenhum item salvo nos favoritos.</p>
                      <p className="text-xs text-gray-400 mt-1">Abra qualquer item do menu e clique no ícone de salvar para adicioná-lo aos favoritos!</p>
                    </div>
                  ) : (
                    <div 
                      className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 pb-12 animate-in fade-in duration-200" 
                      id="favorites-pizzas-grid"
                    >
                      {favPizzas.map((pizza) => (
                        <PizzaPostCard
                          key={pizza.id}
                          pizza={pizza}
                          onSelect={(p) => setSelectedPizza(p)}
                          pointsEnabled={pointsEnabled}
                          niche={niche}
                        />
                      ))}
                    </div>
                  );
                })()
              )}
            </motion.div>
          )}

          {/* VIEW 2: CART / DIRECT MESSAGES INBOX VIEWPORT */}
          {activeTab === "direct" && (
            <motion.div
              key="direct"
              id="view-direct-layout"
              className="h-full"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <DirectMessagesContainer
                cartItems={cartItems}
                onRemoveItem={handleRemoveItem}
                onUpdateCartItemQuantity={handleUpdateCartItemQuantity}
                onClearCart={handleClearCart}
                clientName={clientName}
                clientPhone={clientPhone}
                clientCep={clientCep}
                clientStreet={clientStreet}
                clientNumber={clientNumber}
                clientComplement={clientComplement}
                clientNeighborhood={clientNeighborhood}
                clientCity={clientCity}
                clientState={clientState}
                onUpdateProfileDetails={handleUpdateProfileDetails}
                activeOrder={orders.length > 0 ? orders[0] : null}
                onPlaceOrder={handlePlaceOrder}
                onBackToFeed={() => setActiveTab("feed")}
                orders={orders}
                convenienciaPromoEnabled={convenienciaPromoEnabled}
                convenienciaDiscountPercent={convenienciaDiscountPercent}
                pizzeriaName={pizzeriaName}
                pixKey={pixKey}
                mpEnabled={mpEnabled}
                currentUser={currentUser}
                pointsName={pointsName}
                pointsEnabled={pointsEnabled}
                niche={niche}
                adminPhone={adminPhone}
                pixEnabled={pixEnabled}
                creditCardEnabled={creditCardEnabled}
                debitCardEnabled={debitCardEnabled}
                onRequestLogin={() => setShowLoginModal(true)}
              />
            </motion.div>
          )}

          {/* VIEW 3: ADMINISTRATIVE SYSTEM (Settings Profile dashboard) */}
          {activeTab === "admin" && (
            <motion.div
              key="admin"
              id="view-admin-layout"
              className="space-y-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <AdminPanel
                pizzas={pizzas}
                orders={orders}
                onAddPizza={handleAddPizza}
                onEditPizza={handleEditPizza}
                onDeletePizza={handleDeletePizza}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onAddNotificationFromAdmin={handleAdminTriggeredNotification}
                pizzeriaName={pizzeriaName}
                pizzeriaLogo={pizzeriaLogo}
                onUpdatePizzeriaName={handleUpdatePizzeriaName}
                categories={categories}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                demoMode={demoMode}
                checkoutUrl={checkoutUrl}
                checkoutButtonText={checkoutButtonText}
                onUpdateSalesConfig={handleUpdateSalesConfig}
                bordas={bordas}
                meioMeioEnabled={meioMeioEnabled}
                meioMeioPriceMode={meioMeioPriceMode}
                tremEnabled={tremEnabled}
                tremMaxFlavors={tremMaxFlavors}
                convenienciaPromoEnabled={convenienciaPromoEnabled}
                convenienciaDiscountPercent={convenienciaDiscountPercent}
                onUpdateConfigWithExtra={handleUpdateConfigWithExtra}
                onLoadDemoCatalog={handleLoadDemoCatalog}
                pixKey={pixKey}
                mpAccessToken={mpAccessToken}
                mpEnabled={mpEnabled}
                pointsName={pointsName}
                pointsPerPizza={pointsPerPizza}
                pointsEnabled={pointsEnabled}
                niche={niche}
                pixEnabled={pixEnabled}
                creditCardEnabled={creditCardEnabled}
                debitCardEnabled={debitCardEnabled}
                sitePrice={sitePrice}
                siteDriveLink={siteDriveLink}
                siteMpToken={siteMpToken}
              />
            </motion.div>
          )}


        </AnimatePresence>
      </main>


      {/* --- EXPANDABLE ZOOM POST DETAILS MODAL OVERLAY --- */}
      <AnimatePresence>
        {selectedPizza && (
          <PostDetailsModal
            pizza={selectedPizza}
            allPizzas={pizzas}
            onClose={() => setSelectedPizza(null)}
            onAddToCart={handleAddToCart}
            onLikePizza={handleLikePizza}
            bordas={bordas}
            meioMeioEnabled={meioMeioEnabled}
            meioMeioPriceMode={meioMeioPriceMode}
            tremEnabled={tremEnabled}
            tremMaxFlavors={tremMaxFlavors}
            isFavorite={favoritePizzaIds.includes(selectedPizza.id)}
            onToggleFavorite={handleToggleFavoritePizza}
            pizzeriaName={pizzeriaName}
            pizzeriaLogo={pizzeriaLogo}
            pointsName={pointsName}
            pointsEnabled={pointsEnabled}
            niche={niche}
          />
        )}
      </AnimatePresence>

      {/* --- VOLUNTARY / INTERCEPTED LOGIN OVERLAY MODAL --- */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-y-auto"
            id="auth-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm"
            >
              <InstagramLogin
                pizzeriaName={pizzeriaName}
                onLoginSuccess={(user) => {
                  handleLoginSuccess(user);
                  setShowLoginModal(false);
                }}
                onClose={() => setShowLoginModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- QUICK CREATION MODAL OVERLAY --- */}
      <CreatePostModal
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        isAdmin={!!currentUser?.isAdmin}
        categories={categories}
        stories={stories}
        onAddStory={handleAddStory}
        onDeleteStory={handleDeleteStory}
        onAddPizza={handleAddPizza}
      />

      {/* --- INSTAGRAM-STYLE STORIES VIEWER OVERLAY --- */}
      <StoryViewer
        stories={stories}
        initialStoryIndex={selectedStoryIndex}
        isOpen={storyViewerOpen}
        onClose={() => setStoryViewerOpen(false)}
      />


      {/* --- PERSISTENT FIXED BOTTOM NAV BAR --- */}
      <nav className={`fixed md:absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl bg-white border-t border-gray-200 py-2.5 px-6 flex justify-around z-45 shadow-lg md:rounded-t-2xl md:border-x transition-all duration-300 ease-in-out ${
        showBottomNav ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}>
        <button
          onClick={() => {
            setActiveTab("feed");
            setTrackingOrderId(null);
          }}
          className={`flex flex-col items-center gap-1.5 text-xs font-semibold ${activeTab === "feed" ? "text-instagram-pink font-extrabold" : "text-gray-500"}`}
        >
          <Grid className="w-6 h-6" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("direct");
            setTrackingOrderId(null);
          }}
          className={`flex flex-col items-center gap-1.5 text-xs font-semibold relative ${activeTab === "direct" ? "text-instagram-pink font-extrabold" : "text-gray-500"}`}
        >
          <ShoppingBag className="w-6 h-6" />
          {cartItems.length > 0 && (
            <span className="absolute top-0 right-3 bg-instagram-pink text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-xs">
              {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
            </span>
          )}
          <span>Carrinho</span>
        </button>

        {/* POST (+) QUICK ACCESS BUTTON */}
        {currentUser?.isAdmin && (
          <button
            onClick={() => {
              setCreatePostOpen(true);
            }}
            className={`flex flex-col items-center gap-1.5 text-xs font-semibold hover:text-instagram-pink transition-all ${
              createPostOpen ? "text-instagram-pink font-extrabold scale-110" : "text-gray-500"
            }`}
            id="btn-add-fast-nav"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink p-[1.5px] shadow-sm flex items-center justify-center -mt-1 hover:rotate-90 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <Plus className="w-4 h-4 text-instagram-orange font-black" />
              </div>
            </div>
            <span className="-mt-0.5">Postar</span>
          </button>
        )}

        {currentUser?.isAdmin && (
          <button
            onClick={() => {
              setActiveTab("admin");
              setTrackingOrderId(null);
            }}
            className={`flex flex-col items-center gap-1.5 text-xs font-semibold ${activeTab === "admin" ? "text-red-650 font-extrabold" : "text-gray-500"}`}
          >
            <Shield className="w-6 h-6" />
            <span>Admin</span>
          </button>
        )}
      </nav>

      {/* Floating button "Comprar este Site 🚀" follows client visually, visible everywhere except Admin tab */}
      {activeTab !== "admin" && activeTab !== "comprar_site" && (
        <button
          onClick={() => {
            setActiveTab("comprar_site");
            setTrackingOrderId(null);
          }}
          className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-instagram-pink via-instagram-orange to-instagram-purple text-white px-5 py-3.5 rounded-full shadow-2xl font-black text-xs sm:text-sm tracking-wide hover:scale-105 active:scale-95 transition-all animate-bounce flex items-center gap-2 cursor-pointer border border-white/20"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          <Sparkles className="w-4 h-4 fill-white animate-pulse" />
          <span>Comprar este Site 🚀</span>
        </button>
      )}

    </div>
  );
}
