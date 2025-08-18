import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { Heart, Shield, BookOpen, Users } from "lucide-react";

export default function MakeDifferenceSection() {
  return (
    <div className="py-24 bg-white overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Elementos decorativos aprimorados */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-gradient-to-br from-childfund-green/20 to-childfund-green/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-gradient-to-br from-childfund-light-green/30 to-childfund-light-green/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10 group">
              <div className="overflow-hidden rounded-3xl shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1544717301-9cdcb1f5940f?auto=format&fit=crop&w=800&q=80"
                  alt="Homem adulto e criança sorrindo juntos"
                  className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {/* Badge flutuante redesenhado */}
              <div className="absolute top-8 right-8 bg-childfund-green/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="fill-white text-white" size={24} />
                  <div className="text-2xl font-bold text-white">Faça a</div>
                </div>
                <div className="text-2xl font-bold text-childfund-yellow">diferença</div>
                <div className="text-sm text-white/90 mt-2">Transforme vidas</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center px-6 py-3 bg-childfund-green/10 rounded-full">
                <Heart className="fill-childfund-green text-childfund-green mr-2" size={20} />
                <span className="text-childfund-green font-medium text-lg">Faça a diferença</span>
              </div>
              
              <h2 className="text-5xl font-bold text-gray-800 leading-tight">
                Apadrinhe ou <span className="text-childfund-green">doe</span> e ajude o ChildFund Brasil
                <span className="block text-childfund-yellow">a mudar a vida de milhares de crianças</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-xl text-gray-700 leading-relaxed">
                  Sua participação não é apenas uma doação – é um <strong className="text-childfund-green">compromisso com a dignidade humana</strong>, 
                  um investimento no futuro de quem mais precisa de proteção e cuidado.
                </p>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Juntos, construímos uma rede de proteção que garante direitos, oferece oportunidades 
                  e transforma vulnerabilidades em fortalezas.
                </p>
              </div>
            </div>
            
            {/* Lista de recursos com ícones preenchidos */}
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="bg-childfund-green/10 p-3 rounded-full">
                  <Shield className="fill-childfund-green text-childfund-green" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Proteção integral da criança</h4>
                  <p className="text-gray-600">Garantindo direitos fundamentais e segurança</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="bg-childfund-light-green/10 p-3 rounded-full">
                  <Users className="fill-childfund-light-green text-childfund-light-green" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Desenvolvimento comunitário</h4>
                  <p className="text-gray-600">Fortalecendo famílias e comunidades inteiras</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="bg-childfund-yellow/10 p-3 rounded-full">
                  <BookOpen className="fill-childfund-yellow text-childfund-yellow" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">Educação e capacitação</h4>
                  <p className="text-gray-600">Construindo um futuro de oportunidades</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/sponsor">
                <Button className="bg-childfund-green hover:bg-childfund-green/90 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group w-full sm:w-auto">
                  <Heart className="fill-white text-white mr-2" size={20} />
                  <span>Apadrinhar uma Criança</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
              <Link to="/como-apoiar">
                <Button className="bg-childfund-light-green hover:bg-childfund-light-green/90 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto font-bold">
                  Fazer uma Doação
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
