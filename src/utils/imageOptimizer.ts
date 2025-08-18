import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

interface OptimizeImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'avif';
}

export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: OptimizeImageOptions = {}
) {
  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options;

  try {
    // Garante que o diretório de saída existe
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Carrega a imagem
    let pipeline = sharp(inputPath);

    // Redimensiona se necessário
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'cover',
        position: 'center'
      });
    }

    // Otimiza e converte para o formato desejado
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality });
        break;
      default:
        pipeline = pipeline.jpeg({ quality });
    }

    // Salva a imagem otimizada
    await pipeline.toFile(outputPath);

    return {
      success: true,
      path: outputPath
    };
  } catch (error) {
    console.error('Erro ao otimizar imagem:', error);
    return {
      success: false,
      error
    };
  }
}

// Função para gerar diferentes tamanhos de uma imagem
export async function generateResponsiveImages(
  inputPath: string,
  outputDir: string,
  sizes: number[] = [320, 640, 960, 1280, 1920]
) {
  const results = [];

  for (const size of sizes) {
    const outputPath = path.join(
      outputDir,
      `${path.basename(inputPath, path.extname(inputPath))}-${size}.webp`
    );

    const result = await optimizeImage(inputPath, outputPath, {
      width: size,
      format: 'webp'
    });

    if (result.success) {
      results.push({
        size,
        path: result.path
      });
    }
  }

  return results;
}

// Função para otimizar uma imagem para uso em banner
export async function optimizeBannerImage(
  inputPath: string,
  outputDir: string
) {
  const sizes = [
    { width: 320, height: 180 },  // Mobile
    { width: 640, height: 360 },  // Tablet
    { width: 1280, height: 720 }, // Desktop
    { width: 1920, height: 1080 } // Large screens
  ];

  const results = [];

  for (const size of sizes) {
    const outputPath = path.join(
      outputDir,
      `${path.basename(inputPath, path.extname(inputPath))}-${size.width}x${size.height}.webp`
    );

    const result = await optimizeImage(inputPath, outputPath, {
      width: size.width,
      height: size.height,
      format: 'webp'
    });

    if (result.success) {
      results.push({
        size,
        path: result.path
      });
    }
  }

  return results;
} 