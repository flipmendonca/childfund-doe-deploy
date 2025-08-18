import * as React from 'react';
import { Child } from "../types/Child";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, MapPin, BookOpen, Utensils, GraduationCap, Music, Stethoscope, Smile, Users, Home, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useSwipeable } from 'react-swipeable';
import { useEffect, useState } from 'react';

const EMOJI_MAP: Record<string, JSX.Element> = {
  "Apoio educacional": <BookOpen className="inline text-[#007A45]" size={18} />, 
  "Apoio nutricional": <Utensils className="inline text-[#FE7130]" size={18} />, 
  "Acompanhamento escolar": <GraduationCap className="inline text-[#3CC387]" size={18} />,
  "Desenvolvimento artístico": <Music className="inline text-[#FBB21D]" size={18} />,
  "Cuidados de saúde": <Stethoscope className="inline text-[#007A45]" size={18} />,
  "Suporte familiar": <Users className="inline text-[#3CC387]" size={18} />,
  "Proteção e segurança": <Shield className="inline text-[#007A45]" size={18} />,
  "Melhoria habitacional": <Home className="inline text-[#FBB21D]" size={18} />,
  "Desenvolvimento social": <Smile className="inline text-[#3CC387]" size={18} />,
};

const NEED_COLORS: Record<string, { bg: string, text: string }> = {
  "Apoio educacional": { bg: "#DFF5E8", text: "#007A45" },
  "Apoio nutricional": { bg: "#FFE5D2", text: "#FE7130" },
  "Acompanhamento escolar": { bg: "#E6F4EF", text: "#3CC387" },
  "Desenvolvimento artístico": { bg: "#FFF1D2", text: "#FBB21D" },
  "Cuidados de saúde": { bg: "#DFF5E8", text: "#007A45" },
  "Suporte familiar": { bg: "#E6F4EF", text: "#3CC387" },
  "Proteção e segurança": { bg: "#DFF5E8", text: "#007A45" },
  "Melhoria habitacional": { bg: "#FFF1D2", text: "#FBB21D" },
  "Desenvolvimento social": { bg: "#E6F4EF", text: "#3CC387" },
};

function getNeedIcon(need: string) {
  return EMOJI_MAP[need] || <Smile className="inline text-[#007A45]" size={18} />;
}

function getNeedStyle(need: string) {
  return NEED_COLORS[need] || { bg: "#DFF5E8", text: "#007A45" };
}

interface ChildDetailPanelProps {
  child: Child;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export default function ChildDetailPanel({ child, onSwipeLeft, onSwipeRight }: ChildDetailPanelProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  // Log para depuração
  console.log('🔍 DEBUG: ChildDetailPanel renderizado com criança:', child.name, 'ID:', child.id);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Log para detectar mudanças na criança
  useEffect(() => {
    console.log('🔍 DEBUG: ChildDetailPanel - criança mudou para:', child.name, 'ID:', child.id);
  }, [child]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => isMobile && onSwipeLeft && onSwipeLeft(),
    onSwipedRight: () => isMobile && onSwipeRight && onSwipeRight(),
    trackMouse: false,
  });

  const Wrapper = isMobile ? 'div' : React.Fragment;

  return (
    <Card className="bg-[#FFF8EC] border border-[#3CC387]/20 mt-8 shadow-[0px_4px_10px_rgba(0,0,0,0.08)]">
      <CardContent className="p-0 md:p-0">
        {isMobile ? (
          <div {...swipeHandlers} className="flex flex-col md:flex-row items-stretch">
            <div className="flex-shrink-0 w-full md:w-[320px] h-[320px] md:h-[420px] overflow-hidden rounded-t-2xl md:rounded-l-2xl flex items-center justify-center bg-[#E6F4EF]" style={{minWidth: 0}}>
              <img 
                src={child.image}
                alt={child.name}
                className="w-full h-full object-cover object-center rounded-t-2xl md:rounded-l-2xl shadow-sm"
                style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#E6F4EF'}}
              />
            </div>
            <div className="flex-1 p-4 md:p-8 flex flex-col justify-center">
              <h3 className="text-xl md:text-2xl font-semibold mb-2 text-[#007A45]">Conheça {child.name}</h3>
              <div className="flex items-center gap-2 text-[#666666] mb-4">
                <MapPin size={16} className="text-[#3CC387]" />
                <span>{child.location} • {child.age} anos • {child.gender === 'F' ? 'Menina' : 'Menino'}</span>
              </div>
              <p className="text-[#444444] leading-relaxed mb-4">{child.story}</p>
              <div className="mb-4">
                <h4 className="font-semibold mb-3 text-[#007A45]">O que {child.name} mais precisa:</h4>
                <div className="flex flex-wrap gap-2">
                  {child.needs.map((need, index) => {
                    const style = getNeedStyle(need);
                    return (
                      <span 
                        key={index}
                        className="px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center gap-1"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        {getNeedIcon(need)} {need}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="pt-2">
                <Link 
                  to={`/doar-apadrinhamento?child=${child.id}&name=${encodeURIComponent(child.name)}&age=${child.age}&location=${encodeURIComponent(child.location)}&image=${encodeURIComponent(child.image)}&story=${encodeURIComponent(child.story || '')}&gender=${child.gender}&birthdate=${encodeURIComponent(child.birthdate || '')}`}
                >
                  <Button className="bg-[#FE7130] hover:bg-[#FE7130]/90 text-white flex items-center gap-2 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Quero apadrinhar {child.name}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="flex-shrink-0 w-full md:w-[320px] h-[320px] md:h-[420px] overflow-hidden rounded-t-2xl md:rounded-l-2xl flex items-center justify-center bg-[#E6F4EF]" style={{minWidth: 0}}>
              <img 
                src={child.image}
                alt={child.name}
                className="w-full h-full object-cover object-center rounded-t-2xl md:rounded-l-2xl shadow-sm"
                style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#E6F4EF'}}
              />
            </div>
            <div className="flex-1 p-4 md:p-8 flex flex-col justify-center">
              <h3 className="text-xl md:text-2xl font-semibold mb-2 text-[#007A45]">Conheça {child.name}</h3>
              <div className="flex items-center gap-2 text-[#666666] mb-4">
                <MapPin size={16} className="text-[#3CC387]" />
                <span>{child.location} • {child.age} anos • {child.gender === 'F' ? 'Menina' : 'Menino'}</span>
              </div>
              <p className="text-[#444444] leading-relaxed mb-4">{child.story}</p>
              <div className="mb-4">
                <h4 className="font-semibold mb-3 text-[#007A45]">O que {child.name} mais precisa:</h4>
                <div className="flex flex-wrap gap-2">
                  {child.needs.map((need, index) => {
                    const style = getNeedStyle(need);
                    return (
                      <span 
                        key={index}
                        className="px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center gap-1"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        {getNeedIcon(need)} {need}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="pt-2">
                <Link 
                  to={`/doar-apadrinhamento?child=${child.id}&name=${encodeURIComponent(child.name)}&age=${child.age}&location=${encodeURIComponent(child.location)}&image=${encodeURIComponent(child.image)}&story=${encodeURIComponent(child.story || '')}&gender=${child.gender}&birthdate=${encodeURIComponent(child.birthdate || '')}`}
                >
                  <Button className="bg-[#FE7130] hover:bg-[#FE7130]/90 text-white flex items-center gap-2 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Quero apadrinhar {child.name}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 