import { motion } from "framer-motion";

export default function ImpactSection() {
  const stats = [
    { value: "25", label: "Municípios protegidos" },
    { value: "12.500", label: "Famílias fortalecidas" },
    { value: "50.000", label: "Crianças e adolescentes cuidados" },
    { value: "150.000", label: "Vidas transformadas" }
  ];

  return (
    <div className="py-24 bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="container">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block p-4 bg-childfund-green/10 rounded-2xl mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-childfund-green to-childfund-green/80 rounded-xl flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-2xl">CF</span>
              </div>
            </motion.div>
            
            <h2 className="text-5xl font-bold mb-6 text-gray-800 leading-tight">
              Juntos, construímos um futuro de
              <span className="block text-childfund-green">proteção e esperança</span>
            </h2>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Somos parte de uma rede global presente em mais de 70 países, dedicada à proteção integral de crianças e adolescentes. 
              <strong className="text-childfund-green font-medium"> Nossa missão é garantir que cada criança cresça com segurança, dignidade e amor</strong>, 
              desenvolvendo todo seu potencial em um ambiente de cuidado genuíno.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-12"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Nosso compromisso em números que representam vidas transformadas
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-childfund-green to-childfund-light-green mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group-hover:border-childfund-green/20">
                    <div className="text-5xl font-bold text-childfund-green mb-3 group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 font-medium leading-tight">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-r from-blue-50 to-childfund-green/5 rounded-2xl p-8 text-center border border-blue-100"
          >
            <p className="text-sm text-gray-500 mb-3">
              *Dados referentes ao último ano de atuação
            </p>
            <p className="text-lg text-childfund-green font-medium">
              Cada número representa uma vida protegida, um direito garantido, um futuro construído com amor.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
