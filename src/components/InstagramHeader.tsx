import { Camera, Search, Heart, Send, PlusSquare, ToggleLeft, ToggleRight, Settings, ShoppingBag } from "lucide-react";
import { SystemNotification } from "../types";

interface HeaderProps {
  pizzeriaName?: string;
  pizzeriaLogo?: string;
  onSearch: (value: string) => void;
  searchValue: string;
  cartCount: number;
  onOpenCartDirect: () => void;
  notifications: SystemNotification[];
  onOpenNotifications: () => void;
  notificationsOpen: boolean;
  onViewNotification: (id: string) => void;
  currentUser: { name: string; username: string; isAdmin: boolean } | null;
  onGoToAdmin: () => void;
  onLogout: () => void;
  onGoToProfile: () => void;
  activeTab: string;
  visible?: boolean;
  onLoginClick?: () => void;
}

export default function InstagramHeader({
  pizzeriaName = "Minha Pizzaria",
  pizzeriaLogo = "",
  onSearch,
  searchValue,
  cartCount,
  onOpenCartDirect,
  notifications,
  onOpenNotifications,
  notificationsOpen,
  onViewNotification,
  currentUser,
  onGoToAdmin,
  onLogout,
  onGoToProfile,
  activeTab,
  visible = true,
  onLoginClick
}: HeaderProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={`absolute top-0 inset-x-0 z-40 bg-white border-b border-gray-200 p-fluid-sm transition-all duration-300 ease-in-out transform ${
      visible
        ? "translate-y-0 opacity-100"
        : "-translate-y-full opacity-0 pointer-events-none"
    } sm:px-6`}>
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-fluid-sm">
        {/* Left: Instagram Script-style Pizzato title */}
        <div 
          onClick={onGoToProfile} 
          className="flex items-center gap-fluid-sm cursor-pointer select-none"
          id="header-brand"
        >
          <Camera className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 text-gray-800 shrink-0" />
          <div className="hidden sm:block w-px h-5 bg-gray-300 mx-1"></div>
          <span 
            className="text-fluid-lg sm:text-fluid-2xl font-black tracking-tight text-gray-900 bg-gradient-to-r from-instagram-pink via-instagram-orange to-instagram-purple bg-clip-text text-transparent truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none inline-block"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            title={pizzeriaName}
          >
            {pizzeriaName}
          </span>
        </div>

        {/* Center: Search Bar */}
        <div className="relative max-w-xs w-full sm:block hidden" id="header-search">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 h-4 text-gray-400" />
          </div>
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Pesquisar pizza ou ingrediente..."
            className="block w-full pl-9 pr-3 py-1.5 bg-[#efefef] border-none rounded-lg text-fluid-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-fluid-sm md:gap-4" id="header-actions">


          {/* Admin Panel Button (Exclusive to logged in store proprietors) */}
          {currentUser?.isAdmin && (
            <button
              onClick={onGoToAdmin}
              className={`flex items-center gap-fluid-sm text-fluid-xs font-black px-3.5 py-1.5 rounded-full border transition-all ${
                activeTab === "admin"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
              title="Acessar Controle Comercial"
              id="header-admin-panel-btn"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 inline shrink-0" />
              <span className="hidden xs:inline">Painel</span>
              <span className="hidden md:inline"> do Adm</span>
            </button>
          )}

          {/* Quick Sair/Entrar Logout/Login tab */}
          {currentUser ? (
            <button
              onClick={onLogout}
              className="text-fluid-xs sm:text-fluid-sm font-extrabold text-gray-400 hover:text-red-500 transition-colors uppercase px-1 py-1"
              title="Sair do Perfil"
            >
              Sair
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="text-fluid-xs sm:text-fluid-sm font-extrabold text-instagram-blue hover:text-blue-600 transition-colors uppercase px-1 py-1"
              title="Entrar / Cadastrar"
            >
              Entrar
            </button>
          )}

          {/* Heart / Notifications Dropdown button */}
          <div className="relative">
            <button
              onClick={onOpenNotifications}
              className={`p-1 hover:text-instagram-pink transition-colors relative ${notificationsOpen ? "text-instagram-pink" : "text-gray-800"}`}
              id="notifications-bell-btn"
            >
              <Heart className={`w-6 h-6 ${unreadCount > 0 ? "fill-instagram-pink text-instagram-pink" : ""}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-instagram-pink text-white text-fluid-xs font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Live Notifications Dropdown */}
            {notificationsOpen && (
              <div 
                className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 max-h-[420px] overflow-y-auto"
                id="notifications-dropdown-menu"
              >
                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-fluid-sm">Notificações</span>
                  <span className="text-fluid-xs text-gray-400 font-medium">Novas atualizações</span>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400 text-fluid-sm">
                    Nenhuma notificação por enquanto.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {notifications.map((notif) => {
                      const isOwnerNotif = notif.username === "admin" || notif.username === "dono";
                      const defaultOwnerAvatar = "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=80";
                      const avatarSrc = isOwnerNotif ? (pizzeriaLogo || defaultOwnerAvatar) : (notif.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=50");
                      
                      return (
                        <div
                          key={notif.id}
                          onClick={() => onViewNotification(notif.id)}
                          className={`px-4 py-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notif.read ? "bg-sky-50/60" : ""
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink p-[1.5px] shrink-0">
                            <img
                              src={avatarSrc}
                              alt={notif.username}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover rounded-full border border-white"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-fluid-xs text-gray-700">
                              <span className="font-bold mr-1 text-gray-900">@{notif.username}</span>
                              {notif.message}
                            </p>
                            <span className="text-fluid-xs text-gray-400 font-medium">{notif.timeString}</span>
                          </div>
                          {!notif.read && (
                            <span className="w-2.5 h-2.5 bg-instagram-blue rounded-full shrink-0"></span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DM Messenger Icon - Cart Bubble */}
          <button
            onClick={onOpenCartDirect}
            className={`p-1 hover:text-[#0095f6] transition-colors relative ${activeTab === "direct" ? "text-[#0095f6]" : "text-gray-800"}`}
            title="Abrir Carrinho de Compras"
            id="direct-cart-btn"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-instagram-blue text-white text-[10px] sm:text-fluid-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
