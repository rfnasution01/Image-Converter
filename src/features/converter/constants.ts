import type { FormatOption } from './types';

export const supportedInputTypes: readonly string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export const supportedInputExtensions: readonly string[] = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

export const formatOptions: FormatOption[] = [
  { label: 'JPG', value: 'image/jpeg', extension: 'jpg', description: 'Best for photos' },
  { label: 'PNG', value: 'image/png', extension: 'png', description: 'Best for transparency' },
  { label: 'WebP', value: 'image/webp', extension: 'webp', description: 'Small file size' },
  { label: 'AVIF', value: 'image/avif', extension: 'avif', description: 'Modern high compression' },
];

export const defaultConversionQuality = 0.92;
