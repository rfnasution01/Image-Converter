import { describe, expect, it } from 'vitest';

import { calculateOutputDimensions } from './image-conversion';
import { getBaseName, getUniqueFileName } from './utils';
import type { ConversionSettings } from './types';

const baseSettings: ConversionSettings = {
  outputFormat: 'image/webp',
  quality: 0.9,
  resizeMode: 'original',
  keepAspectRatio: true,
};

describe('calculateOutputDimensions', () => {
  it('preserves original dimensions', () => {
    expect(calculateOutputDimensions(1600, 900, baseSettings)).toEqual({ width: 1600, height: 900 });
  });

  it('resizes by percentage', () => {
    expect(calculateOutputDimensions(1600, 900, { ...baseSettings, resizeMode: 'percentage', percentage: 50 }))
      .toEqual({ width: 800, height: 450 });
  });

  it('preserves aspect ratio for a custom width', () => {
    expect(calculateOutputDimensions(1600, 900, { ...baseSettings, resizeMode: 'dimensions', width: 800 }))
      .toEqual({ width: 800, height: 450 });
  });

  it('rejects unsafe canvas sizes', () => {
    expect(() => calculateOutputDimensions(10000, 10000, baseSettings)).toThrow('Output dimensions are too large');
  });
});

describe('output file names', () => {
  it('removes only the final extension', () => {
    expect(getBaseName('holiday.photo.jpg')).toBe('holiday.photo');
  });

  it('makes duplicate names unique', () => {
    const names = new Set<string>();
    expect(getUniqueFileName('image.webp', names)).toBe('image.webp');
    expect(getUniqueFileName('image.webp', names)).toBe('image-2.webp');
    expect(getUniqueFileName('image.webp', names)).toBe('image-3.webp');
  });
});
