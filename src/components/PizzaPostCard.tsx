import React from "react";
import { motion } from "motion/react";
import { Heart, AlertCircle, ShoppingBag, Layers } from "lucide-react";
import { Pizza, FoodNiche } from "../types";

interface CardProps {
  key?: React.Key;
  pizza: Pizza;
  onSelect: (pizza: Pizza) => void;
  pointsName?: string;
  pointsEnabled?: boolean;
  niche?: FoodNiche;
}

export function PizzaPostCardSkeleton() {
  return (
    <div className="relative aspect-square w-full bg-gray-100 overflow-hidden rounded-lg select-none shadow-xs animate-pulse">
      {/* Category corner badge skeleton */}
      <div className="absolute top-2.5 right-2.5 z-10 bg-gray-200 w-12 h-4 rounded-full shadow-xs"></div>

      {/* Pulsing main body area */}
      <div className="w-full h-full bg-linear-to-b from-gray-200 to-gray-200/50"></div>

      {/* ALWAYS VISIBLE Clean Title Strip overlay skeleton */}
      <div className="absolute bottom-0 inset-x-0 bg-white/95 border-t border-gray-100 p-2 flex justify-between items-center z-10">
        <div className="min-w-0 flex-1 pr-3 text-left space-y-1.5">
          {/* Pizza name skeleton */}
          <div className="h-3 bg-gray-200 rounded-sm w-3/4"></div>
          {/* Price skeleton */}
          <div className="h-2.5 bg-gray-200 rounded-sm w-1/2"></div>
        </div>
        {/* Shopping bag button skeleton */}
        <div className="w-6.5 h-6.5 bg-gray-200 rounded-lg shrink-0"></div>
      </div>
    </div>
  );
}

export default function PizzaPostCard({ pizza, onSelect, pointsName = "PizzatoPoints", pointsEnabled = true, niche = "pizzaria" }: CardProps) {
  const [imgSrc, setImgSrc] = React.useState(pizza.imageUrl || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80");

  React.useEffect(() => {
    if (pizza.imageUrl) {
      setImgSrc(pizza.imageUrl);
    }
  }, [pizza.imageUrl]);

  // Format large numbers elegantly like Instagram statistics (e.g. 1.2k)
  const formatLikes = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;
  };

  const hasCarousel = pizza.images && pizza.images.length > 1;

  const fallbackImage = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80";

  return (
    <motion.div
      onClick={() => onSelect(pizza)}
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      layoutId={`pizza-card-container-${pizza.id}`}
      className="relative aspect-square w-full bg-gray-100 overflow-hidden cursor-pointer group rounded-lg select-none shadow-sm hover:shadow-md h-full"
      id={`pizza-card-${pizza.id}`}
    >
      {/* Category corner badge */}
      <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10 bg-white/70 sm:bg-white/95 backdrop-blur-xs px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-sm sm:rounded-full text-[8px] sm:text-fluid-xs font-black text-gray-700 sm:text-gray-800 uppercase tracking-widest shadow-2xs select-none">
        {pizza.category}
      </div>

      {/* Instagram Carousel Badge (overlapping slides) */}
      {hasCarousel && (
         <div className="absolute top-2.5 left-2.5 z-10 bg-black/45 backdrop-blur-xs p-fluid-xs rounded-lg text-white shadow-xs flex items-center justify-center">
          <Layers className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Pizza Post Grid Image */}
      <img
        src={imgSrc}
        alt={pizza.name}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setImgSrc(fallbackImage)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      />

      {/* Instagram Hover Stats Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white"
        id={`pizza-overlay-${pizza.id}`}
      >
        <div className="flex items-center gap-2 font-bold text-fluid-base scale-110">
          <Heart className="w-6 h-6 fill-white text-white drop-shadow-md" />
          <span>{formatLikes(pizza.likes)}</span>
        </div>
      </div>

      {/* ALWAYS VISIBLE Clean Title Strip overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-xs border-t border-gray-150 p-2 sm:p-fluid-sm flex justify-between items-center z-10 transition-colors group-hover:bg-white">
        <div className="min-w-0 flex-1 pr-1.5 text-left">
          <h3 className="font-extrabold text-[11px] sm:text-fluid-sm text-gray-950 line-clamp-2 leading-tight tracking-tight min-h-[2rem] sm:min-h-0 flex items-center">{pizza.name}</h3>
          <span className="text-[11px] sm:text-fluid-sm text-instagram-pink font-extrabold font-mono mt-0.5 block">
            {pointsEnabled && pizza.priceInPoints && pizza.priceInPoints > 0 
              ? `R$ ${pizza.price.toFixed(2)} ou ${pizza.priceInPoints} pts` 
              : `R$ ${pizza.price.toFixed(2)}`}
          </span>
        </div>
        <div className="bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink text-white p-1.5 sm:p-fluid-xs rounded-lg sm:rounded-xl shrink-0 shadow-2xs group-hover:scale-110 transition-transform">
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
