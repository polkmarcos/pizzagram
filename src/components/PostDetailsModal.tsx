import React, { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Send, ShoppingBag, Plus, Minus, Info, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { Pizza, BORDAS_CONFIG, BordaType, FoodNiche, NICHE_CONFIGS } from "../types";
import { motion } from "motion/react";

interface ModalProps {
  pizza: Pizza;
  allPizzas: Pizza[];
  onClose: () => void;
  onAddToCart: (item: any) => void;
  onLikePizza: (pizzaId: string) => void;
  bordas?: { id: string; name: string; price: number }[];
  meioMeioEnabled?: boolean;
  tremEnabled?: boolean;
  tremMaxFlavors?: number;
  meioMeioPriceMode?: "max" | "average";
  isFavorite?: boolean;
  onToggleFavorite?: (pizzaId: string) => void;
  pizzeriaName?: string;
  pizzeriaLogo?: string;
  pointsName?: string;
  pointsEnabled?: boolean;
  niche?: FoodNiche;
}

export default function PostDetailsModal({
  pizza,
  allPizzas,
  onClose,
  onAddToCart,
  onLikePizza,
  bordas = [],
  meioMeioEnabled = true,
  tremEnabled = true,
  tremMaxFlavors = 4,
  meioMeioPriceMode = "max",
  isFavorite = false,
  onToggleFavorite,
  pizzeriaName = "Minha Pizzaria",
  pizzeriaLogo = "",
  pointsName = "PizzatoPoints",
  pointsEnabled = true,
  niche = "pizzaria"
}: ModalProps) {
  const activeBordas = bordas && bordas.length > 0 ? bordas : BORDAS_CONFIG;
  const nicheConfig = NICHE_CONFIGS[niche];
  const isPizzaNiche = niche === "pizzaria";
  const canHaveAddOns = pizza.category !== "Bebida";

  const [partitionMode, setPartitionMode] = useState<"single" | "half" | "trem_4">("single");
  const [secondHalf, setSecondHalf] = useState<Pizza | null>(null);
  
  // Dynamic multiselection state for trem flavours
  const [tremFlavors, setTremFlavors] = useState<(Pizza | null)[]>([]);
  const [activeSlot, setActiveSlot] = useState<number>(2);

  const [selectedBorda, setSelectedBorda] = useState<BordaType>("none");
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(pizza.likes);
  const [likedPizzas, setLikedPizzas] = useState<Record<string, boolean>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [purchaseMode, setPurchaseMode] = useState<"money" | "points">("money");

  // Niche-specific choices:
  const [meatPoint, setMeatPoint] = useState<string>("Ao Ponto");
  const [temperature, setTemperature] = useState<string>("Trincando de Gelada");
  const [giftMessage, setGiftMessage] = useState<string>("");
  const [needsHashi, setNeedsHashi] = useState<boolean>(true);

  // Reset states when pizza changed
  useEffect(() => {
    setPartitionMode("single");
    setSecondHalf(null);
    const extraFlavorsCount = Math.max(0, tremMaxFlavors - 1);
    setTremFlavors(Array(extraFlavorsCount).fill(null));
    setActiveSlot(2);
    setSelectedBorda("none");
    setQuantity(1);
    setLiked(false);
    setLikesCount(pizza.likes);
    setLikedPizzas({});
    setActiveImageIndex(0);
    setPurchaseMode("money");
    setMeatPoint("Ao Ponto");
    setTemperature("Trincando de Gelada");
    setGiftMessage("");
    setNeedsHashi(true);
  }, [pizza, tremMaxFlavors]);

  // Pricing math
  const isPointsPizza = pointsEnabled && purchaseMode === "points";
  const basePrice = pizza.price;
  
  // Dynamic Brazilian rule: multi-flavor takes the price of the more expensive flavor chosen OR average
  let calculatedPizzaBase = basePrice;
  if (isPizzaNiche && !isPointsPizza) {
    if (partitionMode === "half" && secondHalf) {
      if (meioMeioPriceMode === "average") {
        calculatedPizzaBase = (basePrice + secondHalf.price) / 2;
      } else {
        calculatedPizzaBase = Math.max(basePrice, secondHalf.price);
      }
    } else if (partitionMode === "trem_4") {
      const extraPrices = tremFlavors.map(f => f ? f.price : basePrice);
      const allPrices = [basePrice, ...extraPrices];
      if (meioMeioPriceMode === "average") {
        const sum = allPrices.reduce((sumVal, currVal) => sumVal + currVal, 0);
        calculatedPizzaBase = sum / Math.max(1, tremMaxFlavors);
      } else {
        calculatedPizzaBase = Math.max(...allPrices);
      }
    }
  }

  const bordaPrice = !isPointsPizza ? (activeBordas.find(b => b.id === selectedBorda)?.price || 0) : 0;
  const singlePizzaPrice = isPointsPizza ? 0 : (calculatedPizzaBase + bordaPrice);
  const totalPrice = isPointsPizza ? 0 : (singlePizzaPrice * quantity);
  const totalPointsPrice = isPointsPizza ? ((pizza.priceInPoints || 0) * quantity) : 0;

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount(prev => prev + 1);
      onLikePizza(pizza.id);
    } else {
      setLiked(false);
      setLikesCount(prev => prev - 1);
    }
  };

  const handleAddToCartClick = () => {
    const isHalf = partitionMode === "half";
    const isTrem = partitionMode === "trem_4";
    
    let finalPizzaName = pizza.name;
    if (isHalf && secondHalf) {
      finalPizzaName = `Meio ${pizza.name} / Meio ${secondHalf.name}`;
    } else if (isTrem) {
      const parts = [
        pizza.name.split(" ")[0],
        ...tremFlavors.map(f => f ? f.name.split(" ")[0] : "Vazio")
      ];
      finalPizzaName = `Trem de Sabores (${tremMaxFlavors} Sabores): ${parts.join(" + ")}`;
    }

    const customOptions = {
      isHalfAndHalf: isHalf,
      isTrem4: isTrem,
      halfPizza: secondHalf || undefined,
      tremFlavors: isTrem ? tremFlavors : undefined,
      borda: canHaveAddOns ? (activeBordas.find(b => b.id === selectedBorda)?.name || "Sem Adicional") : "Sem Adicional",
      finalPrice: singlePizzaPrice,
      meatPoint: niche === "hamburgueria" ? meatPoint : undefined,
      temperature: niche === "adega" ? temperature : undefined,
      giftMessage: niche === "doceria" && giftMessage.trim() ? giftMessage.trim() : undefined,
      needsHashi: niche === "sushi" ? needsHashi : undefined
    };

    const tremFlavorsString = tremFlavors.map(f => f?.id || "none").join("-");
    const cartItem = {
      id: `${pizza.id}-${partitionMode}-${secondHalf?.id || "none"}-${tremFlavorsString}-${selectedBorda}`,
      name: finalPizzaName,
      price: isPointsPizza ? 0 : singlePizzaPrice,
      priceInPoints: isPointsPizza ? pizza.priceInPoints : 0,
      category: pizza.category,
      imageUrl: pizza.imageUrl,
      customization: customOptions,
      quantity
    };

    onAddToCart(cartItem);
    onClose();
  };

  const filteredPizzasForSecondHalf = allPizzas.filter(p => p.id !== pizza.id && p.category === pizza.category);
  const imagesList = pizza.images && pizza.images.length > 0 ? pizza.images : [pizza.imageUrl];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-fluid-sm backdrop-blur-xs"
      id="post-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] md:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
        id="post-modal-container"
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 bg-black/30 md:bg-white/80 hover:bg-black/50 md:hover:bg-gray-100 text-white md:text-gray-700 rounded-full transition-colors"
          id="close-post-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COMPONENT: Huge Interactive Post Image */}
        <div className="w-full md:w-1/2 bg-gray-100 relative aspect-video md:aspect-auto flex items-center justify-center overflow-hidden shrink-0">
          {partitionMode === "half" && secondHalf ? (
            // Visual splitscreen for half and half pizzas
            <div className="w-full h-full flex relative">
              <div className="w-1/2 h-full overflow-hidden border-r border-white relative">
                <img
                  src={pizza.imageUrl}
                  alt={pizza.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"; }}
                  className="absolute inset-0 w-full h-full object-cover scale-[1.08] translate-x-[-10%]"
                />
                <span className="absolute bottom-2.5 left-2.5 z-10 text-fluid-xs font-bold bg-black/85 text-white px-2 py-1 rounded-full">
                  50% {pizza.name.split(" ")[0]}
                </span>
              </div>
              <div className="w-1/2 h-full overflow-hidden relative">
                <img
                  src={secondHalf.imageUrl}
                  alt={secondHalf.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"; }}
                  className="absolute inset-0 w-full h-full object-cover scale-[1.08] translate-x-[10%]"
                />
                <span className="absolute bottom-2.5 right-2.5 z-10 text-fluid-xs font-bold bg-black/85 text-white px-2 py-1 rounded-full">
                  50% {secondHalf.name.split(" ")[0]}
                </span>
              </div>
            </div>
          ) : partitionMode === "trem_4" ? (
            // Visual splitscreen for 4 segments using dynamic selected tremFlavors
            <div className="w-full h-full flex divide-x-2 divide-white relative">
              <div className="w-1/4 h-full overflow-hidden relative">
                <img src={pizza.imageUrl} alt={pizza.name} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"; }} className="absolute inset-0 w-full h-full object-cover scale-x-120" />
                <span className="absolute bottom-2.5 left-1 z-10 text-fluid-xs font-bold bg-black/90 text-white p-fluid-xs rounded-md">
                  1/4: {pizza.name.split(" ")[0]}
                </span>
              </div>
              <div className="w-1/4 h-full overflow-hidden relative">
                <img src={tremFlavors[0] ? tremFlavors[0].imageUrl : pizza.imageUrl} alt="Sabor 2" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"; }} className={`absolute inset-0 w-full h-full object-cover scale-x-120 ${!tremFlavors[0] ? "opacity-35 grayscale" : ""}`} />
                <span className="absolute bottom-2.5 left-1 z-10 text-fluid-xs font-bold bg-black/90 text-white p-fluid-xs rounded-md">
                  2/4: {tremFlavors[0] ? tremFlavors[0].name.split(" ")[0] : "Vazio"}
                </span>
              </div>
              <div className="w-1/4 h-full overflow-hidden relative">
                <img src={tremFlavors[1] ? tremFlavors[1].imageUrl : pizza.imageUrl} alt="Sabor 3" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"; }} className={`absolute inset-0 w-full h-full object-cover scale-x-120 ${!tremFlavors[1] ? "opacity-35 grayscale" : ""}`} />
                <span className="absolute bottom-2.5 left-1 z-10 text-fluid-xs font-bold bg-black/90 text-white p-fluid-xs rounded-md">
                  3/4: {tremFlavors[1] ? tremFlavors[1].name.split(" ")[0] : "Vazio"}
                </span>
              </div>
              <div className="w-1/4 h-full overflow-hidden relative">
                <img src={tremFlavors[2] ? tremFlavors[2].imageUrl : pizza.imageUrl} alt="Sabor 4" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"; }} className={`absolute inset-0 w-full h-full object-cover scale-x-120 ${!tremFlavors[2] ? "opacity-35 grayscale" : ""}`} />
                <span className="absolute bottom-2.5 left-1 z-10 text-fluid-xs font-bold bg-black/90 text-white p-fluid-xs rounded-md">
                  4/4: {tremFlavors[2] ? tremFlavors[2].name.split(" ")[0] : "Vazio"}
                </span>
              </div>
            </div>
          ) : (
            // Normal Single Pizza View / Multiple Image Carousel
            <div className="w-full h-full relative group">
              <img
                src={imagesList[activeImageIndex]}
                alt={`${pizza.name} - Foto ${activeImageIndex + 1}`}
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"; }}
                className="w-full h-full object-cover transition-all duration-300 animate-in fade-in duration-250"
              />

              {/* Slider Arrows (only visible if more than 1 image) */}
              {imagesList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(prev => (prev === 0 ? imagesList.length - 1 : prev - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-1.5 rounded-full text-white transition-opacity cursor-pointer z-10 flex items-center justify-center shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(prev => (prev === imagesList.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-1.5 rounded-full text-white transition-opacity cursor-pointer z-10 flex items-center justify-center shadow-xs"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
                    {imagesList.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(idx);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          idx === activeImageIndex ? "bg-instagram-pink w-3.5" : "bg-white/60 hover:bg-white"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Stuffed Edge Visual Tracker bottom left */}
          {selectedBorda !== "none" && canHaveAddOns && (
            <div className="absolute top-4 left-4 z-10 bg-instagram-pink/90 backdrop-blur-xs text-white text-fluid-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1">
              <span>✓ {nicheConfig.addOnsName} Selecionado!</span>
            </div>
          )}
        </div>

        {/* RIGHT COMPONENT: Action / Config Pane */}
        <div className="w-full md:w-1/2 flex flex-col max-h-[50vh] md:max-h-full overflow-y-auto">
          {/* Header Pizzato handle profile */}
          <div className="px-fluid-sm py-fluid-xs border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink p-[1.5px] shrink-0">
              {pizzeriaLogo ? (
                <img 
                  src={pizzeriaLogo} 
                  alt={pizzeriaName}
                  className="w-full h-full rounded-full border border-white object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full rounded-full border border-white bg-instagram-pink flex items-center justify-center text-white font-serif text-xs font-bold">
                  {pizzeriaName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-fluid-sm text-gray-900">
                  {pizzeriaName.toLowerCase().replace(/\s+/g, "_")}
                </span>
                <span className="w-3.5 h-3.5 bg-instagram-blue rounded-full flex items-center justify-center text-[0.625rem] text-white font-bold">✓</span>
              </div>
              <p className="text-fluid-xs text-gray-555">
                {niche === "pizzaria" ? "Forno de Pizza a Lenha • Original" :
                 niche === "hamburgueria" ? "Grelhados Artesanais na Grelha" :
                 niche === "sushi" ? "Sushis & Combinados Tradicionais" :
                 niche === "adega" ? "Bebidas Geladas & Conveniência" :
                 "Doces Confeitados & Artesanais"}
              </p>
            </div>
          </div>

          {/* Pizza Description Info */}
          <div className="p-fluid-md flex-1">
            <div className="flex justify-between items-start mb-1.5 gap-2">
              <h1 className="text-fluid-lg sm:text-fluid-2xl font-black tracking-tight text-gray-900" style={{ fontFamily: "Space Grotesk" }}>
                {pizza.name}
              </h1>
                       {/* Instagram Like & Save Buttons grouped together */}
              <div className="flex gap-2 shrink-0">
                {/* Instagram Like Button directly in detail */}
                <button
                  type="button"
                  onClick={handleLike}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-full transition-all border border-gray-150 cursor-pointer animate-in fade-in"
                >
                  <Heart className={`w-4 h-4 transition-transform active:scale-125 ${liked ? "fill-instagram-pink text-instagram-pink" : "text-gray-500"}`} />
                  <span className="text-fluid-xs font-bold">{likesCount}</span>
                </button>

                {/* Save to Favorites Button */}
                <button
                  type="button"
                  onClick={() => onToggleFavorite && onToggleFavorite(pizza.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-full transition-all border border-gray-150 cursor-pointer animate-in fade-in"
                  title={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
                >
                  <Bookmark className={`w-4 h-4 transition-transform active:scale-125 ${isFavorite ? "fill-amber-500 text-amber-500" : "text-gray-500"}`} />
                  <span className="text-fluid-xs font-bold">{isFavorite ? "Salvo" : "Salvar"}</span>
                </button>
              </div>
            </div>

            <span className="text-fluid-xl font-black text-gray-950 block mb-3 font-mono">
              {pointsEnabled && pizza.priceInPoints && pizza.priceInPoints > 0 
                ? `R$ ${pizza.price.toFixed(2)} ou ${pizza.priceInPoints} ${pointsName}`
                : `R$ ${pizza.price.toFixed(2)}`}
            </span>

            {pointsEnabled && pizza.priceInPoints !== undefined && pizza.priceInPoints > 0 && (
              <div className="mb-4 animate-in fade-in duration-200">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                  Forma de Pagamento para este Item
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPurchaseMode("money")}
                    className={`py-2 rounded-md text-fluid-xs font-black transition-all ${
                      purchaseMode === "money"
                        ? "bg-white text-instagram-pink shadow-xs"
                        : "text-gray-655 hover:text-gray-900"
                    }`}
                  >
                    Dinheiro (R$ {pizza.price.toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurchaseMode("points")}
                    className={`py-2 rounded-md text-fluid-xs font-black transition-all ${
                      purchaseMode === "points"
                        ? "bg-white text-instagram-pink shadow-xs"
                        : "text-gray-655 hover:text-gray-900"
                    }`}
                  >
                    Pontos ({pizza.priceInPoints} {pointsName})
                  </button>
                </div>
              </div>
            )}

            <p className="text-fluid-sm text-gray-700 leading-relaxed font-normal mb-4">
              {pizza.description}
            </p>

            {/* Ingredients Tags list */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {pizza.ingredients.map((ing, i) => (
                <span key={i} className="text-fluid-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full uppercase font-semibold">
                  {ing}
                </span>
              ))}
            </div>

            {isPointsPizza && (
              <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-start gap-2.5 mb-5 animate-in fade-in duration-300">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-fluid-xs font-black text-amber-900 uppercase tracking-wider">Resgate de Item</h4>
                  <p className="text-fluid-xs text-amber-850 leading-relaxed mt-1 font-medium">
                    Itens resgatados por pontos são servidos no tamanho/formato padrão (inteiros, sem adicionais ou personalizações extras).
                  </p>
                </div>
              </div>
            )}

            {/* INTERACTIVE FORM PREFERENCES */}
            {isPizzaNiche && !isPointsPizza && (
              <div className="space-y-4 border-t border-gray-100 pt-4 animate-in fade-in duration-300" id="config-form">
                {/* Option 1: Double flavor / single */}
                {(((meioMeioEnabled ? 1 : 0) + (tremEnabled ? 1 : 0)) > 0) && (
                  <div>
                    <label className="block text-fluid-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Partição de Sabores
                    </label>
                    <div 
                      className="grid gap-1.5 bg-gray-50 p-1 rounded-lg"
                      style={{ gridTemplateColumns: `repeat(${1 + (meioMeioEnabled ? 1 : 0) + (tremEnabled ? 1 : 0)}, minmax(0, 1fr))` }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setPartitionMode("single");
                          setSecondHalf(null);
                          setTremFlavors(Array(Math.max(0, tremMaxFlavors - 1)).fill(null));
                        }}
                        className={`py-2 rounded-md text-fluid-xs font-black transition-all ${
                          partitionMode === "single"
                            ? "bg-white text-instagram-pink shadow-xs"
                            : "text-gray-655 hover:text-gray-900"
                        }`}
                      >
                        Inteira
                      </button>
                      {meioMeioEnabled && (
                        <button
                          type="button"
                          onClick={() => {
                            setPartitionMode("half");
                            setTremFlavors(Array(Math.max(0, tremMaxFlavors - 1)).fill(null));
                          }}
                          className={`py-2 rounded-md text-fluid-xs font-black transition-all ${
                            partitionMode === "half"
                              ? "bg-white text-instagram-pink shadow-xs"
                              : "text-gray-655 hover:text-gray-900"
                          }`}
                        >
                          Meio a Meio (2)
                        </button>
                      )}
                      {tremEnabled && (
                        <button
                          type="button"
                          onClick={() => setPartitionMode("trem_4")}
                          className={`py-2 rounded-md text-fluid-xs font-black transition-all ${
                            partitionMode === "trem_4"
                              ? "bg-white text-instagram-pink shadow-xs"
                              : "text-gray-655 hover:text-gray-900"
                          }`}
                        >
                          Trem ({tremMaxFlavors} Sabores! 🚇)
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Match Slot Selector UI if Trem mode */}
                {partitionMode === "trem_4" && (
                  <div className="animate-in slide-in-from-top-1 duration-150 space-y-2">
                    <label className="block text-fluid-xs font-extrabold text-gray-500 uppercase tracking-wide">
                      Escolha o Slot do Trem para Customizar:
                    </label>
                    <div className="grid gap-2 bg-gray-105 p-1 rounded-lg" style={{ gridTemplateColumns: `repeat(${tremMaxFlavors - 1}, minmax(0, 1fr))` }}>
                      {tremFlavors.map((flavor, index) => {
                        const slotNum = index + 2;
                        const isSlotActive = activeSlot === slotNum;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setActiveSlot(slotNum)}
                            className={`p-1.5 rounded-md text-fluid-xs font-bold transition-all text-center flex flex-col items-center ${
                              isSlotActive ? "bg-instagram-pink text-white font-extrabold shadow-sm" : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="text-fluid-xs scale-90 uppercase font-black tracking-wider text-opacity-80">
                              {slotNum}º Sabor
                            </span>
                            <span className="truncate max-w-[80px] font-extrabold mt-0.5">
                              {flavor ? flavor.name.split(" ")[0] : "Escolher..."}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Visual catalog grid if half and half OR Trem is enabled */}
              {partitionMode !== "single" && (
                <div className="animate-in slide-in-from-top-1 duration-150 space-y-2">
                  <label className="block text-fluid-xs font-bold text-gray-650 uppercase tracking-wide">
                    {partitionMode === "half" ? "Selecione a Outra Metade (Sabor 2)" : `Selecione o ${activeSlot}º sabor`}
                  </label>
                  {filteredPizzasForSecondHalf.length === 0 ? (
                    <p className="text-xs text-red-500 font-medium">Não há outras pizzas nessa mesma categoria.</p>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 border border-gray-150 p-2.5 rounded-xl bg-gray-50/50">
                      {filteredPizzasForSecondHalf.map((p) => {
                        let isSelected = false;
                        if (partitionMode === "half") {
                          isSelected = secondHalf?.id === p.id;
                        } else {
                          isSelected = tremFlavors[activeSlot - 2]?.id === p.id;
                        }
                        return (
                          <div 
                            key={p.id}
                            onClick={() => {
                              if (partitionMode === "half") {
                                setSecondHalf(p);
                              } else {
                                const newFlavors = [...tremFlavors];
                                newFlavors[activeSlot - 2] = p;
                                setTremFlavors(newFlavors);
                                
                                // Automatically shift to the next flavor slot to build the perfect pizza train!
                                if (activeSlot < tremMaxFlavors) {
                                  setActiveSlot(activeSlot + 1);
                                }
                              }
                            }}
                            className={`p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition-all border ${
                              isSelected 
                                ? "border-instagram-pink bg-pink-50/15 ring-1 ring-instagram-pink/40 shadow-xs" 
                                : "border-gray-200 bg-white hover:border-gray-350"
                            }`}
                          >
                            <img 
                              src={p.imageUrl} 
                              alt={p.name} 
                              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"; }}
                              className="w-14 h-14 object-cover rounded-lg border border-gray-150 shrink-0 select-none bg-gray-50"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h5 className="font-extrabold text-fluid-sm text-gray-900 truncate leading-tight">{p.name}</h5>
                                <span className="text-fluid-xs font-mono font-black text-instagram-pink">R$ {p.price.toFixed(2)}</span>
                              </div>
                              
                              <p className="text-fluid-xs text-gray-555 line-clamp-1 leading-normal mt-0.5 font-light font-mono">
                                {p.ingredients.join(", ")}
                              </p>

                              <div className="flex justify-between items-center mt-2">
                                <span className={`text-fluid-xs font-black uppercase px-2 py-0.5 rounded-md ${
                                  isSelected ? "bg-instagram-pink text-white" : "bg-gray-100 text-gray-555"
                                }`}>
                                  {isSelected ? "Selecionada" : "Selecionar"}
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onLikePizza(p.id);
                                    setLikedPizzas(prev => ({ ...prev, [p.id]: !prev[p.id] }));
                                  }}
                                  className="flex items-center gap-1 hover:text-instagram-pink text-gray-400 group transition-colors px-1 py-0.5"
                                >
                                  <Heart className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                                    likedPizzas[p.id] ? "fill-instagram-pink text-instagram-pink" : ""
                                  }`} />
                                  <span className="text-fluid-xs font-bold">Curtir</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-fluid-xs text-gray-555 mt-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-instagram-pink shrink-0" /> 
                    {meioMeioPriceMode === "average" ? "Preço calculado pela média simples dos sabores." : "Preço calculado com base no sabor mais caro escolhido."}
                  </p>
                </div>
              )}
              </div>
            )}

            {/* Niche-Specific Options (Hamburgueria, Sushi, Adega, Doceria) */}
            {!isPizzaNiche && !isPointsPizza && (
              <div className="space-y-4 border-t border-gray-100 pt-4 animate-in fade-in duration-300">
                {niche === "hamburgueria" && (
                  <div>
                    <label className="block text-fluid-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Ponto da Carne
                    </label>
                    <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1 rounded-lg">
                      {["Mal Passado", "Ao Ponto", "Bem Passado"].map((pt) => (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => setMeatPoint(pt)}
                          className={`py-2 rounded-md text-fluid-xs font-black transition-all ${
                            meatPoint === pt
                              ? "bg-white text-instagram-pink shadow-xs"
                              : "text-gray-655 hover:text-gray-900"
                          }`}
                        >
                          {pt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {niche === "adega" && (
                  <div>
                    <label className="block text-fluid-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Temperatura da Bebida
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-lg">
                      {["Natural", "Trincando de Gelada"].map((temp) => (
                        <button
                          key={temp}
                          type="button"
                          onClick={() => setTemperature(temp)}
                          className={`py-2 rounded-md text-fluid-xs font-black transition-all ${
                            temperature === temp
                              ? "bg-white text-instagram-pink shadow-xs"
                              : "text-gray-655 hover:text-gray-900"
                          }`}
                        >
                          {temp}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {niche === "sushi" && (
                  <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="needs-hashi-checkbox"
                      checked={needsHashi}
                      onChange={(e) => setNeedsHashi(e.target.checked)}
                      className="w-4.5 h-4.5 text-instagram-pink border-gray-300 rounded-sm focus:ring-instagram-pink"
                    />
                    <label htmlFor="needs-hashi-checkbox" className="text-fluid-xs font-bold text-gray-700 cursor-pointer select-none">
                      Precisa de Hashi e Adaptador? 🥢
                    </label>
                  </div>
                )}

                {niche === "doceria" && (
                  <div>
                    <label className="block text-fluid-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Dedicatória / Mensagem na Embalagem
                    </label>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Ex: Feliz Aniversário, Ana! De: João (máx. 100 caracteres)"
                      maxLength={100}
                      rows={2}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-fluid-xs focus:outline-none focus:ring-1 focus:ring-instagram-pink"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Option 2: Choose Add-ons / Bordas for all niches */}
            {!isPointsPizza && canHaveAddOns && (
              <div className="space-y-4 border-t border-gray-100 pt-4 animate-in fade-in duration-300">
                <div>
                  <label className="block text-fluid-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Escolha o(a) {nicheConfig.addOnsName}
                  </label>
                  <div className="grid grid-cols-2 gap-2" id="border-picker-grid">
                    {activeBordas.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBorda(b.id as BordaType)}
                        className={`p-fluid-sm border rounded-xl text-left transition-all ${
                          selectedBorda === b.id
                            ? "border-instagram-pink bg-pink-50/20 text-gray-900 scale-[1.02]"
                            : "border-gray-200 hover:bg-gray-50 text-gray-600"
                        }`}
                      >
                        <span className="block text-fluid-sm font-bold leading-tight">{b.name}</span>
                        <span className="text-fluid-xs text-gray-400 font-mono font-medium block mt-0.5">
                          {b.price === 0 ? "Grátis" : `+ R$ ${b.price.toFixed(2)}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM BAR: Dynamic Sum, Counter, and Add Actions */}
          <div className="sticky bottom-0 bg-gray-50 p-fluid-sm border-t border-gray-150 mt-auto shadow-lg">
            {/* Quick Pricing Audit trail */}
            <div className="text-fluid-xs text-gray-500 space-y-1 mb-4">
              {partitionMode === "half" && secondHalf && (
                <div className="flex justify-between">
                  <span>Valores: {pizza.name.split(" ")[0]} x {secondHalf.name.split(" ")[0]}</span>
                  <span className="font-mono font-bold">R$ {pizza.price.toFixed(2)} x R$ {secondHalf.price.toFixed(2)}</span>
                </div>
              )}
              {partitionMode === "trem_4" && (
                <div className="flex flex-col gap-1 border-l-2 border-instagram-pink/35 pl-2">
                  <div className="flex justify-between text-[11px] font-bold text-gray-700">
                    <span>Sabor 1 ({pizza.name.split(" ")[0]}):</span>
                    <span className="font-mono text-instagram-pink">R$ {pizza.price.toFixed(2)}</span>
                  </div>
                  {tremFlavors.map((flavor, index) => (
                    <div key={index} className="flex justify-between text-[11px] font-bold text-gray-700">
                      <span>Sabor {index + 2} {flavor ? `(${flavor.name.split(" ")[0]})` : ""}:</span>
                      <span className="font-mono text-instagram-pink">
                        {flavor ? `R$ ${flavor.price.toFixed(2)}` : "Não selecionado"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {selectedBorda !== "none" && canHaveAddOns && (
                <div className="flex justify-between text-[11px] font-bold text-gray-700">
                  <span>Adicional ({activeBordas.find(x => x.id === selectedBorda)?.name}):</span>
                  <span className="font-mono text-instagram-pink">+ R$ {bordaPrice.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
              {/* Left detail: Price and Quantity */}
              <div>
                <span className="text-fluid-xs text-gray-555 uppercase font-bold block leading-none mb-1">Total</span>
                <span className="text-fluid-2xl font-black text-gray-950 font-mono tracking-tight block">
                  {isPointsPizza ? `${totalPointsPrice} ${pointsName}` : `R$ ${totalPrice.toFixed(2)}`}
                </span>
              </div>

              {/* Sizer adjusters */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center bg-white rounded-xl border border-gray-350 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2.5 hover:bg-gray-55 hover:text-red-500 text-gray-600 rounded-l-xl transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-fluid-sm font-black font-mono text-gray-900 select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-2.5 hover:bg-gray-55 hover:text-green-500 text-gray-655 rounded-r-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Main add button */}
                <button
                  type="button"
                  onClick={handleAddToCartClick}
                  disabled={(partitionMode === "half" && !secondHalf) || (partitionMode === "trem_4" && tremFlavors.some(f => !f))}
                  className="flex-1 sm:flex-initial px-5 py-3 bg-gradient-to-r from-instagram-pink via-instagram-orange to-instagram-pink hover:opacity-95 text-white disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed rounded-xl text-fluid-xs sm:text-fluid-sm font-black flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  id="add-to-direct-btn"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>Adicionar ao Carrinho</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
