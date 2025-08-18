import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function HeroVideoSection() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="py-24 bg-white relative overflow-hidden">
      {/* Decorative elements inspired by the original design */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-childfund-yellow/10 to-transparent"></div>
      
      <div className="container">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-6 py-3 bg-childfund-yellow/10 rounded-full mb-8">
              <span className="text-childfund-yellow font-medium text-lg">📽️ Nossa História</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-gray-800 leading-tight">
              Assista como <span className="text-childfund-green">transformamos</span>
              <br className="hidden md:block" />
              <span className="text-childfund-yellow">vidas e comunidades</span>
            </h2>
            
            <p className="text-2xl text-gray-700 mb-12 leading-relaxed max-w-4xl mx-auto">
              Conheça histórias reais de transformação e veja de perto como 
              <strong className="text-childfund-green"> cada gesto de amor constrói um futuro melhor</strong>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative max-w-5xl mx-auto"
          >
            {!showVideo ? (
              <div 
                className="relative cursor-pointer group"
                onClick={() => setShowVideo(true)}
              >
                {/* Video thumbnail with emotional close-up image like in original */}
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80"
                    alt="Criança com olhar esperançoso"
                    className="w-full h-[600px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Gradient overlay similar to original design */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40 flex flex-col items-center justify-center rounded-3xl group-hover:from-black/80 group-hover:via-black/30 group-hover:to-black/50 transition-all duration-500">
                    
                    {/* Enhanced play button with ChildFund styling */}
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-childfund-yellow/30 rounded-full animate-pulse"></div>
                      <div className="relative bg-childfund-yellow hover:bg-childfund-yellow/90 rounded-full p-8 shadow-2xl group-hover:scale-110 transition-all duration-300">
                        <Play className="text-white ml-1" size={48} />
                      </div>
                    </div>
                    
                    <h3 className="text-white text-4xl font-bold drop-shadow-lg mb-4 text-center">
                      Assista ao Vídeo
                    </h3>
                    <p className="text-white/90 text-xl drop-shadow-md text-center max-w-md">
                      Histórias reais de proteção, amor e transformação
                    </p>
                  </div>
                </div>

                {/* Floating elements inspired by original design */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-childfund-yellow/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-childfund-green/20 rounded-full blur-xl animate-pulse"></div>
              </div>
            ) : (
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="História do ChildFund Brasil - Transformando vidas através da proteção"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </motion.div>

          {/* Content section inspired by the original layout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 text-center"
          >
            <div className="bg-gradient-to-r from-childfund-green/5 via-white to-childfund-yellow/5 rounded-3xl p-12 border border-gray-100">
              <h3 className="text-3xl font-bold text-childfund-green mb-6">
                O que nos guia
              </h3>
              <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
                Ajudar crianças em circunstâncias vulneráveis sempre esteve no nosso coração. 
                Nossa forma de causar impacto evoluiu ao longo do tempo, mas nosso desejo de 
                <strong className="text-childfund-green"> melhorar para sempre a forma como causamos impacto</strong> 
                - e promovemos um espírito de aprendizagem e crescimento desde o início.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
