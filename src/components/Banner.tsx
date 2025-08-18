import { OptimizedImage } from './OptimizedImage';

interface BannerProps {
  title: string;
  subtitle?: string;
  imageSrc: string;
  imageAlt: string;
}

export function Banner({ title, subtitle, imageSrc, imageAlt }: BannerProps) {
  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Imagem de fundo */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover"
          priority={true}
        />
        {/* Gradiente para melhorar a legibilidade do texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>
      
      {/* Conteúdo do banner */}
      <div className="relative h-full container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col justify-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-roboto-slab font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight break-words hyphens-auto">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed break-words hyphens-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}