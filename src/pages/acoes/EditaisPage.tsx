
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function EditaisPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-childfund-green to-childfund-green/80 text-white py-20">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Editais</h1>
            <p className="text-xl max-w-2xl">
              Acompanhe nossos processos seletivos e oportunidades de parcerias
            </p>
          </div>
        </div>

        <div className="py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-childfund-green">Editais Abertos</h2>
                
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 border-l-4 border-l-green-500">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-childfund-green mb-2">
                          Edital de Parcerias Locais 2024
                        </h3>
                        <p className="text-gray-600 mb-3">
                          Processo seletivo para organizações interessadas em desenvolver 
                          parcerias na implementação de programas de proteção infantil.
                        </p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Publicado: 15/03/2024</span>
                          <span>Prazo: 30/04/2024</span>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Aberto
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button className="bg-childfund-green text-white px-4 py-2 rounded-md hover:bg-childfund-green/90">
                        Ver Edital
                      </button>
                      <button className="border border-childfund-green text-childfund-green px-4 py-2 rounded-md hover:bg-childfund-green/10">
                        Inscrever-se
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-childfund-green mb-2">
                          Seleção de Consultores Especializados
                        </h3>
                        <p className="text-gray-600 mb-3">
                          Contratação de consultores para desenvolvimento de metodologias 
                          de monitoramento e avaliação de programas sociais.
                        </p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Publicado: 20/03/2024</span>
                          <span>Prazo: 15/05/2024</span>
                        </div>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Em análise
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button className="bg-childfund-green text-white px-4 py-2 rounded-md hover:bg-childfund-green/90">
                        Ver Edital
                      </button>
                      <button className="border border-gray-400 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed">
                        Prazo Encerrado
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-childfund-green">Editais Encerrados</h2>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-xl border">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-700 mb-2">
                          Edital de Formação em Direitos da Criança
                        </h3>
                        <p className="text-gray-600 mb-2">
                          Seleção de facilitadores para cursos de formação em direitos 
                          da criança e adolescente.
                        </p>
                        <div className="text-sm text-gray-500">
                          Encerrado em: 28/02/2024
                        </div>
                      </div>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                        Finalizado
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-700 mb-2">
                          Processo Seletivo Coordenadores Regionais
                        </h3>
                        <p className="text-gray-600 mb-2">
                          Contratação de coordenadores para atuação em territórios 
                          específicos do programa.
                        </p>
                        <div className="text-sm text-gray-500">
                          Encerrado em: 15/01/2024
                        </div>
                      </div>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                        Finalizado
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-childfund-green/5 p-8 rounded-xl">
                <h3 className="text-2xl font-bold mb-4 text-childfund-green">
                  Quer receber notificações sobre novos editais?
                </h3>
                <p className="text-gray-600 mb-6">
                  Cadastre-se em nossa newsletter e seja notificado sempre que 
                  publicarmos novos processos seletivos e oportunidades.
                </p>
                <div className="flex gap-3">
                  <input 
                    type="email" 
                    placeholder="Seu e-mail" 
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-childfund-green"
                  />
                  <button className="bg-childfund-green text-white px-6 py-2 rounded-md hover:bg-childfund-green/90">
                    Cadastrar
                  </button>
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
