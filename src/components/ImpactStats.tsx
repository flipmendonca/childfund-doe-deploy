
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Stat {
  id: string;
  value: number;
  label: string;
  unit?: string;
  prefix?: string;
}

export default function ImpactStats() {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<{[key: string]: number}>({
    children: 0,
    communities: 0,
    years: 0,
    donors: 0
  });

  // @dynamic: stats data will come from ACF fields
  const stats: Stat[] = [
    {
      id: "children",
      value: 50000,
      label: "crianças beneficiadas diretamente"
    },
    {
      id: "communities",
      value: 350,
      label: "comunidades transformadas"
    },
    {
      id: "years",
      value: 30,
      label: "anos de atuação no Brasil"
    },
    {
      id: "donors",
      value: 15000,
      label: "doadores e padrinhos ativos",
      prefix: "+"
    }
  ];

  // Observer to trigger animation when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  // Animate counters
  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // milliseconds
    const frameRate = 30; // frames per second
    const frameDuration = 1000 / frameRate;
    const totalFrames = duration / frameDuration;

    let frame = 0;
    const timers: number[] = [];

    const counter = setInterval(() => {
      frame++;
      
      const progress = Math.min(frame / totalFrames, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
      // Calculate current count for each stat
      stats.forEach(stat => {
        const value = Math.floor(stat.value * easeOutProgress);
        setCounts(prev => ({ ...prev, [stat.id]: value }));
      });

      if (frame === totalFrames) {
        clearInterval(counter);
      }
    }, frameDuration);

    return () => {
      clearInterval(counter);
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isVisible]);

  return (
    <div className="py-24 bg-childfund-green-light relative overflow-hidden" ref={statsRef}>
      {/* Circular pattern watermark */}
      <div className="absolute inset-0 bg-circular-pattern opacity-10"></div>
      
      <div className="container relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-childfund-green">
            Nosso Impacto em Números
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            Cada número representa crianças reais que tiveram suas vidas transformadas 
            graças ao apoio de pessoas como você.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.id} 
              className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl text-center shadow-lg border border-childfund-green/10 hover:shadow-xl hover:bg-white/90 transition-all duration-500 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="text-5xl md:text-6xl font-bold text-childfund-green mb-4 group-hover:scale-110 transition-transform duration-300">
                {stat.prefix || ""}{counts[stat.id].toLocaleString()}{stat.unit || ""}
              </div>
              <p className="text-gray-700 font-medium leading-tight">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-10 flex flex-col md:flex-row gap-8 items-center shadow-lg border border-childfund-green/10"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-full md:w-1/3">
              <img 
                src="https://images.unsplash.com/photo-1617449642004-46739c4647ae?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="Criança na escola" 
                className="rounded-xl w-full h-40 object-cover shadow-md"
                loading="lazy"
              />
            </div>
            <div className="w-full md:w-2/3">
              <h3 className="font-bold text-2xl mb-4 text-childfund-green">Educação Transformadora</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                92% das crianças apadrinhadas completam o ensino médio, comparado com 42% da média nacional em regiões vulneráveis.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-10 flex flex-col md:flex-row gap-8 items-center shadow-lg border border-childfund-green/10"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-full md:w-1/3">
              <img 
                src="https://images.unsplash.com/photo-1518398046578-8cca57782e17?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="Família reunida" 
                className="rounded-xl w-full h-40 object-cover shadow-md"
                loading="lazy"
              />
            </div>
            <div className="w-full md:w-2/3">
              <h3 className="font-bold text-2xl mb-4 text-childfund-green">Fortalecimento Familiar</h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                Famílias participantes relatam 75% mais confiança para criar seus filhos em ambientes seguros e saudáveis.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
