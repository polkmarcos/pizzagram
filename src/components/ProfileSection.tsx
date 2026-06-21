import React, { useState } from "react";
import { User, Shield, Flame, MapPin, Grid, Ticket, Edit3, Save, CheckCircle2, Camera } from "lucide-react";
import { FoodNiche } from "../types";

interface ProfileProps {
  clientName: string;
  clientPhone: string;
  clientCep: string;
  clientStreet: string;
  clientNumber: string;
  clientComplement: string;
  clientNeighborhood: string;
  clientCity: string;
  clientState: string;
  ordersCount: number;
  onUpdateProfileDetails: (
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
  ) => void;
  currentUser: { name: string; username: string; isAdmin: boolean; avatarUrl?: string; points?: number; bio?: string } | null;
  onUpdateAvatar?: (url: string) => void;
  totalPizzasCount: number;
  pointsName?: string;
  pointsEnabled?: boolean;
  niche?: FoodNiche;
  onLoginClick?: () => void;
}

export default function ProfileSection({
  clientName,
  clientPhone,
  clientCep,
  clientStreet,
  clientNumber,
  clientComplement,
  clientNeighborhood,
  clientCity,
  clientState,
  ordersCount,
  onUpdateProfileDetails,
  currentUser,
  onUpdateAvatar,
  totalPizzasCount,
  pointsName = "PizzatoPoints",
  pointsEnabled = true,
  niche = "pizzaria",
  onLoginClick
}: ProfileProps) {
  const defaultBio = niche === "pizzaria" ? "🍕 Devoto de assados em forno a lenha & ingredientes italianos autênticos." :
                     niche === "hamburgueria" ? "🍔 Devoto de lanches suculentos na grelha e batata frita crocante." :
                     niche === "sushi" ? "🍣 Amante de sushis frescos, combinados e shoyu premium." :
                     niche === "adega" ? "🍾 Apreciador de bebidas selecionadas e drinks gelados." :
                     "🍰 Fã de doces artesanais, bolos confeitados e sobremesas deliciosas.";

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(clientName);
  const [tempPhone, setTempPhone] = useState(clientPhone);
  const [tempCep, setTempCep] = useState(clientCep);
  const [tempStreet, setTempStreet] = useState(clientStreet);
  const [tempNumber, setTempNumber] = useState(clientNumber);
  const [tempComplement, setTempComplement] = useState(clientComplement);
  const [tempNeighborhood, setTempNeighborhood] = useState(clientNeighborhood);
  const [tempCity, setTempCity] = useState(clientCity);
  const [tempState, setTempState] = useState(clientState);
  const [tempUsername, setTempUsername] = useState(currentUser?.username || "");
  const [tempPassword, setTempPassword] = useState((currentUser as any)?.password || "");
  const [tempBio, setTempBio] = useState(currentUser?.bio || defaultBio);

  // Sync edits if session user details are loaded asynchronously
  React.useEffect(() => {
    if (isEditing) {
      setTempUsername(currentUser?.username || "");
      setTempPassword((currentUser as any)?.password || "");
      setTempBio(currentUser?.bio || defaultBio);
    }
  }, [isEditing, currentUser, defaultBio]);

  const formattedHandle = currentUser?.username || "visitante";
  const guestBio = niche === "pizzaria" ? "Escolha seus sabores favoritos, adicione na sacola e faça seu pedido quando quiser! 🍕" :
                   niche === "hamburgueria" ? "Escolha seus hambúrgueres favoritos, adicione na sacola e faça seu pedido quando quiser! 🍔" :
                   niche === "sushi" ? "Escolha seus combinados favoritos, adicione na sacola e faça seu pedido quando quiser! 🍣" :
                   niche === "adega" ? "Escolha suas bebidas favoritas, adicione na sacola e faça seu pedido quando quiser! 🍾" :
                   "Escolha suas sobremesas favoritas, adicione na sacola e faça seu pedido quando quiser! 🍰";
  const displayBio = currentUser ? (currentUser.bio || defaultBio) : guestBio;
  const displayName = currentUser ? clientName : "Visitante";

  const handleSave = () => {
    onUpdateProfileDetails(
      tempName,
      tempPhone,
      tempCep,
      tempStreet,
      tempNumber,
      tempComplement,
      tempNeighborhood,
      tempCity,
      tempState,
      tempUsername,
      tempPassword,
      tempBio
    );
    setIsEditing(false);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string" && onUpdateAvatar) {
        onUpdateAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const getCombinedAddress = () => {
    if (!clientStreet) return "Nenhum endereço cadastrado para entrega";
    return `${clientStreet}, nº ${clientNumber}${clientComplement ? " (" + clientComplement + ")" : ""} - ${clientNeighborhood}, ${clientCity}/${clientState}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-sm" id="profile-section">
      
      {/* 1. MOBILE RESPONSIVE LAYOUT (Exactly like Instagram Mobile on cellphone) */}
      <div className="md:hidden space-y-3.5" id="profile-mobile-view">
        {/* Top: Pic left, Stats right */}
        <div className="flex items-center gap-5 justify-between">
          {/* Avatar Ring with hidden upload action */}
          <div 
            className="relative shrink-0 select-none group cursor-pointer" 
            onClick={() => document.getElementById("profile-avatar-file-input-mobile")?.click()}
          >
            <input
              type="file"
              id="profile-avatar-file-input-mobile"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
            <div className="w-[76px] h-[76px] rounded-full bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink p-[2.5px] shadow-sm relative">
              <div className="w-full h-full rounded-full bg-white border border-white flex items-center justify-center overflow-hidden relative">
                <img
                  src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${formattedHandle}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                  <span className="text-[7px] text-white font-black uppercase text-center mt-0.5">Mudar</span>
                </div>
              </div>
            </div>
            {/* Camera icon floating helper of avatar upload on mobile */}
            <div className="absolute -bottom-1 -right-1 bg-instagram-pink p-1 rounded-full text-white border border-white shadow-xs">
              <Camera className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Stats on the right (No postagens column, only Pedidos and Customer points system) */}
          <div className="flex-1 flex justify-around text-center gap-1.5 pr-2">
            <div>
              <span className="font-extrabold text-gray-950 text-sm block leading-none mb-1">{ordersCount}</span>
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">pedidos</span>
            </div>
            {pointsEnabled && (
              <div>
                <span className="font-extrabold text-emerald-600 text-sm block leading-none mb-1">{currentUser?.points ?? 0}</span>
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">{pointsName} 🪙</span>
              </div>
            )}
          </div>
        </div>

        {/* Name, handle, bio, location details below (Smaller scale, Instagram cellphone style) */}
        <div className="text-left space-y-1 mt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="font-extrabold text-base text-gray-900 tracking-tight">
              @{formattedHandle}
            </h2>
            {currentUser?.isAdmin && (
              <span className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-150 text-[9px] font-black rounded-sm uppercase tracking-wider">
                Adm
              </span>
            )}
          </div>
          <span className="font-extrabold text-xs sm:text-sm text-gray-950 block leading-tight">{displayName}</span>
          <p className="text-xs sm:text-sm text-gray-655 font-medium leading-normal">
            {displayBio}
          </p>


          {/* Compact visual Address Badge for cellphones */}
          <div className="bg-gray-50 border border-gray-150 p-3 rounded-xl text-xs sm:text-sm text-gray-600 mt-2 flex items-start gap-1.5">
            <MapPin className="w-4 h-4 text-instagram-pink shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-black text-[9px] sm:text-[10px] text-gray-450 uppercase tracking-widest block mb-0.5">Endereço de Entrega:</span>
              <p className="truncate text-gray-700 font-bold leading-normal">{getCombinedAddress()}</p>
              {clientPhone && <p className="font-mono mt-0.5 font-bold text-gray-550 text-xs">📞 {clientPhone}</p>}
            </div>
          </div>
        </div>

        {/* Buttons (Editar perfil action row) */}
        <div className="pt-1 flex gap-2">
          {currentUser ? (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 active:bg-gray-200 text-gray-800 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-gray-500 shrink-0" />
              Editar Perfil / Endereço
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex-1 py-2.5 bg-gradient-to-r from-instagram-pink to-instagram-orange text-white text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              Entrar / Cadastrar-se
            </button>
          )}
        </div>
      </div>

      {/* 2. DESKTOP RESPONSIVE LAYOUT (Same beautiful original visual layout) */}
      <div className="hidden md:flex items-start gap-8" id="profile-desktop-view">
        {/* Profile Avatar with Instagram Ring styling (Supports upload too on click) */}
        <div 
          className="relative shrink-0 select-none group cursor-pointer" 
          onClick={() => document.getElementById("profile-avatar-file-input")?.click()}
          title="Clique para trocar foto de perfil"
        >
          <input
            type="file"
            id="profile-avatar-file-input"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileChange}
          />
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink p-[4px] shadow-sm relative">
            <div className="w-full h-full rounded-full bg-white border border-white flex items-center justify-center overflow-hidden relative">
              <img
                src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${formattedHandle}`}
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
                <span className="text-[9px] text-white font-extrabold uppercase text-center mt-1">Trocar Foto</span>
              </div>
            </div>
          </div>
          <span className="absolute bottom-1 right-2 bg-emerald-500 border-2 border-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold" title="Cliente Online">
            ●
          </span>
        </div>

        {/* Profile Stats & Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-extrabold text-2xl text-gray-900 truncate tracking-tight">
              @{formattedHandle}
            </h2>
            
            {/* Quick Action Elements */}
            <div className="flex items-center gap-2">
              {currentUser ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  id="edit-profile-toggle"
                >
                  <Edit3 className="w-4 h-4 text-gray-500 shrink-0" />
                  Editar Perfil
                </button>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2 bg-gradient-to-r from-instagram-pink to-instagram-orange text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  id="login-profile-btn"
                >
                  Entrar / Cadastrar-se
                </button>
              )}

              {currentUser?.isAdmin && (
                <span className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-2xs">
                  <Shield className="w-4 h-4 shrink-0" /> Adm do Estabelecimento
                </span>
              )}
            </div>
          </div>

          {/* Stats count (Removed "11 postagens" since the user is a customer placing orders) */}
          <div className="flex gap-12 mb-5 text-sm" id="profile-stats">
            <div>
              <span className="font-black text-gray-900 text-base mr-1">{ordersCount}</span>
              <span className="text-gray-500 font-semibold">pedidos</span>
            </div>
            {pointsEnabled && (
              <div>
                <span className="font-black text-emerald-600 text-base mr-1">{currentUser?.points ?? 0}</span>
                <span className="text-gray-500 font-semibold">{pointsName} 🪙</span>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-700 leading-relaxed font-sans" id="profile-bio">
            <span className="font-extrabold text-gray-900 text-base block">{displayName}</span>
            <p className="mt-1 font-medium text-gray-655">{displayBio}</p>

            
            {/* Delivery address display badge */}
            <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 p-3 rounded-xl max-w-xl">
              <MapPin className="w-4.5 h-4.5 text-instagram-pink shrink-0 mt-0.5" />
              <div className="text-left flex-1 min-w-0">
                <span className="font-bold text-gray-700 block uppercase text-[9px] tracking-wider mb-0.5">Endereço de Entrega Cadastrado:</span>
                <span className="text-gray-600 leading-normal font-semibold block truncate">
                  {getCombinedAddress()}
                </span>
                {clientPhone && (
                  <span className="text-[11px] font-bold text-gray-500 block mt-1">📞 {clientPhone}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacious Custom Form for Client Profiles */}
      {isEditing && (
        <div className="mt-8 pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-top-4 duration-200" id="edit-profile-box">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-instagram-pink" />
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
              Editar Dados de Entrega & Cadastro
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Credentials Row: Username and Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-150 rounded-xl">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1 text-instagram-pink">
                  <span>👤 Identificador / Usuário (@)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value.toLowerCase().trim().replace(/[^a-z0-9_]/g, ""))}
                    className="w-full text-sm pl-8 pr-4 py-3 bg-white border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-instagram-pink text-gray-800 font-mono font-bold lowercase"
                    placeholder="novo_usuario"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1 text-instagram-pink">
                  <span>🔐 Senha de Acesso</span>
                </label>
                <input
                  type="text"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full text-sm px-4 py-3 bg-white border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-instagram-pink text-gray-800 font-mono"
                  placeholder="Sua senha secreta"
                />
              </div>
            </div>

            {/* Bio Row */}
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1.5">Sua Biografia (Bio)</label>
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-instagram-pink focus:bg-white transition-all font-medium text-gray-800 h-20 resize-none"
                placeholder="Conte um pouco sobre você..."
              />
            </div>

            {/* Row 1: Name and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all font-medium text-gray-800"
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1.5">WhatsApp / Telefone de Contato</label>
                <input
                  type="tel"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all font-mono font-medium text-gray-800"
                  placeholder="Ex: (11) 98765-4321"
                />
              </div>
            </div>

            {/* Row 2: CEP and Street */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1.5">Código Postal / CEP</label>
                <input
                  type="text"
                  value={tempCep}
                  onChange={(e) => setTempCep(e.target.value)}
                  className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all font-mono font-semibold text-gray-800"
                  placeholder="Ex: 01311-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1.5">Rua / Logradouro</label>
                <input
                  type="text"
                  value={tempStreet}
                  onChange={(e) => setTempStreet(e.target.value)}
                  className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all font-medium text-gray-800"
                  placeholder="Ex: Avenida Paulista"
                />
              </div>
            </div>

            {/* Row 3: Number, Complement and Neighborhood */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1.5 font-sans">Número</label>
                <input
                  type="text"
                  value={tempNumber}
                  onChange={(e) => setTempNumber(e.target.value)}
                  className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all font-mono font-semibold text-gray-800"
                  placeholder="Ex: 1000"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1.5">Complemento (Opcional)</label>
                <input
                  type="text"
                  value={tempComplement}
                  onChange={(e) => setTempComplement(e.target.value)}
                  className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all font-medium text-gray-800"
                  placeholder="Ex: Apto 14, Bloco B"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1.5">Bairro</label>
                <input
                  type="text"
                  value={tempNeighborhood}
                  onChange={(e) => setTempNeighborhood(e.target.value)}
                  className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all font-medium text-gray-800"
                  placeholder="Ex: Bela Vista"
                />
              </div>
            </div>

            {/* Row 4: City and State */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1.5">Cidade</label>
                <input
                  type="text"
                  value={tempCity}
                  onChange={(e) => setTempCity(e.target.value)}
                  className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all font-medium text-gray-800"
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1.5">Estado / UF</label>
                <input
                  type="text"
                  maxLength={2}
                  value={tempState}
                  onChange={(e) => setTempState(e.target.value)}
                  className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all font-mono font-bold text-gray-800"
                  placeholder="Ex: SP"
                />
              </div>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={() => setIsEditing(false)}
              className="px-5 py-3 rounded-xl text-xs bg-gray-105 hover:bg-gray-200 text-gray-700 font-extrabold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl text-xs bg-instagram-pink hover:bg-instagram-pink/90 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-sm transform active:scale-95 cursor-pointer"
              id="save-profile-btn"
            >
              <Save className="w-4 h-4" />
              Salvar Dados
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
