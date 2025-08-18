import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, Shield, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=2000&q=80",
    title: "CRIANÇA SEGURA, FUTURO GARANTIDO!",
    subtitle: "ChildFund Brasil realiza campanha pela proteção de crianças e adolescentes na internet.",
    ctaText: "Saiba mais",
    ctaLink: "/sponsor",
    icon: Shield,
    bgColor: "from-childfund-yellow via-childfund-yellow/90 to-childfund-yellow/80"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1544717301-9cdcb1f5940f?auto=format&fit=crop&w=2000&q=80",
    title: "Faça a diferença",
    subtitle: "Apadrinhe ou doe e ajude o ChildFund Brasil a mudar a vida de milhares de crianças.",
    ctaText: "Quero Ajudar",
    ctaLink: "/sponsor",
    icon: Heart,
    bgColor: "from-childfund-green via-childfund-green/90 to-childfund-green/80"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=2000&q=80",
    title: "Participe desta corrente de amor e cuidado",
    subtitle: "Apoie o ChildFund Brasil e ajude uma criança - ou mais - a viver com dignidade e esperança!",
    ctaText: "Quero Ajudar",
    ctaLink: "/donate-now",
    icon: Sparkles,
    bgColor: "from-childfund-yellow via-childfund-yellow/90 to-childfund-yellow/80"
  }
];

export default function HomeSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[90vh] min-h-[700px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          {/* Background with gradient overlay inspired by original */}
          <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].bgColor} z-10`}></div>
          <img 
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover opacity-20"
          />
          
          {/* Decorative icons pattern similar to original */}
          <div className="absolute inset-0 z-5">
            <div className="absolute top-20 right-20 w-16 h-16 opacity-20">
              <div className="w-full h-full border-4 border-white rounded-lg animate-pulse"></div>
            </div>
            <div className="absolute top-40 right-40 w-12 h-12 opacity-20">
              <div className="w-full h-full bg-white rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-32 right-16 w-20 h-20 opacity-20">
              <Heart className="w-full h-full text-white animate-pulse" />
            </div>
            <div className="absolute bottom-48 left-20 w-14 h-14 opacity-20">
              <Shield className="w-full h-full text-white animate-pulse" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-20 flex items-center justify-start">
        <div className="container">
          <div className="max-w-4xl text-white">
            <motion.div
              key={`icon-${currentSlide}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex justify-start mb-8"
            >
              {React.createElement(slides[currentSlide].icon, { 
                size: 64, 
                className: "text-white drop-shadow-lg" 
              })}
            </motion.div>
            
            <motion.h1 
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 drop-shadow-lg leading-tight"
            >
              {slides[currentSlide].title}
            </motion.h1>
            
            <motion.p 
              key={`subtitle-${currentSlide}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl mb-12 max-w-3xl leading-relaxed drop-shadow-md"
            >
              {slides[currentSlide].subtitle}
            </motion.p>
            
            <motion.div
              key={`cta-${currentSlide}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to={slides[currentSlide].ctaLink}>
                <Button className="bg-childfund-yellow hover:bg-childfund-yellow/90 text-gray-800 text-xl py-8 px-12 rounded-xl shadow-2xl flex items-center gap-3 transform hover:scale-105 transition-all duration-300 font-bold">
                  {slides[currentSlide].ctaText}
                  <svg className="w-6 h-6 ml-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-4 rounded-full transition-all hover:scale-110"
        aria-label="Slide anterior"
      >
        <ArrowLeft size={28} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-4 rounded-full transition-all hover:scale-110"
        aria-label="Próximo slide"
      >
        <ArrowRight size={28} />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
