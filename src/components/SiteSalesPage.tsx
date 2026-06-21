import React, { useState, useEffect } from "react";
import { X, CreditCard, ShoppingBag, CheckCircle, RefreshCw, Copy, Download, Sparkles, ChevronLeft, Zap, Smartphone, Shield, Settings } from "lucide-react";

interface SiteSalesPageProps {
  onBackToMenu: () => void;
  sitePrice: number;
  siteDriveLink: string;
  pizzeriaName: string;
}

export default function SiteSalesPage({
  onBackToMenu,
  sitePrice,
  siteDriveLink,
  pizzeriaName
}: SiteSalesPageProps) {
  const [checkoutStep, setCheckoutStep] = useState<"info" | "payment" | "confirmed">("info");
  const [method, setMethod] = useState<"pix" | "card">("pix");
  
  // Buyer Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  // Card Inputs
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedPix, setCopiedPix] = useState(false);

  // Mercado Pago Return
  const [mpPixData, setMpPixData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [mpPaymentId, setMpPaymentId] = useState<string | null>(null);

  // Phone Formatter
  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}`;
    }
    if (cleaned.length > 7) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
    setPhone(formatted);
  };

  // CPF Formatter
  const handleCpfChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    let formatted = cleaned;
    if (cleaned.length > 3) formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length > 6) formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    if (cleaned.length > 9) formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
    setCpf(formatted);
  };

  // Card Expiry Formatter
  const handleCardExpiryChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    setCardExpiry(formatted);
  };

  // Card Number Formatter
  const handleCardNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    let formatted = cleaned;
    if (cleaned.length > 4) formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    if (cleaned.length > 8) formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
    if (cleaned.length > 12) formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)} ${cleaned.slice(12, 16)}`;
    setCardNumber(formatted);
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!name || !email || !phone || !cpf) {
      setErrorMessage("Por favor, preencha todos os dados de contato e CPF!");
      return;
    }

    if (method === "card") {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        setErrorMessage("Por favor, preencha todos os campos do cartão!");
        return;
      }
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/sales/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          cpf,
          method,
          cardNumber,
          cardExpiry,
          cardCvv,
          cardName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Erro ao processar pagamento com o Mercado Pago.");
        setIsProcessing(false);
        return;
      }

      const result = await response.json();
      setOrderId(result.orderId);
      setMpPaymentId(result.mpPaymentId);

      if (method === "pix") {
        setMpPixData({
          qr_code: result.qr_code,
          qr_code_base64: result.qr_code_base64
        });
        setCheckoutStep("payment");
      } else {
        if (result.status === "approved" || result.status === "PREPARING") {
          setCheckoutStep("confirmed");
        } else {
          setErrorMessage("Pagamento de cartão não pôde ser aprovado de imediato.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Erro de rede ao conectar com o processador de pagamentos.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Poll for Pix approval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (checkoutStep === "payment" && orderId && method === "pix") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/orders/${orderId}`);
          if (res.ok) {
            const order = await res.json();
            if (order.status !== "PENDING") {
              setCheckoutStep("confirmed");
            }
          }
        } catch (err) {
          console.error("Erro no polling da licença:", err);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [checkoutStep, orderId, method]);

  const copyPixCode = () => {
    if (mpPixData?.qr_code) {
      navigator.clipboard.writeText(mpPixData.qr_code);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-y-auto bg-gray-50 flex flex-col font-sans pb-12">
      {/* Header Bar */}
      <header className="bg-neutral-900 text-white sticky top-0 z-30 px-4 py-4 shadow-md flex items-center justify-start">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar para o Cardápio</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: HERO & FEATURES */}
        <section className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-instagram-pink/10 to-instagram-orange/10 border border-instagram-pink/20 text-instagram-pink px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              ✨ OPORTUNIDADE DE NEGÓCIO
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-905 leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Tenha seu Próprio Delivery no Estilo <span className="bg-gradient-to-r from-instagram-pink via-instagram-orange to-instagram-purple bg-clip-text text-transparent font-black">Instagram</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Adquira a licença de instalação completa do script <strong>Pizagram</strong> e fature vendendo este sistema de delivery premium para donos de pizzarias ou utilizando no seu próprio negócio. Livre de mensalidades e taxas abusivas de aplicativos terceiros.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-white border border-gray-150 p-4 rounded-2xl shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-instagram-pink/5 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-instagram-pink" />
              </div>
              <h4 className="font-extrabold text-gray-900 text-sm">Visual Instagram</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Layout viciante focado em imagens, stories e interações, aumentando o desejo de compra.</p>
            </div>

            <div className="bg-white border border-gray-150 p-4 rounded-2xl shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-instagram-orange/5 flex items-center justify-center">
                <Zap className="w-5 h-5 text-instagram-orange" />
              </div>
              <h4 className="font-extrabold text-gray-900 text-sm">WhatsApp Integrado</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Notificações em tempo real sobre o status do preparo e entrega direto no celular do cliente.</p>
            </div>

            <div className="bg-white border border-gray-150 p-4 rounded-2xl shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-instagram-purple/5 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-instagram-purple" />
              </div>
              <h4 className="font-extrabold text-gray-900 text-sm">Pagamentos Automáticos</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Integração nativa com Mercado Pago para recebimento automático via Pix ou Cartão.</p>
            </div>

            <div className="bg-white border border-gray-150 p-4 rounded-2xl shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-neutral-900/5 flex items-center justify-center">
                <Settings className="w-5 h-5 text-neutral-800" />
              </div>
              <h4 className="font-extrabold text-gray-900 text-sm">Painel do Administrador</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Acesso total para gerenciar produtos, cupons de desconto, taxas e visualizar pedidos ativos.</p>
            </div>

          </div>

          {/* Social Proof Banner */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl p-5 shadow-lg flex items-center gap-4">
            <div className="text-3xl">📦</div>
            <div>
              <h5 className="font-black text-xs sm:text-sm uppercase tracking-wide text-instagram-yellow">O que você vai receber?</h5>
              <p className="text-xs text-gray-300 leading-relaxed mt-1">Cópia limpa e configurável do código-fonte completo (HTML/TypeScript/Node.js) pronta para hospedagem + PDF guia passo a passo ilustrado.</p>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: HIGH CONVERTING INTEGRATED CHECKOUT */}
        <section className="lg:col-span-5">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden sticky top-24">
            
            {/* Form Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-instagram-pink to-instagram-orange text-white flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black text-white/80 block leading-none">Checkout Exclusivo</span>
                <h4 className="text-base font-extrabold mt-1 leading-none">Garanta seu Acesso Agora</h4>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-white/70 block line-through leading-none">de R$ 197,00</span>
                <span className="text-lg font-black font-mono leading-none block mt-0.5">R$ {sitePrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6">
              
              {/* STEP 1: CLIENT DETAILS AND METHOD SELECTOR */}
              {checkoutStep === "info" && (
                <form onSubmit={handleCreatePayment} className="space-y-4">
                  
                  {errorMessage && (
                    <div className="p-3.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold text-center leading-snug">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Seu Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-instagram-pink/30 focus:outline-none font-medium"
                      placeholder="Ex: Marcos Silva"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-black text-gray-550 uppercase mb-1">WhatsApp de Contato</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full text-xs px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-instagram-pink/30 focus:outline-none font-mono"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-555 uppercase mb-1">Seu CPF (MP Obrigatório)</label>
                      <input
                        type="text"
                        required
                        value={cpf}
                        onChange={(e) => handleCpfChange(e.target.value)}
                        className="w-full text-xs px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-instagram-pink/30 focus:outline-none font-mono"
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-550 uppercase mb-1">E-mail para Recebimento</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-instagram-pink/30 focus:outline-none font-medium"
                      placeholder="exemplo@seuemail.com"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Selecione o Método de Pagamento</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMethod("pix")}
                        className={`py-3 px-4 border rounded-xl text-center select-none transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          method === "pix"
                            ? "border-instagram-pink bg-instagram-pink/5 text-gray-900 font-bold"
                            : "border-gray-200 hover:bg-gray-50 text-gray-500"
                        }`}
                      >
                        <span className="text-xl">⚡</span>
                        <span className="text-xs">Pix Copia e Cola</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMethod("card")}
                        className={`py-3 px-4 border rounded-xl text-center select-none transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          method === "card"
                            ? "border-instagram-pink bg-instagram-pink/5 text-gray-900 font-bold"
                            : "border-gray-200 hover:bg-gray-50 text-gray-500"
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-gray-500" />
                        <span className="text-xs">Cartão de Crédito</span>
                      </button>
                    </div>
                  </div>

                  {/* Card specific fields */}
                  {method === "card" && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <div>
                        <label className="block text-[9px] font-black text-gray-550 uppercase mb-1">Nome do Titular (Igual no Cartão)</label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-instagram-pink/30 font-medium"
                          placeholder="MARCOS SILVA"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-550 uppercase mb-1">Número do Cartão</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-instagram-pink/30 font-mono"
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[9px] font-black text-gray-550 uppercase mb-1">Validade (MM/AA)</label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => handleCardExpiryChange(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-instagram-pink/30 font-mono"
                            placeholder="MM/AA"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-gray-555 uppercase mb-1">Cód. Segurança (CVV)</label>
                          <input
                            type="password"
                            required
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                            className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-instagram-pink/30 font-mono"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 bg-gradient-to-r from-instagram-pink via-instagram-orange to-instagram-purple hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processando Pagamento...</span>
                        </>
                      ) : (
                        <span>Concluir Compra e Acessar 🚀</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: PIX QR CODE RENDERER */}
              {checkoutStep === "payment" && mpPixData && (
                <div className="text-center space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-instagram-pink uppercase tracking-widest block">Pagamento Pix Gerado ⚡</span>
                    <h3 className="font-extrabold text-gray-900 text-base">Escaneie ou Copie o Pix</h3>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">Use o aplicativo do seu banco para ler o QR Code ou cole a chave abaixo. A liberação do download é imediata!</p>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-2xl border border-gray-150 inline-block mx-auto relative select-none shadow-inner">
                    <img
                      src={`data:image/png;base64,${mpPixData.qr_code_base64}`}
                      alt="Mercado Pago Pix QR Code"
                      className="w-44 h-44 mx-auto"
                    />
                  </div>

                  <div className="max-w-xs mx-auto">
                    <button
                      onClick={copyPixCode}
                      className={`w-full py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        copiedPix 
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                          : "border-gray-200 bg-white hover:bg-gray-50 text-gray-655"
                      }`}
                    >
                      {copiedPix ? (
                        <>
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          <span>Código Copiado com Sucesso!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4.5 h-4.5 text-gray-500 shrink-0" />
                          <span>Copiar Código Pix Copia e Cola</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-left text-xs text-sky-850 flex items-start gap-2.5">
                    <RefreshCw className="w-4 h-4 text-sky-500 animate-spin shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-extrabold block text-sky-900">Aguardando aprovação do banco</span>
                      Assim que o pagamento for liquidado, esta página irá liberar o download dos arquivos automaticamente.
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CONGRATS & ACCESS SYSTEM */}
              {checkoutStep === "confirmed" && (
                <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-md border-2 border-white animate-bounce">
                    🎉
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Pagamento Aprovado!</span>
                    <h3 className="font-extrabold text-gray-950 text-lg">Parabéns pela Aquisição!</h3>
                    <p className="text-xs text-gray-550 max-w-xs mx-auto">Sua licença do Pizagram foi gerada com sucesso. Você já pode baixar todo o código limpo e o manual de instalação.</p>
                  </div>

                  <div className="max-w-xs mx-auto pt-2">
                    <a
                      href={siteDriveLink || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-4 px-6 bg-gradient-to-r from-instagram-pink via-instagram-orange to-instagram-purple hover:opacity-95 text-white font-extrabold rounded-xl shadow-xl flex items-center justify-center gap-2.5 transition-all text-xs tracking-wider uppercase animate-pulse select-none cursor-pointer"
                    >
                      <Download className="w-4.5 h-4.5 fill-white" />
                      <span>Baixar Arquivos do Script 🚀</span>
                    </a>
                    <span className="text-[9px] text-gray-400 block mt-2">Clique para abrir os arquivos contidos no Google Drive.</span>
                  </div>

                  <div className="pt-4 border-t border-gray-100 max-w-xs mx-auto">
                    <button
                      onClick={onBackToMenu}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Voltar ao Cardápio
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
