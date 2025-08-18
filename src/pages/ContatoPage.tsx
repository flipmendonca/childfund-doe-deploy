import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export default function ContatoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-childfund-green to-childfund-green/80 text-white py-20">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Fale Conosco</h1>
            <p className="text-xl max-w-2xl">
              Entre em contato conosco. Estamos aqui para esclarecer suas dúvidas 
              e receber suas sugestões
            </p>
          </div>
        </div>

        <div className="py-16">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-3xl font-bold mb-8 text-childfund-green">
                    Informações de Contato
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-childfund-green/10 p-3 rounded-lg">
                        <Phone className="text-childfund-green" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Telefone Principal</h3>
                        <p className="text-gray-600 text-xl font-medium">0300 313 2003</p>
                        <p className="text-sm text-gray-500 mt-1">Segunda a sexta, 8h às 18h</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-green-500/10 p-3 rounded-lg">
                        <MessageCircle className="text-green-600" size={24} />
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg">WhatsApp</h3>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="bg-green-500 p-2 rounded-full">
                              <MessageCircle className="text-white" size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Quero apadrinhar</p>
                              <a 
                                href="https://wa.me/5531987935884" 
                                className="text-green-600 font-medium hover:text-green-700 transition-colors"
                              >
                                (31) 9 8793 5884
                              </a>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="bg-green-500 p-2 rounded-full">
                              <MessageCircle className="text-white" size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Já sou padrinho/madrinha</p>
                              <a 
                                href="https://wa.me/5531999652936" 
                                className="text-green-600 font-medium hover:text-green-700 transition-colors"
                              >
                                (31) 9 9965 2936
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-childfund-green/10 p-3 rounded-lg">
                        <Mail className="text-childfund-green" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">E-mail</h3>
                        <p className="text-gray-600">atendimento@childfundbrasil.org.br</p>
                        <p className="text-sm text-gray-500">Resposta em até 24h</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-childfund-green/10 p-3 rounded-lg">
                        <MapPin className="text-childfund-green" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Endereço</h3>
                        <p className="text-gray-600">
                          Rua das Flores, 123<br />
                          Centro - Belo Horizonte/MG<br />
                          CEP: 30.000-000
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-childfund-green/10 p-3 rounded-lg">
                        <Clock className="text-childfund-green" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Horário de Funcionamento</h3>
                        <p className="text-gray-600">
                          Segunda a sexta: 8h às 18h<br />
                          Sábados: 8h às 12h
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-8 text-childfund-green">
                    Envie sua Mensagem
                  </h2>
                  
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome
                        </label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-childfund-green"
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-mail
                        </label>
                        <input 
                          type="email" 
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-childfund-green"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input 
                        type="tel" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-childfund-green"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assunto
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-childfund-green">
                        <option>Selecione um assunto</option>
                        <option>Apadrinhamento</option>
                        <option>Doações</option>
                        <option>Voluntariado</option>
                        <option>Parcerias</option>
                        <option>Dúvidas Gerais</option>
                        <option>Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem
                      </label>
                      <textarea 
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-childfund-green"
                        placeholder="Digite sua mensagem..."
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-childfund-green text-white py-3 rounded-md hover:bg-childfund-green/90 font-medium"
                    >
                      Enviar Mensagem
                    </button>
                  </form>
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
