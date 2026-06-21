import React, { useState } from "react";
import { Lock, User, Phone, CheckCircle, ShieldAlert, Key, HelpCircle, X } from "lucide-react";

interface LoginProps {
  pizzeriaName: string;
  onLoginSuccess: (user: { 
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
    bio?: string;
  }) => void;
  onClose?: () => void;
}

export default function InstagramLogin({ pizzeriaName, onLoginSuccess, onClose }: LoginProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Form Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Address helpers for registration
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCepChange = async (value: string) => {
    // Only keep numbers
    const cleanCep = value.replace(/\D/g, "");
    
    // Format as XXXXX-XXX
    let formattedCep = cleanCep;
    if (cleanCep.length > 5) {
      formattedCep = `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`;
    }
    setCep(formattedCep);

    if (cleanCep.length === 8) {
      setIsLoadingCep(true);
      setErrorMessage("");
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (response.ok) {
          const data = await response.json();
          if (!data.erro) {
            setStreet(data.logradouro || "");
            setNeighborhood(data.bairro || "");
            setCity(data.localidade || "");
            setState(data.uf || "");
          } else {
            setErrorMessage("CEP não localizado! Por favor, digite o endereço manualmente.");
          }
        } else {
          setErrorMessage("Erro ao buscar o CEP na base dos Correios.");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMsg("");

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Por favor, digite usuário e senha!");
      return;
    }

    if (isRegisterMode && !isAdminMode) {
      if (
        !fullName.trim() || 
        !phone.trim() || 
        !cep.trim() || 
        !street.trim() || 
        !number.trim() || 
        !neighborhood.trim() || 
        !city.trim() || 
        !state.trim()
      ) {
        setErrorMessage("Preencha todos os campos obrigatórios do endereço (Nome, Celular, CEP, Rua, Número, Bairro, Cidade e Estado)!");
        return;
      }

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: cleanUsername,
            password,
            name: fullName.trim(),
            phone: phone.trim(),
            cep: cep.trim(),
            street: street.trim(),
            number: number.trim(),
            complement: complement.trim(),
            neighborhood: neighborhood.trim(),
            city: city.trim(),
            state: state.trim()
          })
        });
        const data = await response.json();
        if (!response.ok) {
          setErrorMessage(data.error || "Erro ao realizar cadastro.");
          return;
        }
        setSuccessMsg("Cadastro realizado com sucesso! Bem-vindo(a)!");
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 1200);
      } catch (err) {
        setErrorMessage("Erro de rede ao cadastrar. Tente novamente.");
      }
    } else {
      // Login Mode (both Admin and Client)
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: cleanUsername,
            password,
            isAdminMode: isAdminMode
          })
        });
        const data = await response.json();
        if (!response.ok) {
          setErrorMessage(data.error || "Usuário ou senha incorretos!");
          return;
        }
        setSuccessMsg(isAdminMode ? "Olá Administrador! Entrando..." : `Bem-vindo de volta, @${data.user.username}!`);
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 1200);
      } catch (err) {
        setErrorMessage("Erro de rede ao fazer login. Tente novamente.");
      }
    }
  };

  return (
    <div className={onClose ? "w-full" : "min-h-[85vh] flex items-center justify-center p-2 sm:p-4 bg-gray-50/50"} id="auth-panel-stage">
      <div className="w-full max-w-sm max-h-[95vh] flex flex-col" id="auth-box-wrapper">
        
        {/* Card outline frame */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-7 shadow-xs flex flex-col items-center overflow-y-auto max-h-[90vh] w-full">
          
          {/* Logo brand */}
          <div className="text-center mb-5 relative w-full font-sans">
            {onClose && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors p-1 z-30 cursor-pointer"
                title="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
            )}
            <h1 
              className="text-3xl font-black tracking-tight text-gray-900 bg-gradient-to-r from-instagram-pink via-instagram-orange to-instagram-purple bg-clip-text text-transparent select-none filter drop-shadow-xs" 
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {pizzeriaName}
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold mt-1">
              Autenticação Obrigatória
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="w-full space-y-2">
            
            {/* Mode headers labels */}
            <div className="text-center pb-1">
              <span className="text-xs font-bold text-gray-400 uppercase">
                {isAdminMode 
                  ? "🔐 Login Segurança Admin" 
                  : isRegisterMode 
                    ? "✨ Criar Nova Conta Cliente" 
                    : "👋 Bem-vindo ao App"}
              </span>
            </div>

            {/* ERROR AND SUCCESS NOTIFIERS */}
            {errorMessage && (
              <div className="p-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold text-center leading-snug flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                <span className="flex-1 text-left">{errorMessage}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold text-center leading-snug flex items-center gap-1.5 animate-pulse">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                <span className="flex-1 text-left">{successMsg}</span>
              </div>
            )}

            {/* Input fields */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">Identificador de Usuário (@)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold select-none">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isAdminMode ? "admin" : "seu_usuario"}
                  className="w-full text-sm pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-instagram-pink/32 transition-all font-mono font-bold text-gray-800 lowercase"
                />
              </div>
            </div>

            {/* Registration specific fields */}
            {isRegisterMode && !isAdminMode && (
              <>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">Seu Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Marcos Silva"
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-instagram-pink/32 transition-all font-sans font-medium text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">WhatsApp de Contato</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-instagram-pink/32 transition-all font-mono text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      CEP {isLoadingCep && <span className="inline-block animate-spin text-instagram-pink text-[10px]">⏳</span>}
                    </label>
                    <input
                      type="text"
                      required
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="01311-100"
                      maxLength={9}
                      className="w-full text-sm px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-instagram-pink/32 transition-all font-mono font-bold text-gray-800"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">Rua / Logradouro</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Rua das Flores"
                      className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-instagram-pink/32 transition-all font-sans text-gray-850"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">Número</label>
                    <input
                      type="text"
                      required
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="123"
                      className="w-full text-sm px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-instagram-pink/32 transition-all font-mono text-gray-800"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">Complemento</label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Ex: Apto 42"
                      className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-instagram-pink/32 transition-all font-sans text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">Bairro</label>
                  <input
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Centro"
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-instagram-pink/32 transition-all font-sans text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">Cidade</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: São Paulo"
                      className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-instagram-pink/32 transition-all font-sans text-gray-800"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">Estado</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="SP"
                      maxLength={2}
                      className="w-full text-sm px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-instagram-pink/32 transition-all font-sans uppercase font-bold text-gray-855"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wide mb-1">Senha de Segurança</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-instagram-pink/32 transition-all font-mono"
              />
            </div>

            {/* Helper hints banner */}
            <div className="bg-gray-50 p-2 rounded-lg border border-gray-150 text-[9px] text-gray-400 flex items-start gap-1.5">
              <HelpCircle className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
              <div>
                {isAdminMode ? (
                  <p>Acesso restrito para o administrador cadastrado da pizzaria.</p>
                ) : (
                  <p>Insira qualquer usuário e senha para acessar os pedidos e o feed ao vivo.</p>
                )}
              </div>
            </div>

            {/* Main Submit Action button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-[#0095f6] hover:bg-[#1fa1ff] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors mt-1 cursor-pointer"
            >
              {isAdminMode 
                ? "Entrar como Admin" 
                : isRegisterMode 
                  ? "Registrar e Entrar" 
                  : `Entrar na ${pizzeriaName}`}
            </button>
          </form>

          {/* Slices of separators */}
          <div className="w-full flex items-center justify-between gap-3 my-5">
            <div className="w-full h-px bg-gray-200"></div>
            <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">Ou</span>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          {/* Secondary configuration selector links */}
          <div className="space-y-3 text-center">
            {isAdminMode ? (
              <button
                onClick={() => {
                  setIsAdminMode(false);
                  setIsRegisterMode(false);
                  setErrorMessage("");
                }}
                className="text-xs font-bold text-instagram-pink hover:underline"
              >
                Voltar ao Login Cliente
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setErrorMessage("");
                  }}
                  className="text-xs font-bold text-[#0095f6] hover:underline"
                >
                  {isRegisterMode ? "Já tem uma conta? Conecte-se" : "Não tem uma conta? Cadastre-se"}
                </button>
                <div className="block mt-1">
                  <button
                    onClick={() => {
                      setIsAdminMode(true);
                      setErrorMessage("");
                    }}
                    className="text-[11px] font-black uppercase text-red-500 hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <Key className="w-3 h-3 shrink-0" /> Acesso do Admin / Proprietário
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer device frames credits link */}
        <div className="mt-4 p-4 text-center">
          <p className="text-[10px] text-gray-400">© 2026 {pizzeriaName} • Feito no Estilo Instagram</p>
        </div>
      </div>
    </div>
  );
}
