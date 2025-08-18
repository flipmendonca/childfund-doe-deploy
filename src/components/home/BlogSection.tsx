
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "Como o apadrinhamento transforma vidas",
    excerpt: "Descubra como uma simples ação pode gerar impactos duradouros na vida de uma criança.",
    date: "15 de Janeiro, 2024",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=400&q=80",
    category: "Apadrinhamento",
    author: "Maria Silva"
  },
  {
    id: 2,
    title: "Educação: a base para um futuro melhor",
    excerpt: "Veja como nossos programas educacionais estão criando oportunidades para milhares de crianças.",
    date: "10 de Janeiro, 2024",
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=400&q=80",
    category: "Educação",
    author: "João Santos"
  },
  {
    id: 3,
    title: "Comunidades fortalecidas, futuro garantido",
    excerpt: "Conheça as iniciativas que estão transformando comunidades inteiras através do desenvolvimento social.",
    date: "5 de Janeiro, 2024",
    image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=400&q=80",
    category: "Desenvolvimento",
    author: "Ana Costa"
  }
];

export default function BlogSection() {
  return (
    <div className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-childfund-green/10 rounded-full mb-6">
            <span className="text-childfund-green font-medium text-sm">📰 Blog</span>
          </div>
          
          <h2 className="text-5xl font-bold mb-6 text-gray-800">
            Últimas <span className="text-childfund-green">notícias</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Por aqui, você acompanha tudo que acontece no ChildFund! Histórias inspiradoras, 
            novidades dos nossos projetos e muito mais.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link to={`/blog/${post.id}`}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="relative overflow-hidden">
                    <img 
                      src={post.image}
                      alt={post.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/95 backdrop-blur-sm text-childfund-green px-3 py-1 rounded-full text-sm font-medium shadow-md">
                        {post.category}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                      <Calendar size={14} />
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.author}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 group-hover:text-childfund-green transition-colors duration-300 leading-tight">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center text-childfund-green font-medium group-hover:translate-x-2 transition-transform duration-300">
                      <span>Ler mais</span>
                      <span className="ml-2">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Link to="/blog">
            <Button 
              variant="outline" 
              className="border-2 border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white px-10 py-4 text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              Ver todas as notícias
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
