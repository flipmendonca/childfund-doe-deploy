import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-childfund-green text-white pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="mb-6">
              <img src="/logo-branca-transp.png" alt="ChildFund Brasil" className="h-32 object-contain" />
            </div>
            <p className="text-white/90 mb-6">
              Acreditamos que cada criança merece a oportunidade de crescer saudável, segura e com acesso à educação de qualidade.
            </p>
            
            {/* Selos movidos para cá - em linha única */}
            <div className="mb-6">
              <h4 className="font-bold mb-4 text-sm">Selos e Certificações</h4>
              <div className="flex flex-wrap gap-3">
                {/* Prêmio Melhores ONGs 2024 */}
                <a 
                  href="https://www.premiomelhores.org/conheca-as-melhores-ongs-de-2024-2" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group hover:opacity-80 transition-opacity"
                  title="Prêmio Melhores ONGs 2024"
                >
                  <img 
                    src="/selos/LOGO_MELHORES_2024-500x500-2.webp" 
                    alt="Prêmio Melhores ONGs 2024" 
                    className="w-10 h-10 object-contain bg-white/10 rounded p-1"
                  />
                </a>
                
                {/* Prêmio Melhores ONGs 2022 */}
                <a 
                  href="https://www.premiomelhores.org/dados-2022" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group hover:opacity-80 transition-opacity"
                  title="Prêmio Melhores ONGs 2022"
                >
                  <img 
                    src="/selos/2022-1.webp" 
                    alt="Prêmio Melhores ONGs 2022" 
                    className="w-10 h-10 object-contain bg-white/10 rounded p-1"
                  />
                </a>
                
                {/* TheDotGood Brasil 50 SGOs 2023 */}
                <a 
                  href="https://thedotgood.net/ranking/2023-brazil-50-sgos" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group hover:opacity-80 transition-opacity"
                  title="TheDotGood Brasil 50 SGOs 2023"
                >
                  <img 
                    src="/selos/official-1.webp" 
                    alt="TheDotGood Brasil 50 SGOs 2023" 
                    className="w-10 h-10 object-contain bg-white/10 rounded p-1"
                  />
                </a>
                
                {/* Prêmio Melhores ONGs 2021 */}
                <a 
                  href="https://www.premiomelhores.org/dados-2021" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group hover:opacity-80 transition-opacity"
                  title="Prêmio Melhores ONGs 2021"
                >
                  <img 
                    src="/selos/2021-1.webp" 
                    alt="Prêmio Melhores ONGs 2021" 
                    className="w-10 h-10 object-contain bg-white/10 rounded p-1"
                  />
                </a>
                
                {/* Prêmio Melhores ONGs 2020 */}
                <a 
                  href="https://www.premiomelhores.org/dados-2020" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group hover:opacity-80 transition-opacity"
                  title="Prêmio Melhores ONGs 2020"
                >
                  <img 
                    src="/selos/2020-1.webp" 
                    alt="Prêmio Melhores ONGs 2020" 
                    className="w-10 h-10 object-contain bg-white/10 rounded p-1"
                  />
                </a>
                
                {/* Prêmio Melhores ONGs 2019 */}
                <a 
                  href="https://www.premiomelhores.org/dados-2019" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group hover:opacity-80 transition-opacity"
                  title="Prêmio Melhores ONGs 2019"
                >
                  <img 
                    src="/selos/2019-1.webp" 
                    alt="Prêmio Melhores ONGs 2019" 
                    className="w-10 h-10 object-contain bg-white/10 rounded p-1"
                  />
                </a>
                
                {/* Prêmio Melhores ONGs 2018 */}
                <a 
                  href="https://www.premiomelhores.org/dados-2018" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group hover:opacity-80 transition-opacity"
                  title="Prêmio Melhores ONGs 2018"
                >
                  <img 
                    src="/selos/2018-1.webp" 
                    alt="Prêmio Melhores ONGs 2018" 
                    className="w-10 h-10 object-contain bg-white/10 rounded p-1"
                  />
                </a>
                
                {/* Prêmio Melhores ONGs 2017 */}
                <a 
                  href="https://www.premiomelhores.org/dados-2017" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group hover:opacity-80 transition-opacity"
                  title="Prêmio Melhores ONGs 2017"
                >
                  <img 
                    src="/selos/2017-1.webp" 
                    alt="Prêmio Melhores ONGs 2017" 
                    className="w-10 h-10 object-contain bg-white/10 rounded p-1"
                  />
                </a>
              </div>
              <p className="text-xs text-white/70 mt-2">
                Reconhecimento pela excelência em transparência e impacto social
              </p>
            </div>
            
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-childfund-yellow transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF size={24} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-childfund-yellow transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-childfund-yellow transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube size={24} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-childfund-yellow transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={24} />
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="font-bold text-lg mb-4">Navegação</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-white/80 hover:text-white transition-colors">Início</Link>
              </li>
              <li>
                <Link to="/about" className="text-white/80 hover:text-white transition-colors">Sobre Nós</Link>
              </li>
              <li>
                <Link to="/projects" className="text-white/80 hover:text-white transition-colors">Projetos</Link>
              </li>
              <li>
                <Link to="/stories" className="text-white/80 hover:text-white transition-colors">Histórias</Link>
              </li>
              <li>
                <Link to="/transparency" className="text-white/80 hover:text-white transition-colors">Transparência</Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/80 hover:text-white transition-colors">Blog</Link>
              </li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="font-bold text-lg mb-4">Como Ajudar</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/donate-now" className="text-white/80 hover:text-white transition-colors">Doar</Link>
              </li>
              <li>
                <Link to="/sponsor" className="text-white/80 hover:text-white transition-colors">Apadrinhar</Link>
              </li>
              <li>
                <Link to="/volunteer" className="text-white/80 hover:text-white transition-colors">Voluntariado</Link>
              </li>
              <li>
                <Link to="/corporate" className="text-white/80 hover:text-white transition-colors">Empresas</Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/80 hover:text-white transition-colors">Perguntas Frequentes</Link>
              </li>
            </ul>
          </div>
          
          <div className="lg:col-span-3">
            <h4 className="font-bold text-lg mb-4">Contato</h4>
            <ul className="space-y-3 text-white/80">
              <li>
                <a href="mailto:atendimento@childfundbrasil.org.br" className="text-white/80 hover:text-white transition-colors">atendimento@childfundbrasil.org.br</a>
              </li>
              <li className="space-y-2">
                <div>
                  <strong className="text-white">Já é padrinho ou madrinha?</strong>
                  <div>
                    <a href="tel:03003130110" className="text-white/80 hover:text-white transition-colors">0300 313 0110</a>
                  </div>
                  <div>
                    <a href="https://wa.me/5531999652936" className="text-white/80 hover:text-white transition-colors">WhatsApp (31) 9 9965-2936</a>
                  </div>
                </div>
              </li>
              <li className="space-y-2">
                <div>
                  <strong className="text-white">Quer apadrinhar/amadrinhar?</strong>
                  <div>
                    <a href="tel:03003132003" className="text-white/80 hover:text-white transition-colors">0300 313 2003</a>
                  </div>
                  <div>
                    <a href="https://wa.me/5531987935884" className="text-white/80 hover:text-white transition-colors">WhatsApp (31) 9 8793 5884</a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="border-white/20 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/80 text-sm">
            &copy; 2025 ChildFund Brasil. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-white/80 hover:text-white transition-colors text-sm">
              Política de Privacidade
            </Link>
            <Link to="/terms" className="text-white/80 hover:text-white transition-colors text-sm">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
