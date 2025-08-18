
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function InteligenciaSocialPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-childfund-green to-childfund-green/80 text-white py-20">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Inteligência Social</h1>
            <p className="text-xl max-w-2xl">
              Utilizamos dados e pesquisas para compreender melhor os desafios 
              enfrentados por crianças e famílias
            </p>
          </div>
        </div>

        <div className="py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-childfund-green">
                  O que é Inteligência Social?
                </h2>
                <p className="text-gray-600 mb-6">
                  A Inteligência Social é nossa abordagem baseada em evidências para 
                  compreender os contextos sociais, econômicos e culturais das comunidades 
                  onde atuamos. Através de pesquisas, análises de dados e diagnósticos 
                  participativos, desenvolvemos estratégias mais eficazes para proteger 
                  crianças e fortalecer famílias.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold mb-4 text-childfund-green">Diagnósticos Participativos</h3>
                  <p className="text-gray-600">
                    Realizamos diagnósticos com a participação ativa das comunidades, 
                    ouvindo crianças, adolescentes, famílias e lideranças locais para 
                    compreender suas necessidades e potencialidades.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold mb-4 text-childfund-green">Pesquisas Aplicadas</h3>
                  <p className="text-gray-600">
                    Desenvolvemos pesquisas específicas sobre temas como violência 
                    contra crianças, trabalho infantil, evasão escolar e outros 
                    desafios enfrentados pelos territórios.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold mb-4 text-childfund-green">Monitoramento e Avaliação</h3>
                  <p className="text-gray-600">
                    Acompanhamos continuamente os resultados de nossos programas, 
                    utilizando indicadores de impacto para garantir a efetividade 
                    de nossas ações.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold mb-4 text-childfund-green">Gestão do Conhecimento</h3>
                  <p className="text-gray-600">
                    Sistematizamos e compartilhamos os aprendizados gerados, 
                    contribuindo para o avanço das políticas públicas de 
                    proteção à infância e adolescência.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-childfund-green/5 p-8 rounded-xl">
                <h3 className="text-2xl font-bold mb-4 text-childfund-green">Resultados da Inteligência Social</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-childfund-green mb-2">50+</div>
                    <p className="text-gray-600">Pesquisas realizadas</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-childfund-green mb-2">25</div>
                    <p className="text-gray-600">Municípios mapeados</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-childfund-green mb-2">100%</div>
                    <p className="text-gray-600">Programas baseados em evidências</p>
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
