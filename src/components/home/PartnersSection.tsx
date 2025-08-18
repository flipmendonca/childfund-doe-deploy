// @ts-nocheck
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

const partners = [
  { name: "Partner 1", logo: "https://via.placeholder.com/150x60/2C9B44/FFFFFF?text=Partner+1" },
  { name: "Partner 2", logo: "https://via.placeholder.com/150x60/2C9B44/FFFFFF?text=Partner+2" },
  { name: "Partner 3", logo: "https://via.placeholder.com/150x60/2C9B44/FFFFFF?text=Partner+3" },
  { name: "Partner 4", logo: "https://via.placeholder.com/150x60/2C9B44/FFFFFF?text=Partner+4" },
  { name: "Partner 5", logo: "https://via.placeholder.com/150x60/2C9B44/FFFFFF?text=Partner+5" },
  { name: "Partner 6", logo: "https://via.placeholder.com/150x60/2C9B44/FFFFFF?text=Partner+6" },
];

export default function PartnersSection() {
  return (
    <div className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Veja quem já é parceiro do ChildFund Brasil</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent>
              {partners.map((partner, index) => (
                <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4">
                  <div className="p-4">
                    <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center h-24 hover:shadow-md transition-all">
                      <img 
                        src={partner.logo}
                        alt={partner.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </motion.div>
      </div>
    </div>
  );
}
