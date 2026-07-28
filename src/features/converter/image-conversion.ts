import type { ConversionSettings } from './types';

type LoadedImage = {
  element: HTMLImageElement;
  width: number;
  height: number;
};

export type ConversionResult = {
  blob: Blob;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
};

export const maxCanvasDimension = 8192;
export const maxCanvasPixels = 40_000_000;

function loadImage(url: string) {
  return new Promise<LoadedImage>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ element: image, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('Unable to read this image.'));
    image.src = url;
  });
}

function isHeicFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return file.type === 'image/heic' || file.type === 'image/heif' || extension === 'heic' || extension === 'heif';
}

async function createLoadableImageUrl(file: File, fallbackUrl: string) {
  if (!isHeicFile(file)) return { url: fallbackUrl, shouldRevoke: false };

  const heic2any = (await import('heic2any')).default;
  const converted = await heic2any({ blob: file, toType: 'image/png' });
  const convertedBlob = Array.isArray(converted) ? converted[0] : converted;

  if (!convertedBlob) {
    throw new Error('Unable to decode this HEIC image in your browser. Try converting it on another device or use JPG/PNG/WebP.');
  }

  return { url: URL.createObjectURL(convertedBlob), shouldRevoke: true };
}

function getCanvasQuality(settings: ConversionSettings) {
  return settings.outputFormat === 'image/png' ? undefined : settings.quality;
}

function roundDimension(value: number) {
  return Math.max(1, Math.round(value));
}

function validateCanvasSize(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    throw new Error('Output dimensions must be greater than 0.');
  }

  if (width > maxCanvasDimension || height > maxCanvasDimension || width * height > maxCanvasPixels) {
    throw new Error(`Output dimensions are too large. Use up to ${maxCanvasDimension}px per side and keep total pixels below 40MP.`);
  }
}

export function calculateOutputDimensions(originalWidth: number, originalHeight: number, settings: ConversionSettings) {
  const aspectRatio = originalWidth / originalHeight;
  let outputWidth = originalWidth;
  let outputHeight = originalHeight;

  if (settings.resizeMode === 'percentage') {
    const percentage = settings.percentage ?? 100;
    outputWidth = roundDimension(originalWidth * (percentage / 100));
    outputHeight = roundDimension(originalHeight * (percentage / 100));
  }

  if (settings.resizeMode === 'max-width') {
    const maxWidth = settings.width ?? originalWidth;
    if (originalWidth > maxWidth) {
      outputWidth = roundDimension(maxWidth);
      outputHeight = roundDimension(maxWidth / aspectRatio);
    }
  }

  if (settings.resizeMode === 'max-height') {
    const maxHeight = settings.height ?? originalHeight;
    if (originalHeight > maxHeight) {
      outputHeight = roundDimension(maxHeight);
      outputWidth = roundDimension(maxHeight * aspectRatio);
    }
  }

  if (settings.resizeMode === 'dimensions') {
    const targetWidth = settings.width;
    const targetHeight = settings.height;

    if (settings.keepAspectRatio) {
      if (targetWidth) {
        outputWidth = roundDimension(targetWidth);
        outputHeight = roundDimension(targetWidth / aspectRatio);
      } else if (targetHeight) {
        outputHeight = roundDimension(targetHeight);
        outputWidth = roundDimension(targetHeight * aspectRatio);
      }
    } else {
      outputWidth = roundDimension(targetWidth ?? originalWidth);
      outputHeight = roundDimension(targetHeight ?? originalHeight);
    }
  }

  validateCanvasSize(outputWidth, outputHeight);
  return { width: outputWidth, height: outputHeight };
}

export async function convertWithCanvas(file: File, originalUrl: string, settings: ConversionSettings): Promise<ConversionResult> {
  const loadableImage = await createLoadableImageUrl(file, originalUrl);

  try {
    const image = await loadImage(loadableImage.url);
    const outputDimensions = calculateOutputDimensions(image.width, image.height, settings);
    const canvas = document.createElement('canvas');
    canvas.width = outputDimensions.width;
    canvas.height = outputDimensions.height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser does not support image conversion. Please try Chrome, Edge, or Firefox.');

    if (settings.outputFormat === 'image/jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.drawImage(image.element, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (convertedBlob) => {
          if (!convertedBlob) {
            reject(new Error(`Unable to convert ${file.name}.`));
            return;
          }
          resolve(convertedBlob);
        },
        settings.outputFormat,
        getCanvasQuality(settings),
      );
    });

    return {
      blob,
      originalWidth: image.width,
      originalHeight: image.height,
      outputWidth: outputDimensions.width,
      outputHeight: outputDimensions.height,
    };
  } finally {
    if (loadableImage.shouldRevoke) URL.revokeObjectURL(loadableImage.url);
  }
}
