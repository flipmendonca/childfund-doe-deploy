
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface Person {
  id: string;
  name: string;
  video: string;
  story: string;
  image: string;
}

const people: Person[] = [
  {
    id: "eliseux",
    name: "Eliseux",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    story: "Eliseux tinha apenas 8 anos quando chegou ao programa. Hoje, aos 16, ele sonha em ser médico e já demonstra um talento especial para cuidar dos outros.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "sabrina",
    name: "Sabrina",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    story: "Sabrina descobriu sua paixão pela educação através do programa. Hoje ela é professora e dedica sua vida a ensinar outras crianças em sua comunidade.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b9ac?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "claudio",
    name: "Claudio",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    story: "Claudio sempre teve um sonho: ser engenheiro. Com o apoio do programa, ele conseguiu se formar e hoje trabalha construindo casas para famílias necessitadas.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80"
  }
];

export default function ChangeTheFutureSection() {
  const [activePerson, setActivePerson] = useState<string>("eliseux");
  const [showVideo, setShowVideo] = useState<string | null>(null);

  const currentPerson = people.find(p => p.id === activePerson) || people[0];

  return (
    <div className="py-24 bg-gradient-to-br from-gray-50 via-white to-childfund-green-light/20">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center px-6 py-3 bg-childfund-green/10 rounded-full mb-6">
            <Star className="fill-childfund-green text-childfund-green mr-2" size={20} />
            <span className="text-childfund-green font-medium text-lg">Histórias de Transformação</span>
          </div>
          
          <h2 className="text-5xl font-bold mb-6 text-gray-800">
            Mude o <span className="text-childfund-green">futuro</span> de uma criança
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Conheça histórias reais de transformação e veja como você pode fazer parte dessa mudança.
          </p>
        </motion.div>

        <div className="space-y-12">
          {/* Navegação por pessoas */}
          <div className="flex justify-center">
            <div className="flex gap-4 bg-white rounded-2xl p-2 shadow-lg">
              {people.map((person) => (
                <button
                  key={person.id}
                  onClick={() => {
                    setActivePerson(person.id);
                    setShowVideo(null);
                  }}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                    activePerson === person.id
                      ? 'bg-childfund-green text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <img 
                    src={person.image}
                    alt={person.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                  <div className="text-left">
                    <div className="font-bold">{person.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo da pessoa ativa */}
          <motion.div
            key={activePerson}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Vídeo/Imagem */}
            <div className="relative">
              <Card className="overflow-hidden shadow-xl">
                <CardContent className="p-0">
                  {showVideo === currentPerson.id ? (
                    <div className="aspect-video">
                      <iframe
                        src={currentPerson.video}
                        title={`Vídeo de ${currentPerson.name}`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div 
                      className="relative cursor-pointer group aspect-video"
                      onClick={() => setShowVideo(currentPerson.id)}
                    >
                      <img 
                        src={currentPerson.image}
                        alt={currentPerson.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-all">
                        <div className="bg-childfund-green rounded-full p-6 group-hover:scale-110 transition-transform shadow-2xl">
                          <Play className="fill-white text-white" size={32} />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* História */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-gray-800">
                  História de {currentPerson.name}
                </h3>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                {currentPerson.story}
              </p>
              
              {/* Estatísticas de impacto */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-childfund-green">8</div>
                    <div className="text-sm text-gray-600">Anos no programa</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-childfund-orange">100%</div>
                    <div className="text-sm text-gray-600">Dedicação</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-childfund-yellow">+50</div>
                    <div className="text-sm text-gray-600">Vidas impactadas</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
