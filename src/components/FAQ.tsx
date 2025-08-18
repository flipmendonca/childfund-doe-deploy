import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openItem, setOpenItem] = useState<number | null>(0); // First item open by default

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  const faqItems: FAQItem[] = [
    {
      question: "Como o dinheiro da minha doação é utilizado?",
      answer: "Sua doação é direcionada para projetos e programas de desenvolvimento infantil, educação, saúde, nutrição e proteção. 75% dos recursos são investidos diretamente nos programas e projetos, enquanto 25% custeiam despesas administrativas e captação de recursos, garantindo a sustentabilidade do nosso trabalho."
    },
    {
      question: "Qual a diferença entre apadrinhar e ser um Guardião da Infância?",
      answer: "Como Guardião da Infância, você contribui com um valor mensal que será destinado aos projetos e programas da organização, sempre aonde a necessidade for mais urgente e recebe relatórios e comunicados constantes sobre o progresso do nosso trabalho. No apadrinhamento, além de contribuir financeiramente, você estabelece uma relação com uma criança específica, recebendo atualizações sobre seu desenvolvimento, podendo trocar correspondências e acompanhar seu crescimento."
    },
    {
      question: "Posso cancelar minha contribuição a qualquer momento?",
      answer: "Sim, você pode cancelar ou pausar sua contribuição sempre que precisar. Sabemos que a vida muda, e estamos aqui para apoiar você também. Para isso, basta entrar em contato com a nossa equipe pelos canais de atendimento ao doador. Ainda assim, reforçamos o quanto sua doação é valiosa: ela representa continuidade, cuidado e esperança para crianças que contam com esse apoio todos os dias. Se puder seguir com a gente, seu gesto continuará transformando vidas."
    }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Perguntas Frequentes</h2>
          <p className="text-gray-600">Encontre respostas para suas dúvidas sobre como funciona nosso trabalho.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="flex items-center justify-between w-full p-6 text-left focus:outline-none"
                  aria-expanded={openItem === index}
                >
                  <h3 className="font-medium text-lg">{item.question}</h3>
                  <ChevronDown 
                    className={`transition-transform ${openItem === index ? 'rotate-180' : ''}`} 
                    size={20}
                  />
                </button>

                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    openItem === index 
                      ? 'max-h-96 opacity-100' 
                      : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="p-6 pt-0 text-gray-600">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}
