import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Sparkles, Navigation, CheckCircle, 
  Settings, ShoppingBag, Eye, Shield, HelpCircle, ArrowRight, ArrowLeft, Play, Smartphone
} from "lucide-react";

interface WalkthroughTourProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: "feed" | "direct" | "admin") => void;
  isAdminLoggedIn: boolean;
}

export default function WalkthroughTour({ isOpen, onClose, onSelectTab, isAdminLoggedIn }: WalkthroughTourProps) {
  const [activeRole, setActiveRole] = useState<"client" | "admin">("client");
  const [currentStep, setCurrentStep] = useState(0);
  const [adminWarning, setAdminWarning] = useState<string | null>(null);

  const clientSteps = [
    {
      title: "📸 Explore o Feed de Pizzas",
      description: "Navegue pelo aplicativo como em um perfil do Instagram! Role o feed infinito, curta seus sabores prediletos e clique na foto de qualquer pizza para abrir as opções completas e ver a prova social (comentários interativos).",
      actionLabel: "Ver o Feed de Postagens",
      targetTab: "feed" as const,
      highlightElement: "feed-tab",
      badge: "Passo 1 de 4"
    },
    {
      title: "🍕 Monte Personalizado (Até 4 Sabores!)",
      description: "Ao abrir uma publicação, você entra em um montador interativo repleto de opções. Escolha a borda recheada perfeita, e selecione até 4 sabores diferentes na montagem exclusiva do 'Trem de Pizza'!",
      actionLabel: "Experimentar Montagem",
      targetTab: "feed" as const,
      highlightElement: "pizza-selector",
      badge: "Passo 2 de 4"
    },
    {
      title: "💬 Sacola de Compras no Direct",
      description: "Seu carrinho fica embutido diretamente nas Mensagens (Direct). Toque no botão 'Carrinho' abaixo para revisar seu pedido, inserir seu endereço de entrega com CEP automático e clicar para enviar o pedido direto para o WhatsApp comercial da loja!",
      actionLabel: "Abrir o Carrinho (Direct)",
      targetTab: "direct" as const,
      highlightElement: "direct-tab",
      badge: "Passo 3 de 4"
    },
    {
      title: "🛵 Acompanhe Rastreamento GPS Ativo",
      description: "Assim que enviar o pedido, você terá acesso a uma tela de acompanhamento em tempo real! Ela mostra um mapa estilizado e a exata movimentação fictícia da sua entrega com alertas sonoros automáticos à medida que o status avança.",
      actionLabel: "Entendido",
      targetTab: "feed" as const,
      highlightElement: "tracking-system",
      badge: "Passo 4 de 4"
    }
  ];

  const adminSteps = [
    {
      title: "🔑 Entre na sua Área Administrativa",
      description: "Para entrar como proprietário, deslogue do seu perfil de cliente clicando em 'Sair' no topo direito e, na tela inicial, clique no botão vermelho 'Acesso do Adm / Proprietário'. Use a senha cadastrada (padrão do sistema: admin).",
      actionLabel: "Fazer Fluxo Admin",
      targetTab: "feed" as const,
      highlightElement: "admin-access",
      badge: "Passo 1 de 4"
    },
    {
      title: "⚙️ Domine Todos os Sabores e Preços",
      description: "Dentro do Painel Administrativo, você pode cadastrar novas pizzas, anexar fotos direto da internet, excluir sabores indisponíveis, mudar a senha e alterar o nome da marca em todo o site em 1 segundo!",
      actionLabel: "Acessar Painel do Adm",
      targetTab: "admin" as const,
      highlightElement: "admin-panel",
      badge: "Passo 2 de 4"
    },
    {
      title: "📋 Fila de Pedidos em Tempo Real",
      description: "Veja os pedidos caírem sincronizados na sua tela de gestão. Sempre que um cliente fecha um pedido, ele aparece aqui para você administrar de forma limpa, simples e sem comissões.",
      actionLabel: "Visualizar Pedidos",
      targetTab: "admin" as const,
      highlightElement: "orders-management",
      badge: "Passo 3 de 4"
    },
    {
      title: "📲 Alerta Sonora de Pedido com Cliente",
      description: "Com apenas um clique no botão de status, mude para 'No forno' ou 'Saiu para entrega'. Um sinal de notificação instantâneo será enviado para o celular do cliente ao vivo, fazendo o celular dele receber faturamento em tempo real!",
      actionLabel: "Testar Disparos",
      targetTab: "admin" as const,
      highlightElement: "push-dispatcher",
      badge: "Passo 4 de 4"
    }
  ];

  const steps = activeRole === "client" ? clientSteps : adminSteps;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    setAdminWarning(null);
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onSelectTab(steps[nextStep].targetTab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setAdminWarning(null);
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onSelectTab(steps[prevStep].targetTab);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-xs font-sans"
        id="tour-visual-overlay"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="bg-white w-full max-w-lg rounded-2xl shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
          id="tour-card"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-instagram-pink via-instagram-orange to-instagram-purple text-white px-5 py-4 shrink-0 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" style={{ animationDuration: "8s" }} />
              <div>
                <h3 className="font-extrabold text-sm tracking-tight leading-tight md:text-base">
                  Guia do Sistema PizzatoGram
                </h3>
                <p className="text-[10px] text-white/80 font-semibold">Aprenda a testar e dominar o sistema em minutos</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer shrink-0"
              title="Fechar Guia"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role selector tabs */}
          <div className="bg-gray-50 border-b border-gray-150 p-2.5 shrink-0 flex gap-2">
            <button
              onClick={() => {
                setActiveRole("client");
                setCurrentStep(0);
                onSelectTab("feed");
                setAdminWarning(null);
              }}
              className={`flex-1 py-1 px-2.5 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === "client" 
                  ? "bg-white text-instagram-pink shadow-xs border border-gray-200" 
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Smartphone className="w-4 h-4 text-instagram-pink" />
              <span>Visão do Cliente</span>
            </button>
            <button
              onClick={() => {
                setActiveRole("admin");
                setCurrentStep(0);
                onSelectTab("feed");
                setAdminWarning(null);
              }}
              className={`flex-1 py-1 px-2.5 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === "admin" 
                  ? "bg-white text-indigo-600 shadow-xs border border-gray-200" 
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Visão do Administrador</span>
            </button>
          </div>

          {/* Body Info */}
          <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-black text-[9px] uppercase tracking-wide">
                {currentStepData.badge}
              </span>
              <span className="text-[10px] text-gray-400 font-bold">
                {activeRole === "client" ? "Cliente Final" : "Adm / Proprietário"}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-gray-900 font-black text-sm md:text-base tracking-tight">
                {currentStepData.title}
              </h4>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed font-medium">
                {currentStepData.description}
              </p>
            </div>

            {/* Simulated mini screen display to help locate */}
            <div className="bg-neutral-50 rounded-xl p-3 border border-gray-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-instagram-pink/10 text-instagram-pink flex items-center justify-center font-bold text-sm shrink-0">
                💡
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 text-xs">Onde testar agora no app?</h5>
                <p className="text-gray-500 text-[11px] leading-snug mt-0.5">
                  Ao clicar no botão de ação abaixo, o sistema irá focar automaticamente na seção correta do aplicativo para você testar esse passo ao vivo!
                </p>
              </div>
            </div>

            {adminWarning && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-[11px] font-bold leading-snug"
              >
                ⚠️ {adminWarning}
              </motion.div>
            )}
          </div>

          {/* Action buttons Footer */}
          <div className="bg-gray-50 p-4 shrink-0 border-t border-gray-150 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`py-2 px-3.5 bg-white text-gray-500 rounded-lg border border-gray-200 transition-all font-bold text-xs flex items-center gap-1 ${
                currentStep === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-neutral-100"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <button
              onClick={() => {
                onSelectTab(currentStepData.targetTab);
                if (activeRole === "admin" && !isAdminLoggedIn) {
                  setAdminWarning("Para acessar as abas administrativas do proprietário, saia da sua conta cliente (clicando em 'Sair' no topo do feed) e conclua o login clicando no link vermelho 'Acesso do Admin / Proprietário' com usuário 'admin' e senha 'admin'.");
                } else {
                  setAdminWarning(null);
                }
              }}
              className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-650 rounded-lg text-xs font-bold tracking-tight transition-all"
            >
              Focar Seção Principal 🔍
            </button>

            <button
              onClick={handleNext}
              className="py-2 px-4 bg-gradient-to-r from-instagram-pink via-instagram-orange to-instagram-purple text-white rounded-lg transition-all text-xs font-black flex items-center gap-1 shadow-xs hover:brightness-105 active:scale-95"
            >
              <span>{currentStep === steps.length - 1 ? "Concluir" : "Próximo"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
