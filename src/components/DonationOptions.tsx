
import { useState } from "react";
import { Heart, Gift, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

type DonationMode = 'once' | 'monthly' | 'sponsor';

export default function DonationOptions() {
  const [selectedMode, setSelectedMode] = useState<DonationMode>('sponsor');

  const donationOptions = [
    {
      id: 'once',
      title: 'Doação Única',
      description: 'Ajude com uma contribuição imediata para atender necessidades urgentes.',
      icon: <Gift size={24} />,
      ctaText: 'Doar Agora',
      ctaLink: '/doar-unica',
      color: 'primary'
    },
    {
      id: 'monthly',
      title: 'Doação Mensal',
      description: 'Transforme vidas com impacto sustentável e recorrente todos os meses.',
      icon: <Heart size={24} />,
      ctaText: 'Contribuir Mensalmente',
      ctaLink: '/doar-mensal',
      color: 'primary'
    },
    {
      id: 'sponsor',
      title: 'Apadrinhamento',
      description: 'Crie uma conexão especial acompanhando o desenvolvimento de uma criança.',
      icon: <Users size={24} />,
      ctaText: 'Apadrinhe uma criança',
      ctaLink: '/#apadrinhamento',
      featured: true,
      color: 'primary'
    },
  ];

  return (
    <div id="donation-options" className="py-24 bg-white">
      <div className="container">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">Como Você Pode Ajudar</h2>
          <p className="text-gray-600">Escolha a forma que melhor se adapta à sua realidade e transforme a vida de crianças em situação de vulnerabilidade.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {donationOptions.map((option, index) => (
            <motion.div 
              key={option.id}
              className={`bg-white rounded-xl border ${
                option.id === selectedMode 
                  ? 'border-primary shadow-lg shadow-primary/10' 
                  : 'border-gray-200 shadow-md hover:shadow-lg'
              } transition-all duration-300 relative overflow-hidden ${
                option.featured 
                  ? 'md:transform md:scale-105 md:-translate-y-1' 
                  : ''
              }`}
              onMouseEnter={() => setSelectedMode(option.id as DonationMode)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {option.featured && (
                <div className="absolute top-0 left-0 right-0 bg-childfund-orange text-white py-1.5 text-center text-sm font-medium">
                  Recomendado
                </div>
              )}
              
              <div className="p-8 pt-12">
                <div className={`w-16 h-16 rounded-full mb-6 flex items-center justify-center ${
                  option.id === selectedMode 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-500'
                } transition-all duration-300 mx-auto`}>
                  {option.icon}
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-center">{option.title}</h3>
                <p className="text-gray-600 mb-8 text-center">{option.description}</p>
                
                <div className="mt-auto">
                  <Link 
                    to={option.ctaLink}
                    className={`group flex items-center justify-center w-full py-4 px-6 rounded-lg transition-all font-medium ${
                      option.id === selectedMode 
                        ? 'bg-primary text-white hover:bg-primary-hover' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{option.ctaText}</span>
                    <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
