export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

export type ResizeMode = 'original' | 'percentage' | 'dimensions' | 'max-width' | 'max-height';

export type ConversionSettings = {
  outputFormat: OutputFormat;
  quality: number;
  resizeMode: ResizeMode;
  width?: number;
  height?: number;
  percentage?: number;
  keepAspectRatio: boolean;
};

export type ConversionStatus = 'idle' | 'queued' | 'processing' | 'done' | 'error';

export type ImageItem = {
  id: string;
  file: File;
  originalUrl: string;
  originalWidth?: number;
  originalHeight?: number;
  convertedUrl?: string;
  convertedBlob?: Blob;
  outputWidth?: number;
  outputHeight?: number;
  status: ConversionStatus;
  error?: string;
};

export type FormatOption = {
  label: string;
  value: OutputFormat;
  extension: string;
  description: string;
};

export type ConversionProgress = {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  currentFileName?: string;
};
