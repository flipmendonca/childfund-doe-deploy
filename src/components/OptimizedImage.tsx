import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  sizes = '100vw',
  priority = false
}: OptimizedImageProps) {
  // Verifica se é uma URL externa
  const isExternalUrl = src.startsWith('http');
  
  if (isExternalUrl) {
    // Para URLs externas, usa a imagem diretamente
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
      />
    );
  }

  // Para imagens locais, usa o componente picture com versões otimizadas
  const baseSrc = src.replace(/\.[^/.]+$/, '');
  
  return (
    <picture>
      {/* Imagens otimizadas para diferentes tamanhos de tela */}
      <source
        media="(min-width: 1920px)"
        srcSet={`${baseSrc}-1920x1080.webp`}
        type="image/webp"
      />
      <source
        media="(min-width: 1280px)"
        srcSet={`${baseSrc}-1280x720.webp`}
        type="image/webp"
      />
      <source
        media="(min-width: 640px)"
        srcSet={`${baseSrc}-640x360.webp`}
        type="image/webp"
      />
      <source
        srcSet={`${baseSrc}-320x180.webp`}
        type="image/webp"
      />
      
      {/* Fallback para navegadores que não suportam WebP */}
      <img
        src={src}
        alt={alt}
        className={className}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
      />
    </picture>
  );
} 