import React, { useState } from "react";
import { PlusCircle, Trash2, Edit, Save, ShoppingBag, CheckCircle, Clock, Truck, UserCheck, Coffee, RefreshCw, FileText, Check, Plus, AlertCircle, Sparkles, Phone, X, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { Pizza, Order, Borda, FoodNiche, NICHE_CONFIGS } from "../types";

interface AdminProps {
  pizzas: Pizza[];
  orders: Order[];
  onAddPizza: (pizzaData: any) => Promise<boolean>;
  onEditPizza: (id: string, pizzaData: any) => Promise<boolean>;
  onDeletePizza: (id: string) => Promise<boolean>;
  onUpdateOrderStatus: (id: string, status: string) => Promise<boolean>;
  onAddNotificationFromAdmin: (order: Order, status: string) => void;
  pizzeriaName: string;
  pizzeriaLogo?: string;
  onUpdatePizzeriaName: (name: string, logo?: string) => Promise<boolean>;
  categories: { id: string; emoji: string; label: string }[];
  onAddCategory: (category: { id: string; emoji: string; label: string }) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  demoMode: boolean;
  checkoutUrl: string;
  checkoutButtonText: string;
  onUpdateSalesConfig: (demoMode: boolean, checkoutUrl: string, checkoutButtonText: string) => Promise<boolean>;
  bordas: Borda[];
  meioMeioEnabled: boolean;
  meioMeioPriceMode: "max" | "average";
  tremEnabled: boolean;
  tremMaxFlavors: number;
  convenienciaPromoEnabled: boolean;
  convenienciaDiscountPercent: number;
    onUpdateConfigWithExtra: (params: {
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
    }) => Promise<boolean>;
    onLoadDemoCatalog?: () => Promise<boolean>;
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
  }
  
  export default function AdminPanel({
    pizzas,
    orders,
    onAddPizza,
    onEditPizza,
    onDeletePizza,
    onUpdateOrderStatus,
    onAddNotificationFromAdmin,
    pizzeriaName,
    pizzeriaLogo = "",
    onUpdatePizzeriaName,
    categories,
    onAddCategory,
    onDeleteCategory,
    demoMode,
    checkoutUrl,
    checkoutButtonText,
    onUpdateSalesConfig,
    bordas = [],
    meioMeioEnabled = true,
    meioMeioPriceMode = "max",
    tremEnabled = true,
    tremMaxFlavors = 4,
    convenienciaPromoEnabled = true,
    convenienciaDiscountPercent = 5,
    onUpdateConfigWithExtra,
    onLoadDemoCatalog,
    pixKey = "",
    mpAccessToken = "",
    mpEnabled = false,
    pointsName = "PizzatoPoints",
    pointsPerPizza = 120,
    pointsEnabled = true,
    niche = "pizzaria",
    pixEnabled = true,
    creditCardEnabled = true,
    debitCardEnabled = true,
    sitePrice = 97.0,
    siteDriveLink = "",
    siteMpToken = ""
  }: AdminProps) {
  const [adminTab, setAdminTab] = useState<"orders" | "menu" | "settings" | "site_sale">("orders");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pizza Form structure
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIngredients, setFormIngredients] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState<string>("Salgada");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formPriceInPoints, setFormPriceInPoints] = useState("");

  const [editId, setEditId] = useState<string | null>(null);

  // High-fidelity inline confirmation state helpers (avoids window.confirm/alert blockers)
  const [confirmDeletePizzaId, setConfirmDeletePizzaId] = React.useState<string | null>(null);
  const [confirmDeleteCategoryId, setConfirmDeleteCategoryId] = React.useState<string | null>(null);
  const [confirmDeleteBordaId, setConfirmDeleteBordaId] = React.useState<string | null>(null);

  // Pizzeria Settings State
  const [pizzeriaNameInput, setPizzeriaNameInput] = useState(pizzeriaName);
  const [pizzeriaLogoInput, setPizzeriaLogoInput] = useState(pizzeriaLogo);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🍕");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  // Whitelabel Sales Settings State
  const [demoModeInput, setDemoModeInput] = useState(demoMode || false);
  const [checkoutUrlInput, setCheckoutUrlInput] = useState(checkoutUrl || "");
  const [checkoutButtonTextInput, setCheckoutButtonTextInput] = useState(checkoutButtonText || "");
  const [pixKeyInput, setPixKeyInput] = useState(pixKey || "");
  const [mpAccessTokenInput, setMpAccessTokenInput] = useState(mpAccessToken || "");
  const [mpEnabledInput, setMpEnabledInput] = useState(mpEnabled || false);
  const [isSavingSales, setIsSavingSales] = useState(false);

  // Loyalty points configurations
  const [pointsNameInput, setPointsNameInput] = useState(pointsName);
  const [pointsPerPizzaInput, setPointsPerPizzaInput] = useState(pointsPerPizza);
  const [pointsEnabledInput, setPointsEnabledInput] = useState(pointsEnabled || false);
  const [isSavingPoints, setIsSavingPoints] = useState(false);

  // Enabled Payment Methods Configuration State
  const [pixEnabledInput, setPixEnabledInput] = useState(pixEnabled);
  const [creditCardEnabledInput, setCreditCardEnabledInput] = useState(creditCardEnabled);
  const [debitCardEnabledInput, setDebitCardEnabledInput] = useState(debitCardEnabled);
  const [isSavingPaymentMethods, setIsSavingPaymentMethods] = useState(false);

  // Site license configurations state
  const [sitePriceInput, setSitePriceInput] = useState(sitePrice);
  const [siteDriveLinkInput, setSiteDriveLinkInput] = useState(siteDriveLink || "");
  const [siteMpTokenInput, setSiteMpTokenInput] = useState(siteMpToken || "");
  const [isSavingSiteSale, setIsSavingSiteSale] = useState(false);

  // WhatsApp connection states
  const [whatsappReady, setWhatsappReady] = useState(false);
  const [whatsappQrUrl, setWhatsappQrUrl] = useState("");
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  React.useEffect(() => {
    if (adminTab !== "settings") return;

    const fetchWhatsappStatus = async () => {
      try {
        const res = await fetch("/api/whatsapp/status");
        if (res.ok) {
          const data = await res.json();
          setWhatsappReady(data.ready);
          setWhatsappQrUrl(data.qrUrl || "");
        }
      } catch (err) {
        console.error("Erro ao buscar status do WhatsApp:", err);
      }
    };

    fetchWhatsappStatus();
    const interval = setInterval(fetchWhatsappStatus, 4000);
    return () => clearInterval(interval);
  }, [adminTab]);

  const handleDisconnectWhatsapp = async () => {
    if (!window.confirm("Deseja realmente desconectar a sessão do WhatsApp?")) return;
    setIsDisconnecting(true);
    try {
      const res = await fetch("/api/whatsapp/disconnect", {
        method: "POST"
      });
      if (res.ok) {
        setWhatsappReady(false);
        setWhatsappQrUrl("");
        alert("WhatsApp desconectado com sucesso!");
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao desconectar WhatsApp.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao desconectar.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Dynamic Partitions, Borders, and Stories Configuration State
  const [meioMeioEnabledInput, setMeioMeioEnabledInput] = useState(meioMeioEnabled);
  const [tremEnabledInput, setTremEnabledInput] = useState(tremEnabled);
  const [tremMaxFlavorsInput, setTremMaxFlavorsInput] = useState(tremMaxFlavors);
  const [meioMeioPriceModeInput, setMeioMeioPriceModeInput] = useState<"max" | "average">(meioMeioPriceMode);
  const [convenienciaPromoEnabledInput, setConvenienciaPromoEnabledInput] = useState(convenienciaPromoEnabled);
  const [convenienciaDiscountPercentInput, setConvenienciaDiscountPercentInput] = useState(convenienciaDiscountPercent);
  const [isSavingPartitions, setIsSavingPartitions] = useState(false);

  const [newBordaName, setNewBordaName] = useState("");
  const [newBordaPrice, setNewBordaPrice] = useState("");
  const [isAddingBorda, setIsAddingBorda] = useState(false);
  const [nicheInput, setNicheInput] = useState<FoodNiche>(niche);

  // Load demo catalog state & handler
  const [isImportingCatalog, setIsImportingCatalog] = useState(false);
  const [importCatalogSuccess, setImportCatalogSuccess] = useState(false);

  const handleLoadDemoCatalogInternal = async () => {
    if (!onLoadDemoCatalog) return;
    setIsImportingCatalog(true);
    setImportCatalogSuccess(false);
    const success = await onLoadDemoCatalog();
    setIsImportingCatalog(false);
    if (success) {
      setImportCatalogSuccess(true);
      setTimeout(() => setImportCatalogSuccess(false), 5000);
    }
  };

  // Sync prop on change
  React.useEffect(() => {
    setPizzeriaNameInput(pizzeriaName);
    setNicheInput(niche);
  }, [pizzeriaName, niche]);

  React.useEffect(() => {
    setDemoModeInput(demoMode);
    setCheckoutUrlInput(checkoutUrl);
    setCheckoutButtonTextInput(checkoutButtonText);
    setPixKeyInput(pixKey);
    setMpAccessTokenInput(mpAccessToken);
    setMpEnabledInput(mpEnabled);
  }, [demoMode, checkoutUrl, checkoutButtonText, pixKey, mpAccessToken, mpEnabled]);

  React.useEffect(() => {
    setMeioMeioEnabledInput(meioMeioEnabled);
    setTremEnabledInput(tremEnabled);
    setTremMaxFlavorsInput(tremMaxFlavors);
    setMeioMeioPriceModeInput(meioMeioPriceMode);
    setConvenienciaPromoEnabledInput(convenienciaPromoEnabled);
    setConvenienciaDiscountPercentInput(convenienciaDiscountPercent);
  }, [meioMeioEnabled, tremEnabled, tremMaxFlavors, meioMeioPriceMode, convenienciaPromoEnabled, convenienciaDiscountPercent]);

  React.useEffect(() => {
    setPointsNameInput(pointsName);
    setPointsPerPizzaInput(pointsPerPizza);
    setPointsEnabledInput(pointsEnabled || false);
  }, [pointsName, pointsPerPizza, pointsEnabled]);

  React.useEffect(() => {
    setPixEnabledInput(pixEnabled);
    setCreditCardEnabledInput(creditCardEnabled);
    setDebitCardEnabledInput(debitCardEnabled);
  }, [pixEnabled, creditCardEnabled, debitCardEnabled]);

  const handleSavePartitionsConfig = async () => {
    setIsSavingPartitions(true);
    await onUpdateConfigWithExtra({
      meioMeioEnabled: meioMeioEnabledInput,
      tremEnabled: tremEnabledInput,
      tremMaxFlavors: tremMaxFlavorsInput,
      meioMeioPriceMode: meioMeioPriceModeInput,
      convenienciaPromoEnabled: convenienciaPromoEnabledInput,
      convenienciaDiscountPercent: parseFloat(String(convenienciaDiscountPercentInput)) || 0
    });
    setIsSavingPartitions(false);
  };

  const handleAddBorda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBordaName.trim() || !newBordaPrice.trim()) return;
    setIsAddingBorda(true);
    const id = "borda_" + Date.now().toString();
    const priceNum = parseFloat(newBordaPrice) || 0;
    const updatedBordas = [...bordas, { id, name: newBordaName.trim(), price: priceNum }];
    await onUpdateConfigWithExtra({ bordas: updatedBordas });
    setNewBordaName("");
    setNewBordaPrice("");
    setIsAddingBorda(false);
  };

  const handleDeleteBorda = async (id: string) => {
    if (bordas.length <= 1) {
      return;
    }
    const updatedBordas = bordas.filter(b => b.id !== id);
    await onUpdateConfigWithExtra({ bordas: updatedBordas });
  };

  const handleSaveSalesConfig = async () => {
    setIsSavingSales(true);
    await onUpdateSalesConfig(demoModeInput, "https://pay.kiwify.com.br/OsmPMDX", checkoutButtonTextInput.trim());
    setIsSavingSales(false);
  };

  const handleSaveName = async () => {
    if (!pizzeriaNameInput.trim()) return;
    setIsSavingName(true);
    await onUpdatePizzeriaName(pizzeriaNameInput.trim(), pizzeriaLogoInput.trim());
    await onUpdateConfigWithExtra({
      niche: nicheInput
    });
    setIsSavingName(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;
    setIsCreatingCat(true);
    const id = newCatLabel.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
    const success = await onAddCategory({
      id: id || Date.now().toString(),
      emoji: newCatEmoji.trim() || "🍕",
      label: newCatLabel.trim()
    });
    setIsCreatingCat(false);
    if (success) {
      setNewCatLabel("");
      setNewCatEmoji("🍕");
    }
  };

  // Set default food URLs helper
  const handleQuickImage = (type: string) => {
    switch (type) {
      case "calabresa":
        setFormImageUrl("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80");
        break;
      case "margherita":
        setFormImageUrl("https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&auto=format&fit=crop&q=80");
        break;
      case "gorgonzola":
        setFormImageUrl("https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&auto=format&fit=crop&q=80");
        break;
      case "doce":
        setFormImageUrl("https://images.unsplash.com/photo-1613564834644-a1707b282b86?w=800&auto=format&fit=crop&q=80");
        break;
      case "frango":
        setFormImageUrl("https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80");
        break;
      default:
        break;
    }
  };

  const handleSubmitPizza = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasPrice = formPrice.trim() !== "";

    if (!formName || !hasPrice || !formImageUrl) {
      alert("Por favor, preencha os campos obrigatórios (incluindo o preço em dinheiro)!");
      return;
    }

    setIsSubmitting(true);
    const pointsValue = formPriceInPoints.trim() !== "" ? parseInt(formPriceInPoints) || 0 : 0;
    const pizzaData = {
      name: formName,
      description: formDescription,
      ingredients: formIngredients,
      price: parseFloat(formPrice) || 0,
      priceInPoints: pointsValue,
      imageUrl: formImageUrl,
      images: formImages.length > 0 ? formImages : [formImageUrl],
      category: formCategory
    };

    let success = false;
    if (editId) {
      success = await onEditPizza(editId, pizzaData);
    } else {
      success = await onAddPizza(pizzaData);
    }

    setIsSubmitting(false);

    if (success) {
      // Clear forms
      setFormName("");
      setFormDescription("");
      setFormIngredients("");
      setFormPrice("");
      setFormPriceInPoints("");
      setFormImageUrl("");
      setFormImages([]);
      setEditId(null);
      alert(editId ? "Cardápio atualizado com sucesso!" : `Novo(a) ${NICHE_CONFIGS[nicheInput].productNoun.toLowerCase()} publicado(a) no cardápio!`);
    }
  };

  const handleEditClick = (p: Pizza) => {
    setEditId(p.id);
    setFormName(p.name);
    setFormDescription(p.description);
    setFormIngredients(p.ingredients.join(", "));
    setFormPrice(p.price ? p.price.toString() : "");
    setFormPriceInPoints(p.priceInPoints ? p.priceInPoints.toString() : "");
    setFormCategory(p.category);
    setFormImageUrl(p.imageUrl);
    setFormImages(p.images || [p.imageUrl].filter(Boolean));
    setAdminTab("menu"); // Switch to menu manager tab to see form
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormName("");
    setFormDescription("");
    setFormIngredients("");
    setFormPrice("");
    setFormPriceInPoints("");
    setFormImageUrl("");
    setFormImages([]);
  };

  const translateStatus = (st: string) => {
    switch (st) {
      case "PENDING":
        return { text: "Pendente", color: "text-amber-600 bg-amber-50" };
      case "PREPARING":
        return { text: "Em Preparo", color: "text-blue-600 bg-blue-50" };
      case "OUT_FOR_DELIVERY":
        return { text: "Saiu p/ Entrega", color: "text-indigo-600 bg-indigo-50" };
      case "DELIVERED":
        return { text: "Entregue", color: "text-emerald-600 bg-emerald-50" };
      default:
        return { text: st, color: "text-gray-500 bg-gray-50" };
    }
  };

  // Status transitions
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    const success = await onUpdateOrderStatus(orderId, newStatus);
    if (success) {
      // Find order to trigger notification
      const relevantOrder = orders.find(o => o.id === orderId);
      if (relevantOrder) {
        onAddNotificationFromAdmin(relevantOrder, newStatus);
      }
    }
  };

  const handleSendClientOutForDeliveryWhatsApp = (order: Order) => {
    const trackingLink = `${window.location.origin}/?tracking=${order.id}`;
    const desc = order.items.map(it => `${it.quantity}x ${it.name}`).join(", ");
    
    const message = `🛵 *SAIU PARA ENTREGA - ${pizzeriaName}* 🛵\n\n` +
      `Olá *${order.clientName}*, seu pedido de pizza acabou de sair do nosso forno e está à caminho!\n\n` +
      `📦 *Itens:* ${desc}\n` +
      `🎯 *Endereço:* ${order.clientAddress}\n\n` +
      `👇 *ACOMPANHE SEU MOTOBOY EM TEMPO REAL:* \n` +
      `${trackingLink}\n\n` +
      `_Previsão de chegada de 15 a 25 minutos. Obrigado por pedir no ${pizzeriaName}!_`;

    const cleanPhone = order.clientPhone.replace(/\D/g, "");
    const waUrl = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl" id="admin-panel-viewport">
      
      {/* Top Banner indicating restricted owner access */}
      <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2 text-amber-800 text-[11px] font-bold uppercase tracking-wider rounded-t-xl">
        <span className="shrink-0 text-xs">🔐</span>
        <span>Acesso Privado & Restrito ao Administrador</span>
      </div>

      {/* Admin Title bar exactly mimicking Business Settings header */}
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-gray-900 text-lg leading-tight" style={{ fontFamily: "Space Grotesk" }}>
            Painel de Controle Comercial
          </h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-0.5">Métricas de Faturamento & Cardápio</p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex gap-1.5 bg-gray-200 p-1 rounded-lg shrink-0">
          <button
                type="button"
            onClick={() => setAdminTab("orders")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              adminTab === "orders" ? "bg-white text-instagram-pink shadow-xs font-extrabold" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Vendas ({orders.filter(o => o.status !== "CANCELLED").length})
          </button>
          <button
                type="button"
            onClick={() => setAdminTab("menu")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              adminTab === "menu" ? "bg-white text-instagram-pink shadow-xs font-extrabold" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Cardápio 🍕
          </button>
          <button
                type="button"
            onClick={() => setAdminTab("settings")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              adminTab === "settings" ? "bg-white text-instagram-pink shadow-xs font-extrabold" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Configurações ⚙️
          </button>
          <button
            type="button"
            onClick={() => setAdminTab("site_sale")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              adminTab === "site_sale" ? "bg-white text-instagram-pink shadow-xs font-extrabold" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Venda do Site 💰
          </button>
        </div>
      </div>

      {/* Metric header stripes to look real professional */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 border-b border-gray-150 p-4 text-center">
        <div>
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Faturamento Estimado</span>
          <span className="text-lg font-black text-gray-800 font-mono block">
            R$ {orders.filter(o => o.status !== "CANCELLED").reduce((sum, current) => sum + current.totalPrice, 0).toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Pedidos Ativos</span>
          <span className="text-lg font-black text-[#0095f6] font-mono block">
            {orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED").length}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Sabores Ativos</span>
          <span className="text-lg font-black text-gray-800 font-mono block">{pizzas.length} sabores</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Fidelidade Média</span>
          <span className="text-lg font-black text-emerald-500 font-mono block">{orders.filter(o => o.status !== "CANCELLED").length * 12} XP</span>
        </div>
      </div>

      {/* --- PANEL VIEW A: ORDERS REGISTER --- */}
      {adminTab === "orders" && (
        <div className="p-5 space-y-4" id="orders-admin-view">
          {orders.filter(o => o.status !== "CANCELLED").length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Nenhum pedido recebido por enquanto. Compartilhe o link do cardápio com seus clientes!
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {orders.filter(o => o.status !== "CANCELLED").map((order) => {
                const statusDetails = translateStatus(order.status);
                return (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4 space-y-3 shadow-xs bg-white hover:border-gray-300 transition-colors">
                    {/* Item header block */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-xs font-mono">{order.id}</span>
                        <span className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase ${statusDetails.color}`}>
                          {statusDetails.text}
                        </span>
                      </div>
                      <span className="font-extrabold text-sm text-gray-900 font-mono">
                        R$ {order.totalPrice.toFixed(2)} ({order.paymentMethod.toUpperCase()})
                      </span>
                    </div>

                    {/* Client info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <p><span className="font-semibold text-gray-900">Cliente:</span> {order.clientName}</p>
                        <p className="mt-0.5"><span className="font-semibold text-gray-900">Endereço:</span> {order.clientAddress}</p>
                        <p className="mt-0.5"><span className="font-semibold text-gray-900">Fone:</span> {order.clientPhone}</p>
                        {order.paymentMethod === "pix" && order.comprovanteUrl && (
                          <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-100 rounded-xl max-w-xs">
                            <span className="font-extrabold text-[9px] text-emerald-850 uppercase block mb-1">Comprovante Pix Anexado:</span>
                            <div className="mt-1 flex items-center gap-2">
                              <img
                                src={order.comprovanteUrl}
                                alt="Comprovante"
                                className="w-10 h-10 rounded-lg border border-emerald-250 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                                onClick={() => {
                                  const win = window.open();
                                  if (win) {
                                    win.document.write(`<img src="${order.comprovanteUrl}" style="max-width:100%; max-height:100vh; display:block; margin:auto; padding:20px;" />`);
                                    win.document.close();
                                  }
                                }}
                              />
                              <a
                                href={order.comprovanteUrl}
                                download={`comprovante-${order.id}.png`}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200 shadow-3xs"
                              >
                                <FileText className="w-3.5 h-3.5" /> Abrir Original
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Purchased Pizzas detail list */}
                      <div className="bg-gray-50 p-2.5 rounded-md text-[11px] space-y-1">
                        <span className="font-bold text-gray-500 uppercase block text-[9px]">Pizzas do Pedido</span>
                        {order.items.map((it: any, index: number) => (
                          <div key={index} className="flex justify-between items-start font-mono">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="text-gray-400 font-light">R$ {it.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions Workflow controllers */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-gray-100">
                      <div className="flex gap-1.5">
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => handleOrderStatusChange(order.id, "PREPARING")}
                            className="bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            Iniciar Preparo
                          </button>
                        )}

                        {order.status === "PREPARING" && (
                          <button
                            onClick={() => handleOrderStatusChange(order.id, "OUT_FOR_DELIVERY")}
                            className="bg-indigo-600 text-white hover:bg-indigo-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Saiu para Entrega 🛵
                          </button>
                        )}

                        {order.status === "OUT_FOR_DELIVERY" && (
                          <button
                            onClick={() => handleOrderStatusChange(order.id, "DELIVERED")}
                            className="bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Entregue / Concluir
                          </button>
                        )}
                        {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Deseja realmente cancelar este pedido e removê-lo da tela de vendas?")) {
                                handleOrderStatusChange(order.id, "CANCELLED");
                              }
                            }}
                            className="bg-rose-600 text-white hover:bg-rose-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancelar
                          </button>
                        )}
                      </div>

                      {/* OUT BOUND WHATSAPP RASTREADOR TRIGGER */}
                      {order.status === "OUT_FOR_DELIVERY" && (
                        <button
                          onClick={() => handleSendClientOutForDeliveryWhatsApp(order)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 shrink-0"
                          title="Gera o link de rastreamento exclusivo e redireciona para enviar mensagem para o WhatsApp do celular do cliente."
                        >
                          <Phone className="w-3.5 h-3.5 fill-white shrink-0 animate-bounce" />
                          <span>Notificar Saída (WhatsApp Client)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- PANEL VIEW B: CARDAPIO MANAGER AND POST CREATE FORM --- */}
      {adminTab === "menu" && (
        <div className="p-5 space-y-6" id="menu-admin-view">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Post Creation form columns */}
          <div className="bg-gray-50/50 p-4 border border-gray-150 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-instagram-pink" />
              {editId ? `Editar Post de ${NICHE_CONFIGS[nicheInput].productNoun}` : `Adicionar Novo(a) ${NICHE_CONFIGS[nicheInput].productNoun} ao Feed`}
            </h3>

            <form onSubmit={handleSubmitPizza} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome do(a) {NICHE_CONFIGS[nicheInput].productNoun} (Obrigatório)</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                  placeholder={nicheInput === "pizzaria" ? "Ex: Portuguesa Especial" : nicheInput === "hamburgueria" ? "Ex: Double Smash Cheddar" : nicheInput === "sushi" ? "Ex: Combinado 20 peças" : nicheInput === "adega" ? "Ex: Heineken Long Neck" : "Ex: Cupcake de Brigadeiro"}
                />
              </div>

              <div className={pointsEnabled ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Preço em Dinheiro (R$)*</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none font-mono"
                    placeholder="Ex: 48.90"
                  />
                </div>
                {pointsEnabled && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Valor em Pontos (Opcional)</label>
                    <input
                      type="number"
                      value={formPriceInPoints}
                      onChange={(e) => setFormPriceInPoints(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none font-mono font-bold text-emerald-600"
                      placeholder="Ex: 1000"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Categoria</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none font-medium text-xs"
                >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label} {cat.emoji}
                      </option>
                    ))}
                  </select>
                </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Ingredientes (Separados por vírgula)</label>
                <input
                  type="text"
                  value={formIngredients}
                  onChange={(e) => setFormIngredients(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                  placeholder="Molho de tomate, Muçarela, Calabresa, Cebola, Azeitonas"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Descrição Explicativa completa</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none h-16 resize-none"
                  placeholder="Explique os diferenciais deste sabor especial de pizza..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Capa da Foto (image URL)</label>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none font-mono"
                  placeholder="https://images.unsplash.com/photo-..."
                />

                {/* Mobile / PC File Selector for Carousels */}
                <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg space-y-2.5">
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Fazer Upload de Fotos (Celular ou Computador)</span>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-dashed border-gray-350 hover:border-instagram-pink rounded-lg cursor-pointer bg-gray-50/50 hover:bg-gray-50 text-gray-700 hover:text-instagram-pink transition-all select-none">
                      <Camera className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Subir Nova Foto</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []) as File[];
                          files.forEach(file => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === "string") {
                                setFormImages(prev => {
                                  const newList = [...prev, reader.result as string];
                                  if (newList.length === 1 || !formImageUrl) {
                                    setFormImageUrl(reader.result as string);
                                  }
                                  return newList;
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                    </label>
                  </div>

                  {/* Showcase uploads carousel strip list with custom selection & deletion */}
                  {formImages.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest">Fotos do Carrossel ({formImages.length})</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {formImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-square border border-gray-200 rounded-md overflow-hidden group select-none">
                            <img src={img} className="w-full h-full object-cover" alt="" />
                            <button
                              type="button"
                              onClick={() => {
                                setFormImages(prev => {
                                  const updated = prev.filter((_, i) => i !== idx);
                                  if (formImageUrl === img) {
                                    setFormImageUrl(updated[0] || "");
                                  }
                                  return updated;
                                });
                              }}
                              className="absolute top-0.5 right-0.5 bg-red-500/80 hover:bg-red-500 text-white p-0.5 rounded-full cursor-pointer shadow-xs transition-transform active:scale-90"
                            >
                              <X className="w-2.5 h-2.5 text-white" />
                            </button>
                            {formImageUrl === img ? (
                              <span className="absolute bottom-0 inset-x-0 bg-instagram-pink text-[7px] text-white font-extrabold text-center py-0.5 leading-none uppercase">Capa</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setFormImageUrl(img)}
                                className="absolute bottom-0 inset-x-0 bg-black/60 hover:bg-black text-[7px] text-white font-extrabold text-center py-0.5 leading-none uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Usar Capa
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick preset links creators */}
                <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[9px] text-gray-450 font-extrabold uppercase mr-1">Preencher Modelos de Teste:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickImage("calabresa")}
                    className="px-2 py-0.5 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded text-[9px] font-semibold"
                  >
                    Calabresa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickImage("margherita")}
                    className="px-2 py-0.5 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded text-[9px] font-semibold"
                  >
                    Margherita
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickImage("gorgonzola")}
                    className="px-2 py-0.5 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded text-[9px] font-semibold"
                  >
                    4 Queijos
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickImage("doce")}
                    className="px-2 py-0.5 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded text-[9px] font-semibold"
                  >
                    Doce Chocolate
                  </button>
                </div>
              </div>

              {/* Submit triggers action */}
              <div className="flex gap-2 pt-2.5">
                {editId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-1/3 py-2 bg-gray-150 text-gray-700 hover:bg-gray-250 text-xs font-bold rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`py-2 px-4 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1 shadow-sm transition-all active:scale-[0.98] ${
                    editId ? "w-2/3 bg-[#0095f6] hover:bg-[#0095f6]/90" : "w-full bg-instagram-pink hover:bg-instagram-pink/90"
                  }`}
                  id="submit-pizza-btn"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Atualizando Servidor...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editId ? "Salvar Pizza" : "Publicar Pizza no Feed"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick list of menu items to edit / delete */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">
              Itens Cadastrados Atuais ({pizzas.length})
            </h3>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {pizzas.map((p) => (
                <div key={p.id} className="p-2 sm:p-2.5 border border-gray-150 rounded-lg flex items-center gap-3 bg-white hover:border-gray-300 transition-colors">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"; }}
                    className="w-12 h-12 object-cover rounded-lg bg-gray-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-extrabold text-gray-900 truncate leading-tight">{p.name}</h4>
                    <span className="text-[10px] text-gray-400 block mt-0.5 uppercase tracking-wide">
                      {p.category} • R$ {p.price.toFixed(2)}{p.priceInPoints && p.priceInPoints > 0 ? ` • ${p.priceInPoints} ${pointsName}` : ""}
                    </span>
                  </div>

                  {/* Edit and Excluir Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {confirmDeletePizzaId === p.id ? (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200 animate-in fade-in duration-200">
                        <span className="text-[9px] font-black text-rose-750 select-none uppercase tracking-wide">Excluir?</span>
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeletePizza(p.id);
                            setConfirmDeletePizzaId(null);
                          }}
                          className="px-2 py-0.5 bg-red-605 text-white rounded font-bold text-[9px] hover:bg-red-700 cursor-pointer transition-colors shrink-0"
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePizzaId(null)}
                          className="px-1.5 py-0.5 bg-gray-100 text-gray-650 rounded font-bold text-[9px] hover:bg-gray-250 cursor-pointer transition-colors shrink-0"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Editar pizza e preencher formulário"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePizzaId(p.id)}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Remover pizza"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>

          {/* Dynamic Categories Creator */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-widest mb-3">
              Criar Nova Categoria 📂
            </h3>
            <p className="text-[11px] text-gray-500 mb-4">
              Adicione novas abas filtráveis no cardápio de destaques do Instagram-feed.
            </p>
            
            <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5 items-end text-left">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none font-semibold text-gray-800"
                  placeholder="Ex: Esfihas"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Emoji representativo</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={newCatEmoji}
                  onChange={(e) => setNewCatEmoji(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-center focus:outline-none"
                  placeholder="🍕"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingCat}
                className="w-full py-2.5 bg-gradient-to-tr from-[#0095f6] to-[#1fa1ff] hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>{isCreatingCat ? "Criando..." : "Adicionar Categoria"}</span>
              </button>
            </form>

            <h4 className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-2.5 text-left">
              Categorias Ativas ({categories.length})
            </h4>
            <div className="flex flex-wrap gap-2 text-left">
              {categories.map((cat, index) => (
                <div 
                  key={cat.id} 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 shadow-3xs"
                >
                  <div className="flex items-center gap-1">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={async () => {
                          const newCategories = [...categories];
                          const temp = newCategories[index];
                          newCategories[index] = newCategories[index - 1];
                          newCategories[index - 1] = temp;
                          await onUpdateConfigWithExtra({ categories: newCategories });
                        }}
                        className="p-0.5 text-gray-400 hover:text-[#0095f6] hover:bg-gray-100 rounded transition-colors cursor-pointer shrink-0"
                        title="Mover para Esquerda"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    )}
                    <span className="mx-0.5">{cat.emoji} {cat.label}</span>
                    {index < categories.length - 1 && (
                      <button
                        type="button"
                        onClick={async () => {
                          const newCategories = [...categories];
                          const temp = newCategories[index];
                          newCategories[index] = newCategories[index + 1];
                          newCategories[index + 1] = temp;
                          await onUpdateConfigWithExtra({ categories: newCategories });
                        }}
                        className="p-0.5 text-gray-400 hover:text-[#0095f6] hover:bg-gray-100 rounded transition-colors cursor-pointer shrink-0"
                        title="Mover para Direita"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {confirmDeleteCategoryId === cat.id ? (
                    <div className="flex items-center gap-1 ml-1.5 animate-in fade-in duration-200 shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          await onDeleteCategory(cat.id);
                          setConfirmDeleteCategoryId(null);
                        }}
                        className="px-1.5 py-0.5 bg-red-600 text-white font-extrabold text-[8px] rounded shrink-0 cursor-pointer"
                        title="Confirmar exclusão de categoria"
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteCategoryId(null)}
                        className="px-1.5 py-0.5 bg-gray-105 text-gray-600 font-extrabold text-[8px] rounded shrink-0 cursor-pointer"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteCategoryId(cat.id)}
                      className="ml-1 p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* dynamic stuffed borders customization */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-4 text-left">
            <h3 className="font-extrabold text-xs text-amber-950 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              🧀 Gerenciar {NICHE_CONFIGS[nicheInput].addOnsName}s
            </h3>
            <p className="text-[11px] text-amber-800 mb-4 font-medium leading-relaxed">
              Adicione ou remova {NICHE_CONFIGS[nicheInput].addOnsName.toLowerCase()}s e configure o preço adicional cobrado em cada um(a) deles(as).
            </p>

            <form onSubmit={handleAddBorda} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 bg-white p-3 rounded-xl border border-amber-100">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Nome do(a) {NICHE_CONFIGS[nicheInput].addOnsName}</label>
                <input
                  type="text"
                  required
                  placeholder={`Ex: ${NICHE_CONFIGS[nicheInput].addOnsName} Especial`}
                  value={newBordaName}
                  onChange={(e) => setNewBordaName(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-gray-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Preço Adicional (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 5.90"
                  value={newBordaPrice}
                  onChange={(e) => setNewBordaPrice(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-gray-800 font-mono"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isAddingBorda}
                  className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {isAddingBorda ? "Adicionando..." : `Adicionar ${NICHE_CONFIGS[nicheInput].addOnsName}`}
                </button>
              </div>
            </form>

            <h4 className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-2.5">
              {NICHE_CONFIGS[nicheInput].addOnsName}s Ativos(as) ({bordas.length})
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {bordas.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-150 text-xs shadow-3xs hover:border-amber-200 transition-colors">
                  <div>
                    <span className="font-bold text-gray-800 block">{b.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{b.price === 0 ? "Grátis" : `+ R$ ${b.price.toFixed(2)}`}</span>
                  </div>
                  {confirmDeleteBordaId === b.id ? (
                    <div className="flex gap-1 items-center shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          await handleDeleteBorda(b.id);
                          setConfirmDeleteBordaId(null);
                        }}
                        className="px-2 py-1 bg-red-600 text-white rounded font-bold text-[9px] hover:bg-red-700 cursor-pointer"
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteBordaId(null)}
                        className="px-1.5 py-1 bg-gray-100 text-gray-650 rounded font-bold text-[9px] hover:bg-gray-200 cursor-pointer"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (bordas.length <= 1) {
                          return;
                        }
                        setConfirmDeleteBordaId(b.id);
                      }}
                      className={`p-1 px-2 rounded-lg transition-colors text-xs font-semibold cursor-pointer ${
                        bordas.length <= 1
                          ? "opacity-45 text-gray-400 cursor-not-allowed"
                          : "hover:bg-rose-50 text-rose-650"
                      }`}
                      disabled={bordas.length <= 1}
                      title={bordas.length <= 1 ? "Você precisa manter pelo menos uma borda ativa." : "Remover borda"}
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- PANEL VIEW C: SETTINGS --- */}
      {adminTab === "settings" && (
        <div className="p-5 space-y-6" id="settings-admin-view">
          {/* 💬 WhatsApp Web-connection panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
            <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500 animate-pulse" /> Conectividade do WhatsApp Automático
            </h3>
            <p className="text-xs text-gray-500 mb-4 font-sans leading-relaxed">
              Conecte seu WhatsApp para que o sistema possa enviar mensagens automáticas de confirmação, avisos de preparo, notificações de saída para entrega (com o link de rastreamento do motoboy) e recibos digitais aos seus clientes.
            </p>

            <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-gray-50/70 border border-gray-150 rounded-2xl">
              {whatsappReady ? (
                <div className="flex-1 space-y-3.5 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-black text-emerald-700 font-sans uppercase tracking-wider">Serviço Ativo & Conectado</span>
                  </div>
                  <p className="text-xs text-gray-600 max-w-md">
                    Seu sistema Pizagram está integrado com seu número do WhatsApp. As mensagens e atualizações dos pedidos estão sendo enviadas automaticamente.
                  </p>
                  <button
                    type="button"
                    onClick={handleDisconnectWhatsapp}
                    disabled={isDisconnecting}
                    className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isDisconnecting ? "Desconectando..." : "Desconectar WhatsApp"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-xs font-black text-amber-700 uppercase tracking-wider">Aguardando Conexão</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-sans">
                      Para ativar as mensagens automáticas do cliente, abra o WhatsApp no seu celular, acesse <strong>Aparelhos Conectados &gt; Conectar um Aparelho</strong> e aponte a câmera para o QR Code ao lado.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-[11px] text-amber-800 leading-relaxed space-y-1">
                      <span className="font-extrabold uppercase text-[10px] block">⚠️ Dica de Hospedagem:</span>
                      <span>Se estiver hospedado em nuvem, a primeira conexão pode levar até 1 minuto para inicializar o navegador virtual e carregar o código.</span>
                    </div>
                  </div>

                  <div className="w-full md:w-auto shrink-0 flex items-center justify-center">
                    {whatsappQrUrl ? (
                      <div className="bg-white p-3 border border-gray-200 rounded-2xl shadow-sm text-center">
                        <img
                          src={whatsappQrUrl}
                          alt="WhatsApp QR Code"
                          className="w-48 h-48 mx-auto"
                        />
                        <span className="text-[10px] text-gray-400 font-bold block mt-2 uppercase tracking-wide animate-pulse">Escaneie para conectar</span>
                      </div>
                    ) : (
                      <div className="w-48 h-48 border border-dashed border-gray-300 bg-white rounded-2xl flex flex-col items-center justify-center text-center p-4">
                        <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
                        <span className="text-[10px] text-gray-400 font-bold mt-3 uppercase leading-tight">Carregando QR Code do WhatsApp...</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pizzeria Name & Logo Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-instagram-pink animate-pulse" /> Nome, Foto & Nicho do Estabelecimento
            </h3>
            <p className="text-[11px] text-gray-500 mb-4">
              Mude o nome, a foto e o nicho de mercado exibidos no topo do feed, na tela de login, stories e nos canais de atendimento.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nome do Estabelecimento</label>
                  <input
                    type="text"
                    value={pizzeriaNameInput}
                    onChange={(e) => setPizzeriaNameInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-instagram-pink/30 focus:outline-none font-bold text-gray-800"
                    placeholder="Ex: Minha Pizzaria"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">URL da Logomarca (Avatar)</label>
                  <input
                    type="text"
                    value={pizzeriaLogoInput}
                    onChange={(e) => setPizzeriaLogoInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-instagram-pink/30 focus:outline-none text-gray-700"
                    placeholder="Cole um link de imagem (Ex: Unsplash/Imgur)"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nicho de Mercado</label>
                  <select
                    value={nicheInput}
                    onChange={(e) => setNicheInput(e.target.value as FoodNiche)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-instagram-pink/30 focus:outline-none font-bold text-gray-850"
                  >
                    <option value="pizzaria">🍕 Pizzaria (Padrão)</option>
                    <option value="hamburgueria">🍔 Hamburgueria</option>
                    <option value="sushi">🍣 Sushi (Japonesa)</option>
                    <option value="adega">🍾 Adega (Bebidas)</option>
                    <option value="doceria">🍰 Doceria (Confeitaria)</option>
                  </select>
                </div>
              </div>

              {pizzeriaLogoInput && (
                <div className="flex items-center gap-2.5 bg-white p-2.5 border border-gray-150 rounded-xl max-w-sm animate-in fade-in duration-200">
                  <img 
                    src={pizzeriaLogoInput} 
                    alt="Logo Preview" 
                    className="w-10 h-10 rounded-full object-cover border border-gray-100" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // fallback logic
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <span className="text-[11px] font-bold text-gray-750 block">Prévia da Foto</span>
                    <span className="text-[9px] text-gray-400 font-mono block truncate max-w-[240px]">{pizzeriaLogoInput}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className="w-full sm:w-auto px-6 py-2.5 bg-instagram-pink text-white rounded-xl text-xs font-bold shadow-xs hover:bg-instagram-pink/95 transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingName ? "Salvando..." : "Salvar Configurações"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sistema de Fidelidade (Loyalty Points) */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-4">
            <h3 className="font-extrabold text-xs text-emerald-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              🪙 Sistema de Fidelidade ({pointsNameInput})
            </h3>
            <p className="text-[11px] text-emerald-800 mb-4">
              Defina o nome do seu sistema de pontos e quantos pontos o cliente ganha a cada pizza pedida (em dinheiro).
            </p>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer select-none mb-3">
                <input
                  type="checkbox"
                  checked={pointsEnabledInput}
                  onChange={(e) => setPointsEnabledInput(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-800">Ativar Sistema de Fidelidade (Pontos)</span>
              </label>

              {pointsEnabledInput && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nome do Sistema de Pontos</label>
                    <input
                      type="text"
                      value={pointsNameInput}
                      onChange={(e) => setPointsNameInput(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-300 focus:outline-none font-bold text-gray-800"
                      placeholder="Ex: PizzatoPoints"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Pontos Ganhos por Pizza</label>
                    <input
                      type="number"
                      value={pointsPerPizzaInput}
                      onChange={(e) => setPointsPerPizzaInput(parseInt(e.target.value) || 0)}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-300 focus:outline-none font-mono font-bold text-gray-800"
                      placeholder="Ex: 120"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    setIsSavingPoints(true);
                    await onUpdateConfigWithExtra({
                      pointsName: pointsNameInput.trim(),
                      pointsPerPizza: pointsPerPizzaInput,
                      pointsEnabled: pointsEnabledInput
                    });
                    setIsSavingPoints(false);
                  }}
                  disabled={isSavingPoints}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingPoints ? "Salvando..." : "Salvar Configurações de Pontos"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mercado Pago Configuration */}
          <div className="bg-[#f2f7ff] border border-blue-150 rounded-xl p-4 mt-4">
            <h3 className="font-extrabold text-xs text-blue-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              ⚡ Integração Mercado Pago (Pix Automático)
            </h3>
            <p className="text-[11px] text-blue-700 mb-4 font-medium leading-relaxed">
              Configure suas credenciais do Mercado Pago para ativar a geração automática de Pix (QR Code Dinâmico e Copia e Cola) no checkout. O sistema confirmará o pagamento em tempo real via Webhook e mudará o status do pedido automaticamente para "Em preparo".
            </p>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={mpEnabledInput}
                  onChange={(e) => setMpEnabledInput(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-800">Ativar Pix Automático via Mercado Pago</span>
              </label>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Access Token de Produção ou Testes (APP_USR-...)</label>
                <input
                  type="password"
                  value={mpAccessTokenInput}
                  onChange={(e) => setMpAccessTokenInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-300 focus:outline-none font-semibold text-gray-800"
                  placeholder="APP_USR-XXXX-XXXXXX-XXXXX"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    setIsSavingSales(true);
                    await onUpdateConfigWithExtra({ 
                      mpAccessToken: mpAccessTokenInput.trim(), 
                      mpEnabled: mpEnabledInput 
                    });
                    setIsSavingSales(false);
                  }}
                  disabled={isSavingSales}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingSales ? "Salvando..." : "Salvar Configurações Mercado Pago"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Métodos de Pagamento Habilitados */}
          <div className="bg-[#fff9f2] border border-amber-200 rounded-xl p-4 mt-4">
            <h3 className="font-extrabold text-xs text-amber-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              💳 Métodos de Pagamento do Checkout
            </h3>
            <p className="text-[11px] text-amber-750 mb-4 font-medium leading-relaxed font-sans">
              Selecione quais métodos de pagamento estarão visíveis e ativos para o cliente escolher no carrinho (checkout). Desative os que não desejar aceitar temporariamente.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pixEnabledInput}
                    onChange={(e) => setPixEnabledInput(e.target.checked)}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-800">🌟 Habilitar Pix</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={creditCardEnabledInput}
                    onChange={(e) => setCreditCardEnabledInput(e.target.checked)}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-800">💳 Habilitar Cartão de Crédito</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={debitCardEnabledInput}
                    onChange={(e) => setDebitCardEnabledInput(e.target.checked)}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-800">💳 Habilitar Cartão de Débito</span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    setIsSavingPaymentMethods(true);
                    await onUpdateConfigWithExtra({
                      pixEnabled: pixEnabledInput,
                      creditCardEnabled: creditCardEnabledInput,
                      debitCardEnabled: debitCardEnabledInput
                    });
                    setIsSavingPaymentMethods(false);
                  }}
                  disabled={isSavingPaymentMethods}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingPaymentMethods ? "Salvando..." : "Salvar Métodos de Pagamento"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* dynamic partitions customization (Meio a Meio & Trem) */}
          {nicheInput === "pizzaria" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mt-4 text-left">
              <h3 className="font-extrabold text-xs text-emerald-950 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                ♊ Configurações de Meio a Meio & Partições
              </h3>
              <p className="text-[11px] text-emerald-800 mb-4 font-medium leading-relaxed">
                Defina as regras de precificação e habilite ou desabilite opções de vários sabores.
              </p>

              <div className="space-y-4 text-left">
                {/* Meio a meio toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={meioMeioEnabledInput}
                    onChange={(e) => setMeioMeioEnabledInput(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-800">Habilitar Opção Meio a Meio (2 Sabores)</span>
                </label>

                {/* Trem toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tremEnabledInput}
                    onChange={(e) => setTremEnabledInput(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-800">Habilitar Opção Trem de Sabores</span>
                </label>

                {tremEnabledInput && (
                  <div className="pl-6 animate-in slide-in-from-top-1 duration-150">
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                      Quantidade Máxima de Sabores na Pizza Trem
                    </label>
                    <select
                      value={tremMaxFlavorsInput}
                      onChange={(e) => setTremMaxFlavorsInput(parseInt(e.target.value) || 4)}
                      className="w-full text-xs px-3.5 py-2 px-3 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-300 focus:outline-none font-bold text-gray-800"
                    >
                      <option value={2}>2 Sabores (Meio a Meio Especial)</option>
                      <option value={3}>3 Sabores (1 Base + 2 Adicionais)</option>
                      <option value={4}>4 Sabores (1 Base + 3 Adicionais) (Padrão)</option>
                      <option value={5}>5 Sabores (1 Base + 4 Adicionais)</option>
                      <option value={6}>6 Sabores (1 Base + 5 Adicionais)</option>
                    </select>
                  </div>
                )}

                {/* Pricing mode option */}
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
                    Método de Cobrança da Pizza com Vários Sabores
                  </label>
                  <select
                    value={meioMeioPriceModeInput}
                    onChange={(e) => setMeioMeioPriceModeInput(e.target.value as "max" | "average")}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-300 focus:outline-none font-bold text-gray-800"
                  >
                    <option value="max">Cobrar pelo Sabor Mais Caro (Padrão de Pizzarias)</option>
                    <option value="average">Cobrar pelo Preço Médio dos Sabores Selecionados</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSavePartitionsConfig}
                    disabled={isSavingPartitions}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingPartitions ? "Salvando..." : "Salvar Regras de Partição"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- PANEL VIEW D: SITE SALES (Whitelabel setup) --- */}
      {adminTab === "site_sale" && (
            <div className="p-5 space-y-6" id="site-sale-admin-view">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
                <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-instagram-orange" /> Configurações de Venda do Site 💰
                </h3>
                <p className="text-xs text-gray-500 mb-4 font-sans leading-relaxed">
                  Configure as opções comerciais para revender este site para donos de pizzarias. Ao comprar pelo botão flutuante, os clientes pagarão o valor definido diretamente na sua conta do Mercado Pago e receberão o link de download imediatamente após a confirmação.
                </p>

                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Preço do Site (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={sitePriceInput}
                      onChange={(e) => setSitePriceInput(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-instagram-pink/30 focus:outline-none font-bold text-gray-800"
                      placeholder="Ex: 97.00"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-550 uppercase mb-1">Link do Google Drive (Download do ZIP)</label>
                    <input
                      type="text"
                      value={siteDriveLinkInput}
                      onChange={(e) => setSiteDriveLinkInput(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-instagram-pink/30 focus:outline-none font-medium text-gray-800"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-550 uppercase mb-1">Mercado Pago Access Token Exclusivo (Venda do Site)</label>
                    <input
                      type="password"
                      value={siteMpTokenInput}
                      onChange={(e) => setSiteMpTokenInput(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-instagram-pink/30 focus:outline-none font-mono text-gray-800"
                      placeholder="APP_USR-..."
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Este token é usado para cobrar a compra do site. Se deixado em branco, o sistema usará o token geral da pizzaria.</p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsSavingSiteSale(true);
                        const success = await onUpdateConfigWithExtra({
                          sitePrice: Number(sitePriceInput),
                          siteDriveLink: siteDriveLinkInput,
                          siteMpToken: siteMpTokenInput
                        });
                        setIsSavingSiteSale(false);
                        if (success) {
                          alert("Configurações de venda do site salvas com sucesso!");
                        } else {
                          alert("Erro ao salvar as configurações.");
                        }
                      }}
                      disabled={isSavingSiteSale}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-instagram-pink to-instagram-orange text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingSiteSale ? "Salvando..." : "Salvar Configurações de Venda"}</span>
                    </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
