import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { HandHeart, Users, Globe, Sparkles } from "lucide-react";

export default function LoveChainSection() {
  return (
    <div className="py-24 bg-gradient-to-br from-childfund-light-green/5 via-white to-childfund-yellow/10 overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1 space-y-8"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center px-6 py-3 bg-childfund-light-green/20 rounded-full">
                <HandHeart className="fill-childfund-light-green text-childfund-light-green mr-2" size={20} />
                <span className="text-childfund-light-green font-medium text-lg">Participe desta corrente</span>
              </div>
              
              <h2 className="text-5xl font-bold text-gray-800 leading-tight">
                Participe desta <span className="text-childfund-light-green">corrente de amor</span> e cuidado
              </h2>
              
              <div className="space-y-4">
                <p className="text-xl text-gray-700 leading-relaxed">
                  Apoie o ChildFund Brasil e ajude uma criança - ou mais - 
                  <strong className="text-childfund-green"> a viver com dignidade e esperança!</strong>
                </p>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Sua participação conecta corações solidários e constrói pontes entre a vulnerabilidade 
                  e a esperança, criando um futuro onde cada criança pode florescer com dignidade.
                </p>
              </div>
            </div>
            
            {/* Estatísticas redesenhadas com ícones preenchidos */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="mb-3">
                  <Globe className="fill-childfund-green text-childfund-green mx-auto" size={32} />
                </div>
                <div className="text-3xl font-bold text-childfund-green mb-2">70+</div>
                <div className="text-sm text-gray-600 font-medium">Países</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="mb-3">
                  <Users className="fill-childfund-light-green text-childfund-light-green mx-auto" size={32} />
                </div>
                <div className="text-3xl font-bold text-childfund-light-green mb-2">25</div>
                <div className="text-sm text-gray-600 font-medium">Estados</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="mb-3">
                  <HandHeart className="fill-childfund-green text-childfund-green mx-auto" size={32} />
                </div>
                <div className="text-3xl font-bold text-childfund-green mb-2">150k</div>
                <div className="text-sm text-gray-600 font-medium">Vidas</div>
              </div>
            </div>
            
            <Link to="/como-apoiar">
              <Button className="bg-childfund-light-green hover:bg-childfund-light-green/90 text-white px-12 py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group font-bold">
                <span>Quero Ajudar</span>
                <Sparkles className="fill-white text-white ml-3 group-hover:rotate-12 transition-transform" size={24} />
              </Button>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            {/* Elementos decorativos melhorados */}
            <div className="absolute -top-16 -left-16 w-40 h-40 bg-gradient-to-br from-childfund-light-green/30 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-gradient-to-br from-childfund-yellow/40 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80"
                  alt="Criança sorrindo e brincando com bolhas de sabão"
                  className="rounded-3xl shadow-2xl w-full h-[500px] object-cover hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay com depoimento melhorado */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                  <div className="flex items-start gap-3">
                    <HandHeart className="fill-childfund-green text-childfund-green flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="text-gray-800 font-medium text-lg leading-relaxed mb-2">
                        "Cada criança é um universo de possibilidades. 
                        <span className="text-childfund-green font-bold"> Junte-se a nós e mude o futuro de uma criança</span> 
                        como aconteceu comigo!"
                      </p>
                      <div className="text-childfund-light-green font-bold">- História real de transformação</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
