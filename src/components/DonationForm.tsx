import { useState } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export default function DonationForm() {
  const navigate = useNavigate();
  const [tipoDoacao, setTipoDoacao] = useState<'mensal' | 'unica'>('unica'); // Apadrinhamento como padrão

  return (
    <div className="w-full max-w-2xl mx-auto md:bg-white md:rounded-2xl md:shadow-lg p-4 md:p-8 flex flex-col">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mb-8">
        <button
          className={`flex-1 py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-lg font-medium transition-all text-sm sm:text-base ${
            tipoDoacao === 'unica' 
              ? 'bg-childfund-green text-white shadow-lg' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setTipoDoacao('unica')}
        >
          Apadrinhamento
        </button>
        <button
          className={`flex-1 py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-lg font-medium transition-all text-sm sm:text-base ${
            tipoDoacao === 'mensal' 
              ? 'bg-childfund-yellow text-white shadow-lg' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
          onClick={() => setTipoDoacao('mensal')}
        >
          Guardião da Infância
        </button>
      </div>

      <h1 className="text-2xl font-bold text-center mb-4">
        {tipoDoacao === 'unica' ? (
          <span className="text-childfund-green">Apadrinhamento</span>
        ) : (
          <span className="text-childfund-yellow">Guardião da Infância</span>
        )}
      </h1>
      <p className="text-base text-center text-gray-700 mb-6 font-medium leading-relaxed">
        {tipoDoacao === 'unica' 
          ? 'Apadrinhar uma criança é criar um laço de afeto e esperança. Você acompanha de perto seu crescimento e vê como sua contribuição transforma uma vida.'
          : 'Seja um Guardião da Infância e abrace a causa de milhares de crianças e adolescentes com um gesto contínuo de cuidado e esperança.'}
      </p>

      {/* Call to Action */}
      <div className="flex flex-col gap-4">
        <Button 
          className={`w-full py-6 text-lg font-semibold ${
            tipoDoacao === 'unica' 
              ? 'bg-childfund-green hover:bg-childfund-green/90 text-white' 
              : 'bg-childfund-yellow hover:bg-childfund-yellow/90 text-white'
          }`}
          onClick={() => {
            if (tipoDoacao === 'unica') {
              // Redireciona para a seção de apadrinhamento
              const section = document.getElementById('apadrinhamento');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
              }
            } else {
              // Redireciona para a seção de Guardião da Infância
              const section = document.getElementById('guardiao-infancia');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }}
        >
          {tipoDoacao === 'unica' ? 'Quero apadrinhar' : 'Ser Guardião da Infância'}
        </Button>
      </div>
    </div>
  );
}
