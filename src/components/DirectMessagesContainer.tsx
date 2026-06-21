import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, Trash2, MapPin, CreditCard, Lock, Copy, CheckCircle, 
  ArrowLeft, Compass, Phone, Download, RefreshCw, FileText, Plus, Minus, AlertCircle, Sparkles
} from "lucide-react";
import { OrderItem, Order, FoodNiche, NICHE_CONFIGS } from "../types";

interface DirectProps {
  cartItems: OrderItem[];
  onRemoveItem: (id: string) => void;
  onUpdateCartItemQuantity: (id: string, newQty: number) => void;
  onClearCart: () => void;
  clientName: string;
  clientPhone: string;
  clientCep: string;
  clientStreet: string;
  clientNumber: string;
  clientComplement: string;
  clientNeighborhood: string;
  clientCity: string;
  clientState: string;
  onUpdateProfileDetails: (
    name: string,
    phone: string,
    cep: string,
    street: string,
    number: string,
    complement: string,
    neighborhood: string,
    city: string,
    state: string
  ) => void;
  activeOrder: Order | null;
  onPlaceOrder: (orderData: any) => Promise<Order | null>;
  onBackToFeed: () => void;
  orders: Order[];
  convenienciaPromoEnabled: boolean;
  convenienciaDiscountPercent: number;
  pizzeriaName?: string;
  pixKey?: string;
  mpEnabled?: boolean;
  currentUser?: any;
  pointsName?: string;
  pointsEnabled?: boolean;
  niche?: FoodNiche;
  adminPhone?: string;
  pixEnabled?: boolean;
  creditCardEnabled?: boolean;
  debitCardEnabled?: boolean;
  onRequestLogin?: () => void;
}

export default function DirectMessagesContainer({
  cartItems,
  onRemoveItem,
  onUpdateCartItemQuantity,
  onClearCart,
  clientName,
  clientPhone,
  clientCep,
  clientStreet,
  clientNumber,
  clientComplement,
  clientNeighborhood,
  clientCity,
  clientState,
  onUpdateProfileDetails,
  activeOrder,
  onPlaceOrder,
  onBackToFeed,
  orders,
  convenienciaPromoEnabled,
  convenienciaDiscountPercent,
  pizzeriaName = "Minha Pizzaria",
  pixKey = "",
  mpEnabled = false,
  currentUser,
  pointsName = "PizzatoPoints",
  pointsEnabled = true,
  niche = "pizzaria",
  adminPhone = "5511987654321",
  pixEnabled = true,
  creditCardEnabled = true,
  debitCardEnabled = true,
  onRequestLogin
}: DirectProps) {
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address" | "payment" | "confirmed">("cart");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "debit">(() => {
    if (pixEnabled !== false) return "pix";
    if (creditCardEnabled !== false) return "card";
    if (debitCardEnabled !== false) return "debit";
    return "pix";
  });
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [observation, setObservation] = useState("");

  // Mercado Pago Pix states
  const [clientEmail, setClientEmail] = useState(() => localStorage.getItem("pizzato_client_email") || "");
  const [mpPixData, setMpPixData] = useState<{ qr_code: string; qr_code_base64: string; paymentId: string } | null>(null);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);

  useEffect(() => {
    localStorage.setItem("pizzato_client_email", clientEmail);
  }, [clientEmail]);

  useEffect(() => {
    if (paymentMethod === "pix" && !pixEnabled) {
      if (creditCardEnabled) setPaymentMethod("card");
      else if (debitCardEnabled) setPaymentMethod("debit");
    } else if (paymentMethod === "card" && !creditCardEnabled) {
      if (pixEnabled) setPaymentMethod("pix");
      else if (debitCardEnabled) setPaymentMethod("debit");
    } else if (paymentMethod === "debit" && !debitCardEnabled) {
      if (pixEnabled) setPaymentMethod("pix");
      else if (creditCardEnabled) setPaymentMethod("card");
    }
  }, [pixEnabled, creditCardEnabled, debitCardEnabled, paymentMethod]);

  // Credit card validation inputs
  const [cardName, setCardName] = useState(clientName);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardCpf, setCardCpf] = useState("");

  // Pix payment receipt upload state
  const [comprovanteBase64, setComprovanteBase64] = useState<string>("");
  const [comprovanteName, setComprovanteName] = useState<string>("");

  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  const cartTotal = cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const finalPrice = cartTotal;
  const cartTotalPoints = pointsEnabled ? cartItems.reduce((acc, curr) => acc + ((curr.priceInPoints || 0) * curr.quantity), 0) : 0;
  const hasInsufficientPoints = pointsEnabled && currentUser && currentUser.points < cartTotalPoints;

  // Sync initial checkout stats
  useEffect(() => {
    if (orders.length > 0 && !activeTrackingOrder) {
      setActiveTrackingOrder(orders[0]); // Default track newest order
    }
  }, [orders, activeTrackingOrder]);

  const copyPixCode = () => {
    const code = (mpPixData?.qr_code) || pixKey || "00020101021226830014br.gov.bcb.pix2561pizzaria-gourmet-pix-key-polk-marcos-5802BR5915PizzatoGourmet6009SaoPaulo62120508pizzato126304D1B2";
    navigator.clipboard.writeText(code);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleGenerateMpPix = async () => {
    if (!clientEmail || !clientEmail.includes("@")) {
      alert("Por favor, insira um e-mail válido para gerar o Pix!");
      return;
    }
    
    setIsGeneratingPix(true);
    try {
      // 1. Create payment on Mercado Pago
      const res = await fetch("/api/payments/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: clientEmail,
          amount: finalPrice,
          description: `Pedido Pizagram - ${clientName}`
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao gerar o Pix. Verifique as credenciais do Mercado Pago.");
        return;
      }
      
      const pixResult = await res.json();
      
      // 2. Create the PENDING order in SQLite
      const combinedAddress = `${clientStreet}, nº ${clientNumber}${clientComplement ? " (" + clientComplement + ")" : ""} - ${clientNeighborhood}, ${clientCity}/${clientState} - CEP: ${clientCep}`;
      
      const orderData = {
        clientName,
        clientAddress: combinedAddress,
        clientPhone,
        paymentMethod: "pix",
        items: cartItems,
        totalPrice: finalPrice,
        observation: observation.trim() || undefined,
        comprovanteUrl: "Mercado Pago (Automático)",
        mpPaymentId: pixResult.paymentId,
        clientUsername: currentUser?.username
      };
      
      const created = await onPlaceOrder(orderData);
      if (created) {
        setMpPixData({
          qr_code: pixResult.qr_code,
          qr_code_base64: pixResult.qr_code_base64,
          paymentId: pixResult.paymentId
        });
        setActiveTrackingOrder(created);
      } else {
        alert("Erro ao salvar o pedido no banco de dados.");
      }
    } catch (err) {
      console.error("Erro no fluxo do Pix Mercado Pago:", err);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setIsGeneratingPix(false);
    }
  };

  // Poll order status to auto-transition on payment approval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (checkoutStep === "payment" && activeTrackingOrder && mpPixData) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/orders/${activeTrackingOrder.id}`);
          if (res.ok) {
            const updatedOrder = await res.json();
            if (updatedOrder.status !== "PENDING") {
              // Payment approved!
              setCheckoutStep("confirmed");
              onClearCart();
              setActiveTrackingOrder(updatedOrder);
            }
          }
        } catch (err) {
          console.error("Erro ao consultar status do pedido:", err);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [checkoutStep, activeTrackingOrder, mpPixData]);

  // Reset Pix data if we leave the payment step
  useEffect(() => {
    if (checkoutStep !== "payment") {
      setMpPixData(null);
    }
  }, [checkoutStep]);

  const handleVerifyMpPaymentManual = async () => {
    if (!activeTrackingOrder) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/orders/${activeTrackingOrder.id}`);
      if (res.ok) {
        const updatedOrder = await res.json();
        if (updatedOrder.status !== "PENDING") {
          setCheckoutStep("confirmed");
          onClearCart();
          setActiveTrackingOrder(updatedOrder);
        } else {
          alert("Seu pagamento ainda não foi identificado pelo Mercado Pago. Se você já efetuou a transferência, aguarde alguns segundos e tente novamente.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao verificar status do pagamento.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalizeOrder = async () => {
    if (!clientName || !clientPhone || !clientStreet || !clientNumber || !clientCep || !clientCity) {
      alert("Por favor, preencha todos os dados de entrega antes de finalizar!");
      setCheckoutStep("address");
      return;
    }

    setIsProcessing(true);
    const combinedAddress = `${clientStreet}, nº ${clientNumber}${clientComplement ? " (" + clientComplement + ")" : ""} - ${clientNeighborhood}, ${clientCity}/${clientState} - CEP: ${clientCep}`;

    if (paymentMethod === "card" || paymentMethod === "debit") {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName || !cardCpf) {
        alert(`Por favor, preencha todos os dados do cartão de ${paymentMethod === "card" ? "crédito" : "débito"} e CPF do titular!`);
        setIsProcessing(false);
        return;
      }

      try {
        const res = await fetch("/api/payments/create-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: clientEmail,
            amount: finalPrice,
            description: `Pedido Pizagram - ${clientName} (${paymentMethod === "card" ? "Crédito" : "Débito"})`,
            cardNumber,
            cardExpiry,
            cardCvv,
            cardName,
            cpf: cardCpf
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          alert(errData.error || "Pagamento recusado pelo Mercado Pago. Verifique os dados do seu cartão.");
          setIsProcessing(false);
          return;
        }

        const payResult = await res.json();
        if (payResult.status === "approved") {
          // Payment approved! Create order in SQLite directly as PREPARING
          const orderData = {
            clientName,
            clientAddress: combinedAddress,
            clientPhone,
            paymentMethod: paymentMethod,
            items: cartItems,
            totalPrice: finalPrice,
            observation: observation.trim() || undefined,
            comprovanteUrl: `Mercado Pago (Cartão ${paymentMethod === "card" ? "Crédito" : "Débito"} Aprovado - ID: ${payResult.paymentId})`,
            mpPaymentId: payResult.paymentId,
            status: "PREPARING",
            clientUsername: currentUser?.username
          };

          const created = await onPlaceOrder(orderData);
          setIsProcessing(false);
          if (created) {
            setCheckoutStep("confirmed");
            setActiveTrackingOrder(created);
            onClearCart();
          } else {
            alert("Erro ao gravar pedido após aprovação do pagamento.");
          }
        } else {
          alert(`O pagamento não foi aprovado (Status: ${payResult.status}). Tente outro cartão.`);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error("Erro no pagamento de cartão:", err);
        alert("Erro de conexão ao processar cartão.");
        setIsProcessing(false);
      }
    }
  };

  const getWhatsAppLink = (order: Order) => {
    const config = NICHE_CONFIGS[niche || "pizzaria"];
    const itemsSummary = order.items.map(item => {
      let desc = `*${item.quantity}x ${item.name}*`;
      
      const customization = item.customization;
      if (customization) {
        const parts: string[] = [];
        if (customization.borda && customization.borda !== "Sem Borda Recheada" && customization.borda !== "Sem Adicional") {
          parts.push(`${config.addOnsName}: ${customization.borda}`);
        }
        if (customization.meatPoint) {
          parts.push(`Ponto: ${customization.meatPoint}`);
        }
        if (customization.temperature) {
          parts.push(`Temp: ${customization.temperature}`);
        }
        if (customization.needsHashi !== undefined) {
          parts.push(`Hashi: ${customization.needsHashi ? "Sim 🥢" : "Não"}`);
        }
        if (customization.giftMessage) {
          parts.push(`Mensagem: "${customization.giftMessage}"`);
        }
        if (parts.length > 0) {
          desc += ` (${parts.join(", ")})`;
        }
      }

      if (pointsEnabled && item.priceInPoints && item.priceInPoints > 0) {
        desc += ` - ${item.priceInPoints * item.quantity} ${pointsName}`;
      } else {
        desc += ` - R$ ${(item.price * item.quantity).toFixed(2)}`;
      }
      return desc;
    }).join("\n");

    const totalText = pointsEnabled
      ? (order.paymentMethod === "points"
          ? `${order.items.reduce((sum, item) => sum + ((item.priceInPoints || 0) * item.quantity), 0)} ${pointsName}`
          : `R$ ${order.totalPrice.toFixed(2)}` + (order.items.some(it => it.priceInPoints && it.priceInPoints > 0) ? ` + ${order.items.reduce((sum, item) => sum + ((item.priceInPoints || 0) * item.quantity), 0)} ${pointsName}` : ""))
      : `R$ ${order.totalPrice.toFixed(2)}`;

    const emoji = niche === "pizzaria" ? "🍕" :
                  niche === "hamburgueria" ? "🍔" :
                  niche === "sushi" ? "🍣" :
                  niche === "adega" ? "🍾" :
                  "🍰";

    const message = `${emoji} *NOVO PEDIDO - ${pizzeriaName.toUpperCase()}* ${emoji}\n\n` +
      `*Pedido:* #${order.id}\n` +
      `*Cliente:* ${order.clientName}\n` +
      `*WhatsApp:* ${order.clientPhone}\n` +
      `*Endereço:* ${order.clientAddress}\n` +
      `*Pagamento:* ${order.paymentMethod.toUpperCase()}\n` +
      (order.observation ? `*Observações:* ${order.observation}\n` : "") + `\n` +
      `*ITENS DO PEDIDO:*\n${itemsSummary}\n\n` +
      `*TOTAL PAGO:* ${totalText}\n\n` +
      `_Por favor, confirme os itens e envie o comprovante de PIX se aplicável!_`;

    const cleanedPhone = adminPhone.replace(/\D/g, "");
    return `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[580px]" id="checkout-workspace">
      
      {/* LEFT SECTION: Beautiful Spacious Cart overview */}
      <div className="w-full md:w-[42%] lg:w-[40%] flex-none p-5 sm:p-6 bg-gray-50/50 border-r border-gray-200 flex flex-col justify-between" id="bag-container">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-instagram-pink/10 flex items-center justify-center text-instagram-pink shrink-0">
                <ShoppingBag className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base leading-tight">Sua Sacola</h3>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-black">Resumo do Carrinho</p>
              </div>
            </div>
            
            <button 
              onClick={onBackToFeed}
              className="text-[11px] font-black text-[#0095f6] hover:underline flex items-center gap-0.5 transition-all"
            >
              <ArrowLeft className="w-3 h-3" />
              Ver Menu
            </button>
          </div>

          {/* Cart item listing */}
          <div className="mt-5 space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4 text-gray-400">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto animate-pulse" />
                <div>
                  <p className="text-sm font-bold text-gray-500">Sua sacola está vazia por enquanto.</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Vá para as publicações do Feed de fotos, escolha os melhores sabores e monte o seu pedido.</p>
                </div>
                <button
                  onClick={onBackToFeed}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  Ver Publicações
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="p-3 bg-white border border-gray-150 rounded-xl hover:border-gray-250 transition-colors flex items-center gap-3 relative shadow-3xs">
                  
                  {/* Photo thumbnail */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"; }}
                    className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0 select-none bg-gray-50"
                  />

                  {/* Pizza configurations */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-xs text-gray-900 truncate leading-tight">{item.name}</h4>
                    {item.customization && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {item.customization.borda && item.customization.borda !== "Sem Borda Recheada" && item.customization.borda !== "Sem Adicional" && (
                          <span className="inline-block text-[8px] font-bold text-instagram-pink bg-instagram-pink/5 px-1.5 py-0.5 rounded uppercase tracking-wider truncate max-w-full">
                            {NICHE_CONFIGS[niche || "pizzaria"].addOnsName}: {item.customization.borda}
                          </span>
                        )}
                        {item.customization.meatPoint && (
                          <span className="inline-block text-[8px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase tracking-wider truncate max-w-full">
                            Ponto: {item.customization.meatPoint}
                          </span>
                        )}
                        {item.customization.temperature && (
                          <span className="inline-block text-[8px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase tracking-wider truncate max-w-full">
                            Temp: {item.customization.temperature}
                          </span>
                        )}
                        {item.customization.needsHashi !== undefined && (
                          <span className="inline-block text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase tracking-wider truncate max-w-full">
                            Hashi: {item.customization.needsHashi ? "Sim 🥢" : "Não"}
                          </span>
                        )}
                        {item.customization.giftMessage && (
                          <span className="inline-block text-[8px] font-bold text-purple-650 bg-purple-55 border border-purple-200 px-1.5 py-0.5 rounded uppercase tracking-wider truncate max-w-full">
                            Mensagem: "{item.customization.giftMessage}"
                          </span>
                        )}
                      </div>
                    )}
                    <span className="block mt-1 font-mono font-bold text-xs text-gray-700">
                      {pointsEnabled && item.priceInPoints && item.priceInPoints > 0 
                        ? `${item.priceInPoints} ${pointsName}` 
                        : `R$ ${item.price.toFixed(2)}`}
                    </span>
                  </div>

                  {/* Spacious quantity modifier */}
                  <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg p-0.5 bg-gray-50 select-none shrink-0 scale-95 origin-right">
                    <button
                      onClick={() => onUpdateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 hover:text-instagram-pink text-gray-400 transition-colors rounded-sm"
                      title="Diminuir unidade"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold min-w-4 text-center font-mono text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateCartItemQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:text-[#0095f6] text-gray-400 transition-colors rounded-sm"
                      title="Adicionar unidade"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Delete trigger */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Remover pizza da sacola"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subtotal summary section */}
        {cartItems.length > 0 && (
          <div className="space-y-4">
            {/* Observation field */}
            <div className="bg-white p-4 rounded-xl shadow-2xs border border-gray-100 mt-6">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                Observações do Pedido (Ex: sem cebola, etc.)
              </label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-instagram-pink/30 transition-all font-medium text-gray-800 placeholder-gray-400"
                placeholder="Anotação para a cozinha ou entregador..."
                rows={2}
              />
            </div>

            <div className="pt-6 border-t border-gray-200 space-y-3 bg-white p-4 rounded-xl shadow-2xs">
              <div className="flex justify-between text-xs text-gray-500">
                <span className="font-medium">Total de Itens:</span>
                <span className="font-mono font-bold text-gray-800">
                  {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} pizzas
                </span>
              </div>
              {cartTotal > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">Subtotal BRL:</span>
                  <span className="text-xl font-black text-gray-950 font-mono">
                    R$ {cartTotal.toFixed(2)}
                  </span>
                </div>
              )}
              {pointsEnabled && cartTotalPoints > 0 && (
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">Total em {pointsName}:</span>
                  <span className="text-xl font-black text-amber-600 font-mono">
                    {cartTotalPoints} {pointsName}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>


      {/* RIGHT SECTION: Pristine Step-by-Step Checkout wizard with full CEP inputs */}
      <div className="w-full md:w-[58%] lg:w-[60%] flex-none p-5 sm:p-6 flex flex-col justify-between" id="checkout-container">
        
        {cartItems.length === 0 && checkoutStep !== "confirmed" ? (
          /* Empty basket instructions */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" id="checkout-empty-sidebar">
            <Compass className="w-12 h-12 text-[#0095f6] animate-spin mb-4" style={{ animationDuration: "12s" }} />
            <h4 className="font-extrabold text-gray-800 text-sm">Pronto para Enviar seu Pedido</h4>
            <p className="text-xs text-gray-400 leading-relaxed mt-2 max-w-xs">
              Assim que você adicionar itens deliciosos na conversa da sacola, o checkout seguro será desbloqueado aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Steps indicator bar */}
            {checkoutStep !== "confirmed" && (
              <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-gray-400 border-b border-gray-100 pb-3">
                <button
                  onClick={() => setCheckoutStep("cart")}
                  className={`pb-1 uppercase tracking-wider transition-all ${
                    checkoutStep === "cart" 
                      ? "text-[#0095f6] border-b-2 border-[#0095f6] font-black" 
                      : "text-emerald-500 font-extrabold"
                  }`}
                >
                  1. Sacola ({cartItems.length})
                </button>
                <button
                  onClick={() => setCheckoutStep("address")}
                  className={`pb-1 uppercase tracking-wider transition-all ${
                    checkoutStep === "address" 
                      ? "text-[#0095f6] border-b-2 border-[#0095f6] font-black" 
                      : checkoutStep === "payment" ? "text-emerald-500 font-extrabold" : ""
                  }`}
                >
                  2. Endereço / CEP
                </button>
                <span
                  className={`pb-1 uppercase tracking-wider ${
                    checkoutStep === "payment" 
                      ? "text-[#0095f6] border-b-2 border-[#0095f6] font-black" 
                      : "text-gray-400"
                  }`}
                >
                  3. Pagamento
                </span>
              </div>
            )}

            {/* --- STEP 1 IN CHECKOUT: CART LIST STEP (Just acts as introductory gateway check) --- */}
            {checkoutStep === "cart" && (
              <div className="space-y-4 animate-in fade-in duration-200" id="step-cart-instructions">
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Iniciar Pedido Seguro</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">
                    Falta pouco para saborear a pizza perfeita do PizzatoGram! Ao clicar no link abaixo, validaremos seu CEP e endereço de entrega cadastrados no perfil do cliente.
                  </p>
                </div>

                {pointsEnabled && hasInsufficientPoints && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs font-semibold">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-red-950 uppercase tracking-wide">Saldo de Pontos Insuficiente</span>
                      <span className="block mt-0.5 font-normal leading-normal">
                        Seu pedido custa {cartTotalPoints} {pointsName}, mas você possui apenas {currentUser?.points ?? 0} {pointsName}. Remova itens de resgate para continuar.
                      </span>
                    </div>
                  </div>
                )}

                <button
                  disabled={hasInsufficientPoints}
                  onClick={() => setCheckoutStep("address")}
                  className="w-full py-3.5 bg-gradient-to-r from-instagram-pink to-instagram-orange hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all transform active:scale-[0.99] disabled:from-gray-300 disabled:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Dados de Entrega
                </button>
              </div>
            )}


            {/* --- STEP 2 IN CHECKOUT: COMPREHENSIVE ADDRESS SELECTOR --- */}
            {checkoutStep === "address" && (
              <div className="space-y-4 animate-in fade-in duration-200" id="step-address-inputs">
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Endereço de Entrega do Motoboy</h4>
                  <p className="text-xs text-gray-400 mt-1 font-sans">As informações abaixo serão sincronizadas automaticamente com o perfil cadastrado!</p>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Seu Nome para o Entregador</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => onUpdateProfileDetails(e.target.value, clientPhone, clientCep, clientStreet, clientNumber, clientComplement, clientNeighborhood, clientCity, clientState)}
                        className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-350 transition-all font-medium"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1 font-sans">WhatsApp / Contato</label>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => onUpdateProfileDetails(clientName, e.target.value, clientCep, clientStreet, clientNumber, clientComplement, clientNeighborhood, clientCity, clientState)}
                        className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-350 transition-all font-mono"
                        placeholder="(11) xxxxx-xxxx"
                      />
                    </div>
                  </div>

                  <div className="animate-in fade-in duration-200">
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">E-mail (Necessário para o Pagamento)</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-350 transition-all font-medium"
                      placeholder="seu-email@provedor.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1 font-sans">Código Postal (CEP)</label>
                      <input
                        type="text"
                        value={clientCep}
                        onChange={(e) => onUpdateProfileDetails(clientName, clientPhone, e.target.value, clientStreet, clientNumber, clientComplement, clientNeighborhood, clientCity, clientState)}
                        className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-350 transition-all font-mono font-bold"
                        placeholder="01311-100"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Rua / Logradouro</label>
                      <input
                        type="text"
                        value={clientStreet}
                        onChange={(e) => onUpdateProfileDetails(clientName, clientPhone, clientCep, e.target.value, clientNumber, clientComplement, clientNeighborhood, clientCity, clientState)}
                        className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-350 transition-all font-medium"
                        placeholder="Avenida Paulista"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1 font-sans">Número</label>
                      <input
                        type="text"
                        value={clientNumber}
                        onChange={(e) => onUpdateProfileDetails(clientName, clientPhone, clientCep, clientStreet, e.target.value, clientComplement, clientNeighborhood, clientCity, clientState)}
                        className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-350 transition-all font-sans font-medium"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Complemento / Bloco</label>
                      <input
                        type="text"
                        value={clientComplement}
                        onChange={(e) => onUpdateProfileDetails(clientName, clientPhone, clientCep, clientStreet, clientNumber, e.target.value, clientNeighborhood, clientCity, clientState)}
                        className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-350 transition-all font-medium"
                        placeholder="Apto 15"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Bairro</label>
                      <input
                        type="text"
                        value={clientNeighborhood}
                        onChange={(e) => onUpdateProfileDetails(clientName, clientPhone, clientCep, clientStreet, clientNumber, clientComplement, e.target.value, clientCity, clientState)}
                        className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-350 transition-all font-medium"
                        placeholder="Bela Vista"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Cidade</label>
                      <input
                        type="text"
                        value={clientCity}
                        onChange={(e) => onUpdateProfileDetails(clientName, clientPhone, clientCep, clientStreet, clientNumber, clientComplement, clientNeighborhood, e.target.value, clientState)}
                        className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-350 transition-all font-medium"
                        placeholder="São Paulo"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1 font-sans">Estado / UF</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={clientState}
                        onChange={(e) => onUpdateProfileDetails(clientName, clientPhone, clientCep, clientStreet, clientNumber, clientComplement, clientNeighborhood, clientCity, e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-350 transition-all font-mono font-bold"
                        placeholder="SP"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setCheckoutStep("cart")}
                    className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-colors"
                  >
                    Voltar
                  </button>
                   <button
                    disabled={!clientName || !clientPhone || !clientCep || !clientStreet || !clientNumber || !clientCity || !clientState || !clientEmail || hasInsufficientPoints}
                    onClick={() => {
                      if (!currentUser) {
                        if (onRequestLogin) onRequestLogin();
                      } else {
                        setCheckoutStep("payment");
                      }
                    }}
                    className="w-2/3 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider disabled:opacity-40 transition-all"
                  >
                    Continuar para Pagamento
                  </button>
                </div>
              </div>
            )}


            {/* --- STEP 3 IN CHECKOUT: CHOOSE WEBSOURCE PIX OR CREDIT CARDS --- */}
            {checkoutStep === "payment" && (
              <div className="space-y-5 animate-in fade-in duration-200" id="step-payment-options">
                {pointsEnabled && finalPrice === 0 ? (
                  <div className="p-5 bg-amber-50/40 border border-amber-200 rounded-2xl text-center space-y-4 shadow-3xs">
                    <Sparkles className="w-8 h-8 text-amber-500 mx-auto animate-bounce" />
                    <h4 className="font-extrabold text-sm text-amber-900 uppercase tracking-wider">Confirmar Resgate por Pontos</h4>
                    <p className="text-[11px] text-amber-700 leading-relaxed font-sans max-w-sm mx-auto">
                      Seu pedido de pizzas tem valor BRL R$ 0,00 e será pago inteiramente com seus pontos acumulados.
                      Dedução de <strong className="font-bold text-amber-900">{cartTotalPoints} {pointsName}</strong> do seu saldo atual de <strong className="font-bold text-amber-900">{currentUser?.points ?? 0} {pointsName}</strong>.
                    </p>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        onClick={() => setCheckoutStep("address")}
                        className="w-1/3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={async () => {
                          setIsProcessing(true);
                          try {
                            const combinedAddress = `${clientStreet}, nº ${clientNumber}${clientComplement ? " (" + clientComplement + ")" : ""} - ${clientNeighborhood}, ${clientCity}/${clientState} - CEP: ${clientCep}`;
                            const orderData = {
                              clientName,
                              clientAddress: combinedAddress,
                              clientPhone,
                              paymentMethod: "points",
                              items: cartItems,
                              totalPrice: 0,
                              observation: observation.trim() || undefined,
                              comprovanteUrl: `Resgate via ${pointsName}`,
                              clientUsername: currentUser?.username
                            };
                            const created = await onPlaceOrder(orderData);
                            if (created) {
                              setCheckoutStep("confirmed");
                              setActiveTrackingOrder(created);
                              onClearCart();
                            } else {
                              alert("Erro ao realizar o resgate de pontos.");
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Erro ao conectar ao servidor.");
                          } finally {
                            setIsProcessing(false);
                          }
                        }}
                        disabled={isProcessing || hasInsufficientPoints}
                        className="w-2/3 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Confirmando resgate...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span>Confirmar Resgate Instantâneo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Processador de Pagamento Integrado</h4>
                      <p className="text-xs text-gray-400 mt-1 font-sans">Todas as conexões e transações são criptografadas e seguras contra vazamento.</p>
                    </div>

                {/* Switcher Buttons */}
                <div className={`grid gap-2.5 ${
                  [pixEnabled, creditCardEnabled, debitCardEnabled].filter(Boolean).length === 3 
                    ? "grid-cols-1 sm:grid-cols-3" 
                    : [pixEnabled, creditCardEnabled, debitCardEnabled].filter(Boolean).length === 2 
                    ? "grid-cols-2" 
                    : "grid-cols-1"
                }`}>
                  {pixEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pix")}
                      className={`py-3 px-4 border rounded-xl text-center select-none transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        paymentMethod === "pix"
                          ? "border-[#0095f6] bg-[#0095f6]/5 text-gray-900 font-bold"
                          : "border-gray-200 hover:bg-gray-50 text-gray-500 text-xs"
                      }`}
                    >
                      <span className="text-sm font-bold block">🌟 Mercado Pago (Pix)</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-600">Imediato</span>
                    </button>
                  )}
                  {creditCardEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`py-3 px-4 border rounded-xl text-center select-none transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        paymentMethod === "card"
                          ? "border-[#0095f6] bg-[#0095f6]/5 text-gray-900 font-bold"
                          : "border-gray-200 hover:bg-gray-50 text-gray-500 text-xs"
                      }`}
                    >
                      <span className="text-sm font-bold block">💳 Cartão de Crédito</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-400">Até 3x sem juros</span>
                    </button>
                  )}
                  {debitCardEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("debit")}
                      className={`py-3 px-4 border rounded-xl text-center select-none transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        paymentMethod === "debit"
                          ? "border-[#0095f6] bg-[#0095f6]/5 text-gray-900 font-bold"
                          : "border-gray-200 hover:bg-gray-50 text-gray-500 text-xs"
                      }`}
                    >
                      <span className="text-sm font-bold block">💳 Cartão de Débito</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-400">À vista</span>
                    </button>
                  )}
                </div>

                {/* Automated Mercado Pago Pix payment view */}
                {paymentMethod === "pix" && (
                  <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl space-y-4 text-center">
                    {mpPixData === null ? (
                      <div className="py-4 space-y-3">
                        <Sparkles className="w-8 h-8 text-blue-600 mx-auto animate-pulse" />
                        <h4 className="font-extrabold text-xs text-blue-900 uppercase tracking-wider">Pix Automático via Mercado Pago</h4>
                        <p className="text-[11px] text-blue-700 leading-relaxed font-sans max-w-sm mx-auto">
                          Gere seu QR Code dinâmico clicando no botão abaixo. Após o pagamento, o seu pedido será aprovado e enviado para a cozinha automaticamente.
                        </p>
                        <button
                          type="button"
                          disabled={isGeneratingPix}
                          onClick={handleGenerateMpPix}
                          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50 cursor-pointer"
                        >
                          {isGeneratingPix ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Gerando Pix...</span>
                            </>
                          ) : (
                            <span>Gerar Pix Dinâmico</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in zoom-in-95 duration-200 text-center">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-xs text-gray-800 uppercase tracking-wide">Pague o Pix e Aguarde</h4>
                          <p className="text-[10px] text-gray-400">Escaneie o QR Code abaixo com o app do seu banco ou copie a chave copia e cola.</p>
                        </div>

                        {/* Base64 QR Code */}
                        <div className="relative w-44 h-44 mx-auto bg-white border border-gray-200 rounded-xl p-2.5 flex items-center justify-center shadow-3xs group">
                          <img
                            src={`data:image/jpeg;base64,${mpPixData.qr_code_base64}`}
                            alt="QR Code Mercado Pago"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                            Pix Dinâmico
                          </div>
                        </div>

                        {/* Copy Paste Code */}
                        <div className="space-y-1.5 text-left mt-2">
                          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">Código Pix Copia e Cola</label>
                          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden p-1.5">
                            <span className="text-[9px] font-mono font-bold truncate text-gray-750 flex-1 px-2 select-all">
                              {mpPixData.qr_code}
                            </span>
                            <button
                              type="button"
                              onClick={copyPixCode}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {copiedPix ? "Copiado!" : "Copiar"}
                            </button>
                          </div>
                        </div>

                        {/* Waiting status indicator */}
                        <div className="p-3 bg-blue-50 border border-blue-105 rounded-xl flex items-center justify-center gap-2.5 text-blue-800 text-[11px] font-bold mt-2">
                          <RefreshCw className="w-4 h-4 text-blue-655 animate-spin" />
                          <span>Aguardando aprovação de pagamento...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Render Credit Card details inside layout */}
                {(paymentMethod === "card" || paymentMethod === "debit") && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3.5">
                    {/* Compact visual credit card widget */}
                    <div className="w-full aspect-[16/10] bg-gradient-to-tr from-instagram-purple via-instagram-pink to-instagram-orange rounded-xl p-4 text-white flex flex-col justify-between shadow-xs relative">
                      <span className="absolute right-4 top-4 text-[9px] uppercase tracking-widest font-black italic opacity-90">PIZZATOCARD</span>
                      <CreditCard className="w-7 h-7 text-white opacity-85" />
                      
                      <div>
                        <div className="text-sm font-mono tracking-widest font-bold my-1 text-center">
                          {cardNumber ? cardNumber.replace(/(\d{4})/g, "$1 ").trim() : "•••• •••• •••• ••••"}
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <div className="truncate max-w-[150px]">
                            <span className="text-[8px] uppercase tracking-wider block opacity-70">Titular</span>
                            <span className="text-[11px] font-black uppercase tracking-tight block truncate">
                              {cardName.toUpperCase() || "NOME DO CLIENTE"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase tracking-wider block opacity-70">Validade</span>
                            <span className="text-[11px] font-black font-mono block">
                              {cardExpiry || "MM/AA"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nome Igual no Cartão</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 font-medium"
                          placeholder="EX: M A POLK"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Número do Cartão</label>
                          <input
                            type="text"
                            maxLength={16}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                            className="w-full text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 font-mono"
                            placeholder="4532984523110045"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Validade (MM/AA)</label>
                          <input
                            type="text"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 font-mono"
                            placeholder="05/29"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-200">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Código CVV</label>
                          <input
                            type="text"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                            className="w-full text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 font-mono"
                            placeholder="123"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">CPF do Titular</label>
                          <input
                            type="text"
                            maxLength={14}
                            value={cardCpf}
                            onChange={(e) => setCardCpf(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 font-mono"
                            placeholder="123.456.789-00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Cost analysis rows */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-xl space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="font-medium">Subtotal Sacola:</span>
                    <span className="font-mono font-medium">R$ {cartTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-gray-200">
                    <span className="text-xs font-black text-gray-900 uppercase">Valor Líquido Final:</span>
                    <span className="text-lg font-black text-[#0095f6] font-mono">
                      R$ {finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action submit Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setCheckoutStep("address")}
                    className="w-1/3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all"
                  >
                    Voltar
                  </button>
                  
                  {paymentMethod === "pix" ? (
                    mpPixData === null ? (
                      <button
                        onClick={handleGenerateMpPix}
                        disabled={isGeneratingPix}
                        className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isGeneratingPix ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Gerando Pix...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 shrink-0" />
                            <span>Gerar Pix Dinâmico</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleVerifyMpPaymentManual}
                        disabled={isProcessing}
                        className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verificando...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span>Confirmar Pagamento</span>
                          </>
                        )}
                      </button>
                    )
                  ) : (
                    <button
                      onClick={handleFinalizeOrder}
                      disabled={isProcessing}
                      className="w-2/3 py-3 bg-[#0095f6] hover:bg-[#0095f6]/95 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processando Cartão...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 shrink-0" />
                          <span>Concluir Pedido</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- STEP 4 IN CHECKOUT: COMPLETED DIGITAL RECEIPTS AND MAP SHORTCUT --- */}
        {checkoutStep === "confirmed" && activeTrackingOrder && (
          <div className="space-y-6 animate-in zoom-in-95 duration-250 py-4" id="checkout-confirmed-pane">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-lg mx-auto shadow-md animate-bounce">
                ✓
              </div>
              <h3 className="font-black text-gray-900 text-base">Pedido Autenticado com Sucesso!</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed font-sans">
                Seu comprovante foi registrado no livro de vendas. A forneria gourmet já foi notificada para assar sua pizza!
              </p>
            </div>

            {/* Receipt details */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-150 text-xs font-mono text-gray-700 space-y-2 max-h-[300px] overflow-y-auto">
              <div className="text-center font-bold border-b border-dashed border-gray-300 pb-2.5 font-sans mb-3 text-gray-900">
                <span>COMPROVANTE DIGITAL FORNERIA PIZZATO</span>
                <p className="text-[10px] font-normal text-gray-400 mt-0.5">Assado em Forno de Lenha Tradicional</p>
              </div>

              <div><span className="font-bold">Comprovante ID:</span> {activeTrackingOrder.comprovanteNum}</div>
              <div><span className="font-bold">ID do Pedido:</span> {activeTrackingOrder.id}</div>
              {activeTrackingOrder.observation && (
                <div className="text-red-650 bg-red-50 p-1.5 rounded-md my-1 font-sans text-[11px]">
                  <span className="font-bold block uppercase text-[8px] text-red-500">Observação Cadastrada:</span>
                  {activeTrackingOrder.observation}
                </div>
              )}
              <div><span className="font-bold">Cliente:</span> {activeTrackingOrder.clientName}</div>
              <div><span className="font-bold">Contato:</span> {activeTrackingOrder.clientPhone}</div>
              <div className="break-words"><span className="font-bold">Endereço:</span> {activeTrackingOrder.clientAddress}</div>
              
              <div className="border-t border-b border-dashed border-gray-300 py-2.5 my-3 space-y-1.5 font-sans">
                <span className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wider block">Produtos:</span>
                {activeTrackingOrder.items.map((it, idx) => {
                  const isPointsItem = it.priceInPoints !== undefined && it.priceInPoints > 0;
                  return (
                    <div key={idx} className="flex justify-between items-baseline text-xs text-gray-700">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-mono font-semibold">
                        {isPointsItem && pointsEnabled ? `${it.priceInPoints * it.quantity} ${pointsName}` : `R$ ${(it.price * it.quantity).toFixed(2)}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-1 text-gray-900 font-sans text-xs">
                <span className="font-extrabold">Forma de Pagamento:</span>
                <span className="font-mono font-bold">{activeTrackingOrder.paymentMethod.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1 text-gray-955 font-sans text-sm font-black border-t border-gray-200 mt-1.5 flex-wrap">
                <span>Total Pago:</span>
                <div className="text-right">
                  {activeTrackingOrder.totalPrice > 0 && (
                    <span className="font-mono block">R$ {activeTrackingOrder.totalPrice.toFixed(2)}</span>
                  )}
                  {pointsEnabled && activeTrackingOrder.items.some(it => it.priceInPoints && it.priceInPoints > 0) && (
                    <span className="font-mono text-amber-600 block text-xs">
                      {activeTrackingOrder.items.reduce((sum, item) => sum + ((item.priceInPoints || 0) * item.quantity), 0)} {pointsName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Receipt action workflows */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={() => alert("Comprovante baixado! Verifique seus PDFs recebidos no navegador.")}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 shrink-0" />
                Baixar PDF
              </button>

              <a
                href={getWhatsAppLink(activeTrackingOrder)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
              >
                <Phone className="w-4 h-4 fill-white shrink-0" />
                Fechar via WhatsApp
              </a>
            </div>

            <button
              onClick={() => {
                setCheckoutStep("cart");
                onBackToFeed();
              }}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Voltar ao Feed e Acompanhar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
