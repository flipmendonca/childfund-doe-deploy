import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FAQ from "../components/FAQ";
import ChildSponsorshipCarousel from "../components/ChildSponsorshipCarousel";
import DonationOptions from "../components/DonationOptions";
import DonationForm from "../components/DonationForm";
import { motion } from "framer-motion";
import { Heart, Users, Package, Share2, FileText, Phone, Mail, Church, Building2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function ComoApoiarPage() {
  const location = useLocation();
  useEffect(() => {
    // Scroll para seção via hash na URL (método prioritário)
    if (location.hash === '#apadrinhamento') {
      const section = document.getElementById('apadrinhamento');
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
    // Fallback: Scroll via state (para compatibilidade)
    else if (location.state && location.state.scrollTo === 'apadrinhamento') {
      const section = document.getElementById('apadrinhamento');
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Limpar o state após usar
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 300);
      }
    }
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero section com foto em destaque e formulário */}
        <div className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="/images/jake_lyell_1.webp"
              alt="Criança sorrindo durante refeição."
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          </div>
          
          <div className="relative container h-full flex items-center min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full">
              {/* Lado esquerdo - Conteúdo */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
                className="text-white flex flex-col justify-center lg:justify-end h-full pt-4 sm:pt-8 pb-4 sm:pb-8 md:pt-16 md:pb-56 lg:pb-72"
              >
                <div className="flex flex-col gap-0 flex-1 justify-center lg:justify-end">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-white break-words hyphens-auto">
                Transforme uma <span className="text-childfund-yellow">vida</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-xl leading-relaxed opacity-95 mb-6 sm:mb-8 break-words">
                Cada criança tem uma história única e sonhos para o futuro. Seja parte dessa jornada de transformação.
              </p>
                </div>
            </motion.div>

              {/* Lado direito - Formulário de Doação */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:block"
              >
                <div className="w-full max-w-2xl mx-auto flex flex-col md:my-8 lg:my-0 lg:pt-12">
                  <DonationForm />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Formulário de Doação - Mobile */}
        <div className="lg:hidden py-12 bg-gray-50">
          <div className="container px-4">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <DonationForm />
            </div>
          </div>
        </div>

        {/* Seção de Apadrinhamento com Carrossel */}
        <div id="apadrinhamento" className="pt-20 pb-0 bg-transparent">
          <ChildSponsorshipCarousel />
        </div>

        {/* Seção do Guardião da Infância */}
        <div id="guardiao-infancia" className="py-8 sm:py-12 md:py-20 bg-gradient-to-br from-childfund-green to-childfund-green/80 overflow-hidden">
          <div className="container px-2 sm:px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 overflow-hidden">
                <div className="text-center mb-6 sm:mb-8 md:mb-12">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight px-1 sm:px-2 break-words hyphens-auto">
                    Seja um <span className="text-childfund-yellow">Guardião da Infância</span>
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto px-1 sm:px-2 break-words">
                    Transforme vidas com o poder do cuidado. Sua doação mensal é um gesto de amor que cria oportunidades e constrói futuros com dignidade.
                  </p>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-center">
                  <div className="w-full order-2 lg:order-1">
                    <img 
                      src="/images/Foto- Jake_Lyell_2.webp"
                      alt="Crianças do ChildFund Brasil"
                      className="w-full h-40 sm:h-48 md:h-64 lg:h-80 object-cover rounded-xl sm:rounded-2xl shadow-lg"
                    />
                  </div>
                  <div className="space-y-3 sm:space-y-4 md:space-y-6 order-1 lg:order-2 w-full">
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 md:mb-4 break-words hyphens-auto">
                        O que significa ser um Guardião da Infância?
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed break-words hyphens-auto">
                        Ser um Guardião da Infância é mais do que doar. É escolher cuidar, proteger e acreditar no futuro de milhares de crianças e adolescentes em situação de vulnerabilidade. Com uma contribuição mensal, você oferece acesso à educação, saúde, proteção e oportunidades reais de transformação. É um gesto contínuo de amor que ecoa por toda a vida.
                      </p>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-childfund-yellow break-words">
                        Benefícios do Programa:
                      </h4>
                      <ul className="space-y-1.5 sm:space-y-2 md:space-y-3 text-xs sm:text-sm md:text-base text-white/90">
                        <li className="flex items-start gap-2 md:gap-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-childfund-yellow rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                          <span className="break-words hyphens-auto">Apoio contínuo a crianças e adolescentes</span>
                        </li>
                        <li className="flex items-start gap-2 md:gap-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-childfund-yellow rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                          <span className="break-words hyphens-auto">Relatórios periódicos sobre o impacto</span>
                        </li>
                        <li className="flex items-start gap-2 md:gap-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-childfund-yellow rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                          <span className="break-words hyphens-auto">Sua doação sendo usada para quem mais precisa</span>
                        </li>
                        <li className="flex items-start gap-2 md:gap-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-childfund-yellow rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                          <span className="break-words hyphens-auto">Transparência total sobre o uso dos recursos</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button 
                      asChild
                      className="w-full bg-childfund-yellow hover:bg-childfund-yellow/90 text-white py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg font-bold break-words hyphens-auto"
                    >
                      <Link to="/doacao-mensal">
                        Quero Ser um Guardião da Infância
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Seção FAQ */}
        <FAQ />

        {/* Seção de Contato */}
        <div className="py-20 bg-gray-50">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto"
            >
              <div className="text-center mb-8 sm:mb-12 px-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-childfund-green mb-4 sm:mb-6 break-words hyphens-auto">
                  Entre em Contato
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 break-words">
                  Tem dúvidas ou quer saber mais sobre como ajudar? Estamos aqui para você.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-center"
                >
                  <div className="bg-childfund-green/10 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Phone className="text-childfund-green" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-childfund-green mb-2">Telefone</h3>
                  <p className="text-gray-600">0300 313 2003</p>
                  <p className="text-gray-600 text-sm mt-1">Já é doador? 0300 313 0110</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-center"
                >
                  <div className="bg-childfund-green/10 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Mail className="text-childfund-green" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-childfund-green mb-2">E-mail</h3>
                  <p className="text-gray-600">atendimento@childfundbrasil.org.br</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-center"
                >
                  <div className="bg-childfund-green/10 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Building2 className="text-childfund-green" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-childfund-green mb-2">Endereço</h3>
                  <p className="text-gray-600">Belo Horizonte - MG</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-center"
                >
                  <div className="bg-childfund-green/10 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Phone className="text-childfund-green" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-childfund-green mb-2">WhatsApp</h3>
                  <p className="text-gray-600">(31) 9 8793 5884</p>
                  <p className="text-gray-600 text-sm mt-1">Já é doador? (31) 9 9965-2936</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
