
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";

export default function PropositoPage() {
  // @dynamic: page content will come from ACF fields
  // @dynamic: hero image, mission text, values list will be from ACF

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section with full-width image */}
        <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-childfund-green/70 via-black/40 to-childfund-green/70 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1544717301-9cdcb1f5940f?auto=format&fit=crop&w=2000&q=80"
            alt="Close-up de voluntário ajudando criança"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-circular-pattern opacity-20 z-5"></div>
          
          <motion.div 
            className="container relative z-20 text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-8">Nosso Propósito</h1>
            <p className="text-2xl max-w-4xl mx-auto leading-relaxed">
              Nossa missão é garantir que todas as crianças tenham a oportunidade de crescer 
              em um ambiente seguro e amoroso
            </p>
          </motion.div>
        </div>

        <div className="py-20 bg-white">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-8 text-childfund-green">Nossa Missão</h2>
                <p className="text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
                  Promover o desenvolvimento integral de crianças e adolescentes em situação de 
                  vulnerabilidade social, fortalecendo famílias e comunidades para que cada criança 
                  tenha a oportunidade de alcançar seu pleno potencial.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-12 mb-16">
                <motion.div 
                  className="bg-childfund-green-light p-10 rounded-3xl shadow-lg border border-childfund-green/10 relative overflow-hidden"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute top-4 right-4 w-20 h-20 bg-circular-pattern opacity-20 rounded-full"></div>
                  <h3 className="text-3xl font-bold mb-6 text-childfund-green">Visão</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Um mundo onde todas as crianças sejam livres para viver, aprender, 
                    brincar e crescer para alcançar seu pleno potencial, independentemente 
                    de sua origem ou circunstâncias.
                  </p>
                </motion.div>

                <motion.div 
                  className="bg-childfund-orange-light p-10 rounded-3xl shadow-lg border border-childfund-orange/10 relative overflow-hidden"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute top-4 right-4 w-20 h-20 bg-circular-pattern opacity-20 rounded-full"></div>
                  <h3 className="text-3xl font-bold mb-6 text-childfund-green">Valores</h3>
                  <ul className="text-gray-700 space-y-3 text-lg">
                    <li className="flex items-center">
                      <span className="w-3 h-3 bg-childfund-green rounded-full mr-4"></span>
                      Proteção integral da criança
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 bg-childfund-orange rounded-full mr-4"></span>
                      Transparência e prestação de contas
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 bg-childfund-yellow rounded-full mr-4"></span>
                      Respeito à diversidade
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 bg-childfund-light-green rounded-full mr-4"></span>
                      Fortalecimento comunitário
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 bg-childfund-green rounded-full mr-4"></span>
                      Sustentabilidade
                    </li>
                  </ul>
                </motion.div>
              </div>

              <motion.div 
                className="bg-gradient-to-r from-childfund-green-light to-white p-12 rounded-3xl shadow-xl relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="absolute inset-0 bg-circular-pattern opacity-10"></div>
                <h3 className="text-4xl font-bold mb-8 text-childfund-green text-center">Nossos Compromissos</h3>
                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-6xl font-bold text-childfund-green mb-4">100%</div>
                    <p className="text-gray-700 font-medium text-lg">Comprometimento com a proteção infantil</p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-6xl font-bold text-childfund-orange mb-4">85%</div>
                    <p className="text-gray-700 font-medium text-lg">Recursos aplicados diretamente nos programas</p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-6xl font-bold text-childfund-green mb-4">40+</div>
                    <p className="text-gray-700 font-medium text-lg">Anos de experiência no Brasil</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
