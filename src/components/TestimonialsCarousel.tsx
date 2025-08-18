import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  message: string;
  image: string;
  location: string;
}

export default function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  // @dynamic: testimonials data will come from ACF fields
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Maria Santos",
      role: "Madrinha há 5 anos",
      message: "Ver o crescimento da minha afilhada me enche de alegria. É incrível como pequenos gestos podem transformar vidas.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b9ac?auto=format&fit=crop&w=300&q=80",
      location: "São Paulo, SP"
    },
    {
      id: 2,
      name: "João Silva",
      role: "Doador mensal",
      message: "Participar do ChildFund me deu um propósito maior. Saber que estou contribuindo para um futuro melhor é gratificante.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
      location: "Rio de Janeiro, RJ"
    },
    {
      id: 3,
      name: "Ana Costa",
      role: "Voluntária",
      message: "O amor e a esperança que vejo nos olhos das crianças me motivam todos os dias a continuar ajudando.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
      location: "Belo Horizonte, MG"
    },
    {
      id: 4,
      name: "Carlos Oliveira",
      role: "Padrinho há 3 anos",
      message: "A transparência e o carinho do ChildFund me conquistaram. É uma organização que realmente faz a diferença.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      location: "Porto Alegre, RS"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="py-24 bg-childfund-yellow-light relative overflow-hidden">
      {/* Circular pattern watermark */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-circular-pattern opacity-10 rounded-full"></div>
      
      <div className="container relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-childfund-green">
            Histórias de Quem Faz a Diferença
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Conheça pessoas que, como você, acreditam no poder transformador do amor e da solidariedade.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className={`relative p-8 rounded-2xl transition-all duration-500 cursor-pointer ${
                  index === activeIndex 
                    ? 'bg-white shadow-2xl shadow-childfund-green/20 scale-105 border-2 border-childfund-green/20' 
                    : 'bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white/80'
                }`}
                onClick={() => setActiveIndex(index)}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-childfund-green/20 mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">{testimonial.name}</h4>
                    <p className="text-childfund-green font-medium">{testimonial.role}</p>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
                
                <Quote className="text-childfund-yellow mb-4" size={32} />
                <p className="text-gray-700 leading-relaxed italic">
                  "{testimonial.message}"
                </p>

                {index === activeIndex && (
                  <motion.div 
                    className="absolute -top-2 -right-2 bg-childfund-green text-white rounded-full p-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Quote size={20} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6">
            <motion.button
              onClick={prevTestimonial}
              className="bg-white/80 backdrop-blur-sm hover:bg-white text-childfund-green p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={24} />
            </motion.button>

            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === activeIndex 
                      ? 'bg-childfund-green w-8' 
                      : 'bg-childfund-green/30 hover:bg-childfund-green/60'
                  }`}
                />
              ))}
            </div>

            <motion.button
              onClick={nextTestimonial}
              className="bg-white/80 backdrop-blur-sm hover:bg-white text-childfund-green p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight size={24} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
