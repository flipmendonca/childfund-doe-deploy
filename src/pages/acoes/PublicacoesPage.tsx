
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function PublicacoesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-childfund-green to-childfund-green/80 text-white py-20">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Publicações</h1>
            <p className="text-xl max-w-2xl">
              Acesse nossos estudos, pesquisas e materiais técnicos sobre 
              proteção e desenvolvimento infantil
            </p>
          </div>
        </div>

        <div className="py-16">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="bg-childfund-green/10 p-4 rounded-lg mb-4">
                    <h3 className="text-xl font-bold text-childfund-green">
                      Relatório Anual 2023
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Conheça os principais resultados e impactos alcançados pelo 
                    ChildFund Brasil durante o ano de 2023.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">PDF • 2.5 MB</span>
                    <button className="text-childfund-green font-medium hover:underline">
                      Download
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="bg-childfund-green/10 p-4 rounded-lg mb-4">
                    <h3 className="text-xl font-bold text-childfund-green">
                      Metodologia de Apadrinhamento
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Guia técnico sobre nossa metodologia de apadrinhamento e 
                    desenvolvimento comunitário.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">PDF • 1.8 MB</span>
                    <button className="text-childfund-green font-medium hover:underline">
                      Download
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="bg-childfund-green/10 p-4 rounded-lg mb-4">
                    <h3 className="text-xl font-bold text-childfund-green">
                      Pesquisa: Violência contra Crianças
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Estudo sobre as principais formas de violência contra crianças 
                    nos territórios onde atuamos.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">PDF • 3.2 MB</span>
                    <button className="text-childfund-green font-medium hover:underline">
                      Download
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="bg-childfund-green/10 p-4 rounded-lg mb-4">
                    <h3 className="text-xl font-bold text-childfund-green">
                      Manual de Parentalidade Positiva
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Guia prático para famílias sobre técnicas de educação positiva 
                    e fortalecimento de vínculos.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">PDF • 1.5 MB</span>
                    <button className="text-childfund-green font-medium hover:underline">
                      Download
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="bg-childfund-green/10 p-4 rounded-lg mb-4">
                    <h3 className="text-xl font-bold text-childfund-green">
                      Impacto Nutricional
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Relatório sobre os resultados dos programas nutricionais 
                    desenvolvidos em 2023.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">PDF • 2.1 MB</span>
                    <button className="text-childfund-green font-medium hover:underline">
                      Download
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="bg-childfund-green/10 p-4 rounded-lg mb-4">
                    <h3 className="text-xl font-bold text-childfund-green">
                      Guia de Mobilização Comunitária
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Metodologia para mobilização e organização de comunidades 
                    em defesa dos direitos da criança.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">PDF • 2.8 MB</span>
                    <button className="text-childfund-green font-medium hover:underline">
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-16">
                <h2 className="text-3xl font-bold mb-8 text-center text-childfund-green">
                  Publicações por Categoria
                </h2>
                
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-childfund-green/10 to-childfund-green/5 p-6 rounded-xl text-center">
                    <h3 className="text-lg font-bold text-childfund-green mb-2">
                      Relatórios Anuais
                    </h3>
                    <div className="text-2xl font-bold text-childfund-green mb-1">5</div>
                    <p className="text-sm text-gray-600">Publicações</p>
                  </div>

                  <div className="bg-gradient-to-br from-childfund-green/10 to-childfund-green/5 p-6 rounded-xl text-center">
                    <h3 className="text-lg font-bold text-childfund-green mb-2">
                      Pesquisas
                    </h3>
                    <div className="text-2xl font-bold text-childfund-green mb-1">12</div>
                    <p className="text-sm text-gray-600">Estudos</p>
                  </div>

                  <div className="bg-gradient-to-br from-childfund-green/10 to-childfund-green/5 p-6 rounded-xl text-center">
                    <h3 className="text-lg font-bold text-childfund-green mb-2">
                      Manuais Técnicos
                    </h3>
                    <div className="text-2xl font-bold text-childfund-green mb-1">8</div>
                    <p className="text-sm text-gray-600">Guias</p>
                  </div>

                  <div className="bg-gradient-to-br from-childfund-green/10 to-childfund-green/5 p-6 rounded-xl text-center">
                    <h3 className="text-lg font-bold text-childfund-green mb-2">
                      Materiais Educativos
                    </h3>
                    <div className="text-2xl font-bold text-childfund-green mb-1">15</div>
                    <p className="text-sm text-gray-600">Recursos</p>
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
