import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Volume2, Sparkles, ShoppingCart } from "lucide-react";
import { Story } from "../types";

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function StoryViewer({ stories, initialStoryIndex, isOpen, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const STORY_DURATION = 4800; // 4.8 seconds

  useEffect(() => {
    setCurrentIndex(initialStoryIndex);
  }, [initialStoryIndex]);

  useEffect(() => {
    if (!isOpen || stories.length === 0) return;

    // Reset progress on active story change
    setProgress(0);

    const startTime = Date.now();
    const intervalMs = 50;

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(currentProgress);

      if (elapsed >= STORY_DURATION) {
        clearInterval(progressInterval.current!);
        handleNext();
      }
    }, intervalMs);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex, isOpen, stories]);

  if (!isOpen || stories.length === 0) return null;

  const activeStory = stories[currentIndex] || stories[0];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Touch and tap handling like WhatsApp/Instagram
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const screenWidth = e.currentTarget.offsetWidth;
    const clickX = e.clientX - e.currentTarget.getBoundingClientRect().left;

    if (clickX < screenWidth * 0.35) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center select-none" id="story-viewer-bg">
        {/* Main interactive viewport container */}
        <div className="relative w-full max-w-md h-[100dvh] md:h-[90vh] md:max-h-[800px] md:rounded-3xl overflow-hidden bg-black flex flex-col justify-between shadow-2xl border border-white/10">
          
          {/* Top Multi-Segment Progress Indicators */}
          <div className="absolute top-3 left-0 right-0 px-3 z-10 flex gap-1.5">
            {stories.map((story, idx) => {
              let widthVal = "0%";
              if (idx < currentIndex) {
                widthVal = "100%";
              } else if (idx === currentIndex) {
                widthVal = `${progress}%`;
              }

              return (
                <div key={story.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-75"
                    style={{ width: widthVal }}
                  />
                </div>
              );
            })}
          </div>

          {/* Top Overlay Header with details */}
          <div className="absolute top-6 left-0 right-0 px-4 py-2 z-10 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink p-[2.5px] shadow-sm flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gray-900 border border-black flex items-center justify-center text-sm font-bold shadow-inner">
                  {activeStory.emoji || "🍕"}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs tracking-tight text-white/95">{activeStory.title}</span>
                  <span className="px-1.5 py-0.5 bg-instagram-pink text-[8px] font-black uppercase rounded-xs">PROMO</span>
                </div>
                <p className="text-[10px] text-white/70 font-semibold mt-0.5">Patrocinado · Ativo</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-1 px-1.5 h-9 w-9 bg-black/45 hover:bg-black/60 border border-white/20 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer"
                title="Fechar Story"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* BACKGROUND STORY IMAGE VIEWPORT */}
          <div 
            onClick={handleScreenClick}
            className="relative flex-1 w-full h-full flex items-center justify-center cursor-pointer bg-neutral-900"
          >
            <img 
              src={activeStory.image} 
              alt={activeStory.header}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover select-none pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80";
              }}
            />

            {/* Tap guidelines overlays (Visual hints on hover helper if wanted) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

            {/* Custom Interactive Vector Text Overlays */}
            {activeStory.textOverlays && activeStory.textOverlays.map((item) => (
              <div
                key={item.id}
                className="absolute break-words max-w-[85%] text-center px-1.5 py-0.5 select-none pointer-events-none"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: "translate(-50%, -50%)",
                  color: item.color,
                  fontFamily: item.fontFamily,
                  fontSize: `${item.fontSize}px`,
                  textShadow: "0 2px 4px rgba(0,0,0,0.85), 0 0 2.5px rgba(0,0,0,0.6)"
                }}
              >
                {item.text}
              </div>
            ))}

            {/* Story Core Overlay Info Card at the bottom */}
            <div className="absolute bottom-16 left-0 right-0 px-5 text-white text-left space-y-3 pointer-events-none">
              <motion.div 
                key={activeStory.id + "_info"}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-instagram-yellow">
                  <Sparkles className="w-3.5 h-3.5" /> Destaque Especial
                </div>
                
                <h1 className="text-xl md:text-2xl font-black tracking-tight leading-snug text-white drop-shadow-md">
                  {activeStory.header}
                </h1>
                
                <p className="text-xs md:text-sm text-gray-200/90 leading-relaxed font-medium drop-shadow-xs">
                  {activeStory.description}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Persistent Action call-to-action bottom drawer */}
          <div className="bg-gray-900 border-t border-white/10 p-4 shrink-0 flex items-center justify-between text-white">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Arraste para cima ou Toque nas laterais</span>
            <button
              onClick={() => {
                onClose();
              }}
              className="px-3.5 py-1.5 bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink rounded-xl text-[11px] font-black uppercase flex items-center gap-1.5 shadow-md active:scale-95 transition-all text-white"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Aproveitar no App!
            </button>
          </div>

          {/* Desktop Arrow Indicators */}
          <div className="hidden md:block absolute top-1/2 left-4 -translate-y-1/2 z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              disabled={currentIndex === 0}
              className="p-2 bg-black/60 hover:bg-black/80 border border-white/10 text-white rounded-full transition-all disabled:opacity-20 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden md:block absolute top-1/2 right-4 -translate-y-1/2 z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              disabled={currentIndex === stories.length - 1}
              className="p-2 bg-black/60 hover:bg-black/80 border border-white/10 text-white rounded-full transition-all disabled:opacity-20 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </AnimatePresence>
  );
}
