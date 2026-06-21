import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Image as ImageIcon, CheckCircle, AlertCircle, Trash2, Camera, Upload, Type, Save, Sparkles, Sliders, ChevronLeft, RefreshCw } from "lucide-react";
import { Story, StoryTextOverlay } from "../types";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  categories: { id: string; emoji: string; label: string }[];
  stories: Story[];
  onAddStory: (storyData: {
    title: string;
    emoji: string;
    image: string;
    header: string;
    description: string;
    textOverlays?: StoryTextOverlay[];
  }) => Promise<boolean>;
  onDeleteStory?: (storyId: string) => Promise<boolean>;
  onAddPizza: (pizzaData: any) => Promise<boolean>;
}

const PRESET_STORY_IMAGES = [
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1613564834644-a1707b282b86?w=800&auto=format&fit=crop&q=80",
];

const FONT_FAMILIES = [
  { id: "'Montserrat', sans-serif", label: "Moderno" },
  { id: "'Pacifico', cursive", label: "Neon" },
  { id: "'Playfair Display', serif", label: "Editorial" },
  { id: "Impact, sans-serif", label: "Impacto" },
  { id: "'JetBrains Mono', monospace", label: "Mono" }
];

const OVERLAY_COLORS = [
  "#FFFFFF", "#FBBF24", "#22C55E", "#EC4899", "#3B82F6", "#EF4444", "#000000"
];

export default function CreatePostModal({
  isOpen,
  onClose,
  isAdmin,
  categories,
  stories,
  onAddStory,
  onAddPizza
}: CreatePostModalProps) {
  // Modal Mode: Story composer of Pizza Menu creator
  const [editorMode, setEditorMode] = useState<"camera" | "pizza">("camera");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // States of story design
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyHeader, setStoryHeader] = useState("");
  const [storyDescription, setStoryDescription] = useState("");

  // Overlays
  const [textOverlays, setTextOverlays] = useState<StoryTextOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  // Camera settings
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pizzaFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Pizza form state
  const [pizzaName, setPizzaName] = useState("");
  const [pizzaPrice, setPizzaPrice] = useState("");
  const [pizzaCategory, setPizzaCategory] = useState(categories[0]?.id || "Salgada");
  const [pizzaImageUrl, setPizzaImageUrl] = useState("https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80");
  const [pizzaDescription, setPizzaDescription] = useState("");
  const [pizzaIngredients, setPizzaIngredients] = useState("");

  const handlePizzaImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPizzaImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Start the device camera
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    setCapturedImage(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn("Primary camera fail, falling back", err);
      try {
        const fallbackMedia = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        setStream(fallbackMedia);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackMedia;
          videoRef.current.play();
        }
      } catch (fallbackErr) {
        setCameraError("Câmera bloqueada ou indisponível. Use a galeria.");
        setIsCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Start camera instantly when component opens in default camera layout
  useEffect(() => {
    if (isOpen && editorMode === "camera" && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, editorMode]);

  // Capture snapshot from stream
  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      // high aspect ratio 9:16
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // center crop
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;
        const videoRatio = vWidth / vHeight;
        const targetRatio = canvas.width / canvas.height;

        let sx = 0, sy = 0, sWidth = vWidth, sHeight = vHeight;
        if (videoRatio > targetRatio) {
          sWidth = vHeight * targetRatio;
          sx = (vWidth - sWidth) / 2;
        } else {
          sHeight = vWidth / targetRatio;
          sy = (vHeight - sHeight) / 2;
        }

        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Handle local image file upload converting to Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setCapturedImage(reader.result);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset quick picker trigger
  const handleChoosePreset = (url: string) => {
    setCapturedImage(url);
    stopCamera();
  };

  // Overlays control
  const handleAddOverlay = () => {
    const newOverlay: StoryTextOverlay = {
      id: `overlay_${Date.now()}`,
      text: "Toque para Editar",
      color: "#FFFFFF",
      fontFamily: "'Playfair Display', serif",
      fontSize: 26,
      x: 50,
      y: 40 + textOverlays.length * 10
    };
    setTextOverlays([...textOverlays, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
  };

  const updateSelectedOverlay = (fields: Partial<StoryTextOverlay>) => {
    if (!selectedOverlayId) return;
    setTextOverlays(textOverlays.map(o => o.id === selectedOverlayId ? { ...o, ...fields } : o));
  };

  const handleDeleteOverlay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTextOverlays(textOverlays.filter(o => o.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  };

  const handleSubmitStory = async () => {
    if (!capturedImage) {
      setStatusMessage({ type: "error", text: "Tire uma foto ou carregue uma imagem primeiro!" });
      return;
    }
    
    // Auto populate default values if empty to keep it beautiful
    const finalTitle = storyTitle.trim() || "Novidade 🔥";
    const finalHeader = storyHeader.trim() || "Oferta Especial";
    const finalDescription = storyDescription.trim() || "Aproveite esta promoção deliciosa!";

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const success = await onAddStory({
        title: finalTitle,
        emoji: "🍕",
        image: capturedImage,
        header: finalHeader,
        description: finalDescription,
        textOverlays: textOverlays
      });

      if (success) {
        setStatusMessage({ type: "success", text: "Story compartilhado com sucesso no Instagram!" });
        setTimeout(() => {
          setCapturedImage(null);
          setStoryTitle("");
          setStoryHeader("");
          setStoryDescription("");
          setTextOverlays([]);
          setSelectedOverlayId(null);
          setStatusMessage(null);
          onClose();
        }, 1500);
      } else {
        setStatusMessage({ type: "error", text: "Erro ao postar story." });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Ocorreu um erro ao salvar." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPizza = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pizzaName.trim() || !pizzaPrice || !pizzaDescription.trim()) {
      setStatusMessage({ type: "error", text: "Preencha todos os campos obrigatórios!" });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const parsedIngredients = pizzaIngredients
        ? pizzaIngredients.split(",").map(i => i.trim()).filter(Boolean)
        : ["Gourmet", "Artesanal"];

      const success = await onAddPizza({
        name: pizzaName.trim(),
        description: pizzaDescription.trim(),
        price: parseFloat(pizzaPrice) || 0,
        imageUrl: pizzaImageUrl.trim(),
        category: pizzaCategory,
        ingredients: parsedIngredients,
        likes: 0,
        comments: []
      });

      if (success) {
        setStatusMessage({ type: "success", text: "Pizza inserida com sucesso no cardápio!" });
        setPizzaName("");
        setPizzaPrice("");
        setPizzaDescription("");
        setPizzaIngredients("");
        setTimeout(() => {
          setStatusMessage(null);
          onClose();
        }, 1500);
      } else {
        setStatusMessage({ type: "error", text: "Falha ao registrar pizza." });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Erro ao salvar item." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentSelectedOverlay = textOverlays.find(o => o.id === selectedOverlayId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-0 sm:p-4">
        {/* MODAL MAIN DIALOG PORTABLE ACCORDING TO USER ROLE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-zinc-950 w-full max-w-[420px] aspect-[9/19] sm:h-[88vh] h-[100dvh] sm:rounded-3xl border border-zinc-850 overflow-hidden flex flex-col shadow-2xl"
          onClick={() => setSelectedOverlayId(null)}
        >
          {/* NON-ADMIN SECURITY WARNING */}
          {!isAdmin ? (
            <div className="p-8 text-center space-y-6 my-auto text-zinc-100">
              <div className="w-16 h-16 bg-red-950/50 border border-red-800 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl">
                ⚠️
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold uppercase text-xs tracking-wider text-red-500">Acesso Restrito ao Administrador</h4>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  Postar Stories promocionais e cadastrar novas pizzas são ações exclusivas do <span className="font-bold text-zinc-200">Administrador / Proprietário</span> do restaurante.
                </p>
                <div className="bg-indigo-950/40 border border-indigo-900 text-indigo-400 p-3.5 rounded-2xl text-[11px] leading-relaxed mt-4 font-bold">
                  Dica: Para simular, clique em "Sair" na barra de navegação, e então entre usando o botão vermelho de acesso administrativo (senha padrão: "admin").
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Voltar ao feed
              </button>
            </div>
          ) : (
            <>
              {/* THE ACTIVE CAMERA COMPOSER CONTAINER */}
              {editorMode === "camera" ? (
                <div className="relative flex-1 flex flex-col justify-between">
                  {/* LIVE STREAM OR SNAPSHOT PREVIEW FRAMING (9:16) */}
                  <div className="absolute inset-0 bg-black">
                    {!capturedImage ? (
                      /* Live Camera viewport */
                      isCameraActive ? (
                        <div className="w-full h-full relative">
                          <video
                            ref={videoRef}
                            playsInline
                            muted
                            className="w-full h-full object-cover scale-x-[-1]"
                          />
                          {/* Real-time scanning visualizer */}
                          <div className="absolute inset-0 border border-zinc-500/10 pointer-events-none" />
                        </div>
                      ) : (
                        /* Camera Loader / Fallback selector */
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400 bg-neutral-900/60 font-medium">
                          <Camera className="w-12 h-12 text-zinc-600 mb-3 animate-pulse" />
                          <p className="text-xs max-w-xs">{cameraError || "Iniciando câmera..."}</p>
                          <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Escolha um Preset</span>
                            <div className="grid grid-cols-4 gap-2">
                              {PRESET_STORY_IMAGES.map((url, idx) => (
                                <button
                                  key={url}
                                  onClick={() => handleChoosePreset(url)}
                                  className="h-14 rounded-lg overflow-hidden border border-zinc-750 active:scale-95 transition-transform"
                                >
                                  <img src={url} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                            <span className="text-zinc-650 text-[10px] my-1">ou envie do celular abaixo</span>
                          </div>
                        </div>
                      )
                    ) : (
                      /* Snapshot Preview background holding the exact image */
                      <div className="w-full h-full relative">
                        <img 
                          src={capturedImage} 
                          alt="Story snapshot preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                        {/* SHARP DYNAMIC VECTOR OVERLAYS */}
                        {textOverlays.map((item) => {
                          const isSelected = item.id === selectedOverlayId;
                          return (
                            <div
                              key={item.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOverlayId(item.id);
                              }}
                              className={`absolute cursor-pointer break-words max-w-[85%] px-2 py-1 rounded transition-all select-none hover:bg-white/10 ${
                                isSelected ? "ring-2 ring-pink-500 bg-black/45" : ""
                              }`}
                              style={{
                                left: `${item.x}%`,
                                top: `${item.y}%`,
                                transform: "translate(-50%, -50%)",
                                color: item.color,
                                fontFamily: item.fontFamily,
                                fontSize: `${item.fontSize}px`,
                                textShadow: "0 2.5px 5px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.6)"
                              }}
                            >
                              {item.text}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* TOP CONTROL OVERLAYS */}
                  <div className="relative z-10 flex items-center justify-between p-4">
                    {/* Discard / Close button */}
                    <button
                      onClick={() => {
                        if (capturedImage) {
                          setCapturedImage(null);
                          setTextOverlays([]);
                          setSelectedOverlayId(null);
                          startCamera();
                        } else {
                          stopCamera();
                          onClose();
                        }
                      }}
                      className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md active:scale-90 transition-all cursor-pointer hover:bg-black/60"
                      title="Fechar ou Descartar"
                    >
                      <ChevronLeft className="w-5 h-5 font-bold" />
                    </button>

                    {/* PIZZA SWITCHER AND TEXT WRITER TOGGLE */}
                    <div className="flex items-center gap-1.5">
                      {/* Aa (ADD OVERLAY TEXT BUTTON): PLACE ON TOP RIGHT (SUPERIOR DIREITO) */}
                      {capturedImage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddOverlay();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                          title="Escrever algo"
                        >
                          <Type className="w-4 h-4" /> Add Texto
                        </button>
                      )}

                      {/* Switch to Pizza adding tab */}
                      <button
                        onClick={() => {
                          stopCamera();
                          setEditorMode("pizza");
                        }}
                        className="p-2 rounded-full bg-black/40 text-zinc-300 backdrop-blur-sm hover:text-white"
                        title="Cadastrar Nova Pizza"
                      >
                        <Plus className="w-4 h-4 inline mr-1" /> Pizza
                      </button>
                    </div>
                  </div>

                  {/* BOTTOM CONTROL OVERLAYS & CAMERA CAPTURE SHUTTER SHOWN WHEN NOT CAPTURED */}
                  {!capturedImage ? (
                    <div className="relative z-10 p-4 space-y-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                      {/* Camera stream actions line */}
                      <div className="flex items-center justify-between px-4 pb-2">
                        {/* GALLERY PIC ON THE LOWER LEFT (CANTO INFERIOR ESQUERDO) */}
                        <div className="relative">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center text-zinc-400 active:scale-95 transition-transform shrink-0 relative"
                            title="Subir de arquivo local"
                          >
                            <ImageIcon className="w-5 h-5" />
                            <div className="absolute bottom-0 right-0 bg-pink-500 text-white p-0.5 rounded-tl">
                              <Plus className="w-2.5 h-2.5 font-bold" />
                            </div>
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>

                        {/* BIG GLOWING CAPTURE SHUTTER CIRCLE IN BOTTOM CENTER */}
                        {isCameraActive && (
                          <button
                            onClick={handleCapture}
                            className="relative w-16 h-16 rounded-full bg-white p-1 shadow-lg border-2 border-white/40 active:scale-90 transition-transform flex items-center justify-center group"
                          >
                            <div className="w-full h-full rounded-full bg-white group-hover:bg-zinc-150 transition-colors" />
                          </button>
                        )}

                        {/* Flip Camera fallback/restart stream indicator */}
                        <button
                          onClick={startCamera}
                          className="p-2 rounded-full bg-zinc-850/60 text-zinc-300 active:rotate-180 transition-transform duration-300"
                          title="Reiniciar Câmera"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* IF CAPTURED: EXPANDED EDITING SLIDER PANEL & FIELD SETTING OVERLAYS */
                    <div className="relative z-10 bg-zinc-950 border-t border-zinc-850 p-4 space-y-3">
                      
                      {/* Active overlay customizing sliders/editors */}
                      {currentSelectedOverlay ? (
                        <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl space-y-3 animate-in slide-in-from-bottom duration-200">
                          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                            <span className="text-[10px] uppercase font-black text-pink-500 tracking-wider">Ajustes do Texto</span>
                            <button
                              onClick={(e) => handleDeleteOverlay(currentSelectedOverlay.id, e)}
                              className="text-[10px] font-bold text-red-400 hover:text-red-500 flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir
                            </button>
                          </div>

                          <div className="space-y-2">
                            {/* Text Input value */}
                            <input
                              type="text"
                              value={currentSelectedOverlay.text}
                              onChange={(e) => updateSelectedOverlay({ text: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-pink-500 outline-none font-bold"
                            />

                            {/* Preset color buttons */}
                            <div className="flex gap-2 py-1 items-center">
                              <span className="text-[9px] text-zinc-500 uppercase font-bold mr-1">Cor:</span>
                              {OVERLAY_COLORS.map(color => (
                                <button
                                  key={color}
                                  onClick={(e) => { e.stopPropagation(); updateSelectedOverlay({ color }); }}
                                  className={`w-5 h-5 rounded-full border border-black transition-transform ${
                                    currentSelectedOverlay.color === color ? "scale-125 ring-1 ring-pink-500" : ""
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>

                            {/* Font families switcher */}
                            <div className="flex flex-wrap gap-1 items-center">
                              <span className="text-[9px] text-zinc-500 uppercase font-bold mr-1">Fonte:</span>
                              {FONT_FAMILIES.map(font => (
                                <button
                                  key={font.id}
                                  onClick={(e) => { e.stopPropagation(); updateSelectedOverlay({ fontFamily: font.id }); }}
                                  className={`text-[9.5px] px-2 py-0.5 rounded border transition-colors ${
                                    currentSelectedOverlay.fontFamily === font.id
                                      ? "bg-pink-600 text-white border-pink-500"
                                      : "bg-zinc-800 text-zinc-300 border-zinc-750"
                                  }`}
                                >
                                  {font.label}
                                </button>
                              ))}
                            </div>

                            {/* Horizontal / Vertical Drag sliders */}
                            <div className="grid grid-cols-3 gap-2 text-[9px] text-zinc-400 font-bold">
                              <div>
                                <span>TAMANHO ({currentSelectedOverlay.fontSize}px)</span>
                                <input
                                  type="range"
                                  min="14"
                                  max="46"
                                  value={currentSelectedOverlay.fontSize}
                                  onChange={(e) => updateSelectedOverlay({ fontSize: parseInt(e.target.value) })}
                                  className="w-full accent-pink-500"
                                />
                              </div>
                              <div>
                                <span>POS. X ({currentSelectedOverlay.x}%)</span>
                                <input
                                  type="range"
                                  min="5"
                                  max="95"
                                  value={currentSelectedOverlay.x}
                                  onChange={(e) => updateSelectedOverlay({ x: parseInt(e.target.value) })}
                                  className="w-full accent-pink-500"
                                />
                              </div>
                              <div>
                                <span>POS. Y ({currentSelectedOverlay.y}%)</span>
                                <input
                                  type="range"
                                  min="5"
                                  max="95"
                                  value={currentSelectedOverlay.y}
                                  onChange={(e) => updateSelectedOverlay({ y: parseInt(e.target.value) })}
                                  className="w-full accent-pink-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-500 text-center italic font-medium py-1">
                          👆 Toque em qualquer texto na imagem para posicionar ou editar
                        </div>
                      )}

                      {/* Small inputs metadata block */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Título do Story (Ex: Promo 🔥)"
                            value={storyTitle}
                            onChange={(e) => setStoryTitle(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-xl text-white outline-none focus:border-zinc-700"
                          />
                          <input
                            type="text"
                            placeholder="Frase chamativa (Ex: Só Hoje!)"
                            value={storyHeader}
                            onChange={(e) => setStoryHeader(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-xl text-white outline-none focus:border-zinc-700"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Breve descrição ou cupom..."
                          value={storyDescription}
                          onChange={(e) => setStoryDescription(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-xl text-white outline-none focus:border-zinc-700"
                        />
                      </div>

                      {/* Share Controls Button */}
                      {statusMessage && (
                        <div className={`p-2 rounded-xl text-[10.5px] font-bold ${
                          statusMessage.type === "success" ? "bg-green-950/50 text-green-400 border border-green-905" : "bg-red-950/50 text-red-400 border border-red-905"
                        }`}>
                          {statusMessage.text}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setCapturedImage(null);
                            setTextOverlays([]);
                            setSelectedOverlayId(null);
                            startCamera();
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-bold text-xs hover:bg-zinc-850/80 active:scale-95 transition-all"
                        >
                          Tirar outra
                        </button>
                        <button
                          onClick={handleSubmitStory}
                          disabled={isSubmitting}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink text-white font-extrabold text-xs active:scale-95 transition-all shadow-md flex items-center justify-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> {isSubmitting ? "Enviando..." : "Postar no Story ✨"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ALTERNATE TAB: ADD PIZZA MENU ITEM */
                <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between text-zinc-150">
                  <form onSubmit={handleSubmitPizza} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-2">
                      <h4 className="text-xs uppercase tracking-wider text-red-500 font-black">Adicionar Pizza ao Cardápio</h4>
                      <button
                        type="button"
                        onClick={() => setEditorMode("camera")}
                        className="text-zinc-400 hover:text-white text-[10px] font-bold bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800"
                      >
                        ← Voltar ao Story
                      </button>
                    </div>

                    {statusMessage && (
                      <div className={`p-2 rounded-xl text-[10.5px] font-bold ${
                        statusMessage.type === "success" ? "bg-green-950/40 text-green-400 border border-green-900" : "bg-red-950/40 text-red-400 border border-red-900"
                      }`}>
                        {statusMessage.text}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-black uppercase mb-1">Nome do Item *</label>
                        <input
                          type="text"
                          required
                          value={pizzaName}
                          onChange={(e) => setPizzaName(e.target.value)}
                          placeholder="Ex: Margherita Suprema"
                          className="w-full text-xs px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-red-500 text-white outline-none font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-zinc-500 font-black uppercase mb-1">Preço (R$) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={pizzaPrice}
                            onChange={(e) => setPizzaPrice(e.target.value)}
                            placeholder="49.90"
                            className="w-full text-xs px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-red-500 text-white outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 font-black uppercase mb-1">Categoria *</label>
                          <select
                            value={pizzaCategory}
                            onChange={(e) => setPizzaCategory(e.target.value)}
                            className="w-full text-xs px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-red-500 text-zinc-300 outline-none font-bold"
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.emoji} {cat.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 font-black uppercase mb-1">Foto da Pizza (Do Celular) *</label>
                        <div className="mt-1 flex items-center gap-3 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                          {/* Active Preview */}
                          <div className="w-14 h-14 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center text-zinc-650 relative shadow-sm">
                            {pizzaImageUrl ? (
                              <img
                                src={pizzaImageUrl}
                                alt="Previa da Pizza"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-zinc-600" />
                            )}
                          </div>

                          <div className="flex-1 space-y-1">
                            <button
                              type="button"
                              onClick={() => pizzaFileInputRef.current?.click()}
                              className="w-full px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
                            >
                              <Upload className="w-3.5 h-3.5 text-pink-500" /> Carregar Foto do Celular
                            </button>
                            <input
                              ref={pizzaFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handlePizzaImageUpload}
                              className="hidden"
                            />
                            <p className="text-[9px] text-zinc-500 font-medium">Toque para tirar foto ou selecionar da galeria.</p>
                          </div>
                        </div>

                        {/* Expandable alternative to write a manual URL */}
                        <div className="mt-1.5 flex items-center justify-between text-[9px] text-zinc-500">
                          <span>Imagem selecionada de forma segura corporativa</span>
                          <button
                            type="button"
                            onClick={() => {
                              const typedUrl = prompt("Digite ou cole o link da imagem da Pizza:", pizzaImageUrl);
                              if (typedUrl !== null && typedUrl.trim() !== "") {
                                setPizzaImageUrl(typedUrl.trim());
                              }
                            }}
                            className="font-bold text-pink-500 hover:text-pink-400 hover:underline transition-all"
                          >
                            Editar URL manualmente 🔗
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 font-black uppercase mb-1">Legenda (Instagram Feed Style) *</label>
                        <textarea
                          required
                          rows={3}
                          value={pizzaDescription}
                          onChange={(e) => setPizzaDescription(e.target.value)}
                          placeholder="Ex: Aquela massa com fermento lento de 48h com o molho artesanal legítimo..."
                          className="w-full text-xs px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-red-500 text-zinc-300 outline-none resize-none leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 font-black uppercase mb-1">Ingredientes (Separados por vírgula)</label>
                        <input
                          type="text"
                          value={pizzaIngredients}
                          onChange={(e) => setPizzaIngredients(e.target.value)}
                          placeholder="Molho, Muçarela, Manjericão, Azeite de oliva"
                          className="w-full text-xs px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-red-500 text-zinc-350 outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-2">
                       <button
                        type="button"
                        onClick={() => setEditorMode("camera")}
                        className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-bold text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-xl bg-red-650 hover:bg-red-700 text-white font-extrabold text-xs"
                      >
                        {isSubmitting ? "Salvando..." : "Salvar no Menu 🥖"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
