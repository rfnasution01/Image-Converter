import { formatOptions, supportedInputExtensions, supportedInputTypes } from './constants';
import type { ImageItem, OutputFormat } from './types';

export function getBaseName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '');
}

export function getFormatMeta(format: OutputFormat) {
  return formatOptions.find((option) => option.value === format) ?? formatOptions[2];
}

export function isSupportedInputFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return supportedInputTypes.includes(file.type) || Boolean(extension && supportedInputExtensions.includes(extension));
}

export async function supportsCanvasOutputFormat(format: OutputFormat) {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return new Promise<boolean>((resolve) => {
    canvas.toBlob((blob) => resolve(blob?.type === format), format);
  });
}

export function getUniqueFileName(fileName: string, usedFileNames: Set<string>) {
  if (!usedFileNames.has(fileName)) {
    usedFileNames.add(fileName);
    return fileName;
  }

  const extensionMatch = fileName.match(/(\.[^.]*)$/);
  const extension = extensionMatch?.[0] ?? '';
  const baseName = extension ? fileName.slice(0, -extension.length) : fileName;
  let counter = 2;
  let uniqueFileName = `${baseName}-${counter}${extension}`;

  while (usedFileNames.has(uniqueFileName)) {
    counter += 1;
    uniqueFileName = `${baseName}-${counter}${extension}`;
  }

  usedFileNames.add(uniqueFileName);
  return uniqueFileName;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function releaseImageUrls(items: ImageItem[]) {
  items.forEach((item) => {
    URL.revokeObjectURL(item.originalUrl);
    if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
  });
}

export function releaseConvertedImageUrls(items: ImageItem[]) {
  items.forEach((item) => {
    if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
  });
}
