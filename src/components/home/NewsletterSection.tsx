
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function NewsletterSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    acceptPrivacy: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptPrivacy) {
      toast({
        title: "Erro",
        description: "É necessário aceitar a Política de Privacidade.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simular envio
    setTimeout(() => {
      toast({
        title: "Sucesso!",
        description: "Cadastro realizado com sucesso. Você receberá nossas newsletters em breve.",
      });
      setFormData({ name: "", email: "", acceptPrivacy: false });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="py-20 bg-gray-50">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl font-bold mb-4">Newsletter</h2>
            <p className="text-gray-600">
              Receba em primeira mão as novidades e histórias inspiradoras do ChildFund Brasil.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nome *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={formData.acceptPrivacy}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, acceptPrivacy: checked as boolean })
                  }
                  className="mt-1"
                />
                <label htmlFor="privacy" className="text-sm text-gray-600 leading-relaxed">
                  Aceito a Política de Privacidade e autorizo o uso dos meus dados para receber newsletters e comunicações do ChildFund.*
                  <br />
                  <a href="/privacy-policy" className="text-primary hover:underline">
                    Acesse aqui nossa Política de Privacidade.
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white py-3 text-lg rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Cadastrando..." : "CADASTRAR"}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
