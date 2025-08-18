import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { ArrowDown, Heart, HandHeart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";

export default function Hero() {
  const { user } = useAuth();
  
  const scrollToNext = () => {
    const nextSection = document.getElementById('donation-options');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background melhorado com gradiente unificado */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-childfund-green/60 via-black/40 to-childfund-green/60 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1544717301-9cdcb1f5940f?auto=format&fit=crop&w=2000&q=80" 
          alt="Close-up de criança sorrindo com esperança"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-circular-pattern opacity-20 z-5"></div>
      </div>
      
      {/* Conteúdo principal */}
      <motion.div 
        className="container relative z-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Seja a <span className="text-childfund-yellow">proteção</span> que uma criança precisa
          </motion.h1>
          <motion.p 
            className="text-2xl md:text-3xl mb-16 opacity-95 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Cada gesto de amor, cada apadrinhamento, cada doação constrói um futuro de esperança e dignidade.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-8 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {user ? (
              <Link to="/dashboard" className="group">
                <Button className="bg-childfund-green hover:bg-childfund-green/90 text-white text-xl py-8 px-12 rounded-2xl w-full sm:w-auto shadow-2xl shadow-childfund-green/30 flex items-center gap-3 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
                  <Heart className="fill-white text-white" size={24} />
                  <span>Meu Dashboard</span>
                  <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </Link>
            ) : (
              <Link to="/sponsor" className="group">
                <Button className="bg-childfund-green hover:bg-childfund-green/90 text-white text-xl py-8 px-12 rounded-2xl w-full sm:w-auto shadow-2xl shadow-childfund-green/30 flex items-center gap-3 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
                  <HandHeart className="fill-white text-white" size={24} />
                  <span>Proteger uma Criança Agora</span>
                  <svg className="w-6 h-6 ml-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </Link>
            )}
            <Link to="/quero-ajudar" className="group">
              <Button 
                variant="outline" 
                className="border-3 border-childfund-yellow text-childfund-yellow hover:bg-childfund-yellow hover:text-white text-xl py-8 px-12 rounded-2xl w-full sm:w-auto shadow-2xl shadow-childfund-yellow/20 flex items-center gap-3 transform transition-all duration-500 hover:scale-105 bg-white/10 backdrop-blur-sm"
              >
                <Heart className="fill-childfund-yellow group-hover:fill-white" size={24} />
                <span>Fazer uma Doação</span>
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Indicador de scroll melhorado */}
      <motion.button 
        onClick={scrollToNext}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white flex flex-col items-center z-20"
        aria-label="Rolar para baixo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        whileHover={{ y: 5 }}
      >
        <span className="mb-4 text-lg font-medium">Saiba mais</span>
        <motion.div
          animate={{ 
            y: [0, 8, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
          className="bg-white/20 backdrop-blur-sm rounded-full p-4"
        >
          <ArrowDown size={32} className="text-white" />
        </motion.div>
      </motion.button>
    </div>
  );
}
