
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function HistoriaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-childfund-green to-childfund-green/80 text-white py-20">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Nossa História</h1>
            <p className="text-xl max-w-2xl">
              Conheça a trajetória do ChildFund Brasil e como transformamos vidas há décadas
            </p>
          </div>
        </div>

        <div className="py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold mb-6 text-childfund-green">Uma Jornada de Proteção Infantil</h2>
                
                <p className="text-gray-600 mb-6">
                  O ChildFund Brasil é parte de uma das maiores e mais antigas organizações de desenvolvimento 
                  infantil do mundo. Nossa história começou em 1938, quando um missionário americano chamado 
                  Dr. J. Calvitt Clarke testemunhou o sofrimento de crianças órfãs na China durante a guerra.
                </p>

                <h3 className="text-2xl font-bold mb-4 text-childfund-green">Marcos Importantes</h3>
                
                <div className="space-y-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-xl font-bold mb-2">1938 - Fundação</h4>
                    <p className="text-gray-600">
                      Dr. J. Calvitt Clarke funda o que se tornaria o ChildFund International, 
                      inicialmente focado em ajudar crianças órfãs na China.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-xl font-bold mb-2">1960 - Expansão Global</h4>
                    <p className="text-gray-600">
                      A organização expande suas operações para outros países, 
                      desenvolvendo programas de apadrinhamento e desenvolvimento comunitário.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-xl font-bold mb-2">1982 - Chegada ao Brasil</h4>
                    <p className="text-gray-600">
                      O ChildFund chega ao Brasil, iniciando suas atividades em Minas Gerais 
                      com foco na proteção e desenvolvimento de crianças em situação de vulnerabilidade.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-xl font-bold mb-2">Hoje - Presente em 25 Municípios</h4>
                    <p className="text-gray-600">
                      Atualmente, o ChildFund Brasil atua em 25 municípios brasileiros, 
                      beneficiando mais de 50.000 crianças e adolescentes com programas 
                      de proteção integral e desenvolvimento comunitário.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
