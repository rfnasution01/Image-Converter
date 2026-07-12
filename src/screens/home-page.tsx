'use client';

import JSZip from 'jszip';
import { CheckCircle2, CircleHelp, Download, FileArchive, ImageIcon, ShieldCheck, Trash2, UploadCloud } from 'lucide-react';
import { ChangeEvent, DragEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { defaultConversionQuality, formatOptions } from '@/features/converter/constants';
import { convertWithCanvas } from '@/features/converter/image-conversion';
import type { ConversionProgress, ConversionSettings, ImageItem, OutputFormat, ResizeMode } from '@/features/converter/types';
import { downloadBlob, formatFileSize, getBaseName, getFormatMeta, getUniqueFileName, isSupportedInputFile, releaseConvertedImageUrls, releaseImageUrls, supportsCanvasOutputFormat } from '@/features/converter/utils';
import { cn } from '@/lib/utils';

const steps = [
  { title: 'Upload images', description: 'Drop JPG, PNG, WebP, or HEIC/HEIF files into the upload area.' },
  { title: 'Choose format', description: 'Select one output format for all uploaded images.' },
  { title: 'Download', description: 'Download a single image or a ZIP for multiple files.' },
];

const faqs = [
  {
    question: 'Can I use FileFlow as a JPG to PNG converter?',
    answer: 'Yes. Upload one or more JPG images, choose PNG as the output format, and download the converted PNG files individually or as a ZIP.',
  },
  {
    question: 'Can FileFlow convert PNG to WebP for smaller website images?',
    answer: 'Yes. Choose WebP output, adjust quality if needed, and FileFlow will convert PNG files locally in your browser for lighter web-friendly images.',
  },
  {
    question: 'Can I convert WebP to JPG?',
    answer: 'Yes. FileFlow supports WebP to JPG conversion for compatibility with tools, forms, and platforms that do not accept WebP files.',
  },
  {
    question: 'Are my files uploaded?',
    answer: 'No. FileFlow converts images locally in your browser with the Canvas API, so selected files are not uploaded to our server.',
  },
  {
    question: 'Is image metadata removed?',
    answer: 'Canvas conversion usually strips most embedded metadata, including many EXIF fields. Browser behavior can vary, so avoid treating it as a guaranteed forensic metadata cleaner.',
  },
  {
    question: 'Which formats are supported?',
    answer: 'You can upload JPG, PNG, WebP, or HEIC/HEIF images and export them as JPG, PNG, WebP, or AVIF when your browser supports AVIF encoding. Batch downloads are packaged as a ZIP file.',
  },
];

const onboardingStorageKey = 'fileflow-onboarding-completed';
const maxResizeDimension = 12000;
const maxResizePercentage = 500;
const conversionConcurrencyLimit = 3;

const onboardingSteps = [
  {
    selector: '#tour-upload',
    title: '1. Upload images',
    description: 'Click this upload area or drag and drop your images here. You can select multiple JPG, PNG, WebP, or HEIC/HEIF files at once.',
  },
  {
    selector: '#tour-format',
    title: '2. Choose an output format',
    description: 'Select the image format you want to convert to. This format will be applied to every uploaded image.',
  },
  {
    selector: '#tour-download',
    title: '3. Download converted files',
    description: 'When conversion is complete, your results will appear here. Download a single image or a ZIP file for multiple images.',
  },
];

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type SizeChangeStats = {
  percentage: number;
  isSmaller: boolean;
  isSameSize: boolean;
};

function getSizeChangeStats(originalSize: number, convertedSize: number): SizeChangeStats {
  if (originalSize <= 0) {
    return { percentage: 0, isSmaller: false, isSameSize: convertedSize === originalSize };
  }

  const difference = originalSize - convertedSize;

  return {
    percentage: Math.round((Math.abs(difference) / originalSize) * 100),
    isSmaller: difference > 0,
    isSameSize: difference === 0,
  };
}

function getSizeChangeLabel(originalSize: number, convertedSize: number) {
  const stats = getSizeChangeStats(originalSize, convertedSize);

  if (stats.isSameSize) return 'Same size';
  return stats.isSmaller ? `Saved ${stats.percentage}%` : `Size increased ${stats.percentage}%`;
}

function getSizeDifferenceLabel(originalSize: number, convertedSize: number) {
  const difference = originalSize - convertedSize;

  if (difference === 0) return 'No size change';
  return difference > 0 ? `${formatFileSize(difference)} saved` : `${formatFileSize(Math.abs(difference))} larger`;
}

export function HomePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/webp');
  const [isAvifSupported, setIsAvifSupported] = useState(false);
  const [hasCheckedAvifSupport, setHasCheckedAvifSupport] = useState(false);
  const [quality, setQuality] = useState(defaultConversionQuality);
  const [resizeMode, setResizeMode] = useState<ResizeMode>('original');
  const [resizePercentage, setResizePercentage] = useState('100');
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress | null>(null);
  const imagesRef = useRef<ImageItem[]>([]);
  const previousSettingsKeyRef = useRef('');
  const conversionRunIdRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingStepIndex, setOnboardingStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);

  const completedImages = useMemo(() => images.filter((image) => image.convertedBlob), [images]);
  const selectedFormat = getFormatMeta(outputFormat);
  const isProcessing = images.some((image) => image.status === 'queued' || image.status === 'processing');
  const supportsQuality = outputFormat === 'image/jpeg' || outputFormat === 'image/webp' || outputFormat === 'image/avif';
  const qualityPercentage = Math.round(quality * 100);
  const progressPercentage = conversionProgress?.totalFiles ? Math.round(((conversionProgress.completedFiles + conversionProgress.failedFiles) / conversionProgress.totalFiles) * 100) : 0;
  const batchSizeStats = useMemo(() => {
    const totalOriginalSize = completedImages.reduce((total, image) => total + image.file.size, 0);
    const totalConvertedSize = completedImages.reduce((total, image) => total + (image.convertedBlob?.size ?? 0), 0);
    const sizeChange = getSizeChangeStats(totalOriginalSize, totalConvertedSize);

    return {
      totalOriginalSize,
      totalConvertedSize,
      ...sizeChange,
    };
  }, [completedImages]);

  const conversionSettings = useMemo<ConversionSettings>(() => {
    const width = resizeWidth === '' ? undefined : Number(resizeWidth);
    const height = resizeHeight === '' ? undefined : Number(resizeHeight);
    const percentage = resizePercentage === '' ? undefined : Number(resizePercentage);

    return {
      outputFormat,
      quality,
      resizeMode,
      width,
      height,
      percentage,
      keepAspectRatio,
    };
  }, [keepAspectRatio, outputFormat, quality, resizeHeight, resizeMode, resizePercentage, resizeWidth]);

  const resizeError = useMemo(() => {
    const isInvalidDimension = (value: number | undefined) => value !== undefined && (!Number.isFinite(value) || value <= 0 || value > maxResizeDimension);

    if (conversionSettings.resizeMode === 'percentage') {
      if (!conversionSettings.percentage || conversionSettings.percentage <= 0 || conversionSettings.percentage > maxResizePercentage) {
        return `Percentage must be between 1 and ${maxResizePercentage}.`;
      }
    }

    if (conversionSettings.resizeMode === 'max-width' && (!conversionSettings.width || isInvalidDimension(conversionSettings.width))) {
      return `Max width must be between 1 and ${maxResizeDimension}px.`;
    }

    if (conversionSettings.resizeMode === 'max-height' && (!conversionSettings.height || isInvalidDimension(conversionSettings.height))) {
      return `Max height must be between 1 and ${maxResizeDimension}px.`;
    }

    if (conversionSettings.resizeMode === 'dimensions') {
      if (conversionSettings.keepAspectRatio) {
        if (isInvalidDimension(conversionSettings.width) || isInvalidDimension(conversionSettings.height) || (!conversionSettings.width && !conversionSettings.height)) {
          return `Enter a width or height between 1 and ${maxResizeDimension}px.`;
        }
      } else if (isInvalidDimension(conversionSettings.width) || isInvalidDimension(conversionSettings.height) || !conversionSettings.width || !conversionSettings.height) {
        return `Enter width and height between 1 and ${maxResizeDimension}px.`;
      }
    }

    return null;
  }, [conversionSettings]);

  const settingsKey = useMemo(() => JSON.stringify(conversionSettings), [conversionSettings]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      releaseImageUrls(imagesRef.current);
    };
  }, []);

  useEffect(() => {
    if (localStorage.getItem(onboardingStorageKey) !== 'true') {
      setIsOnboardingOpen(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void supportsCanvasOutputFormat('image/avif').then((isSupported) => {
      if (!isMounted) return;
      setIsAvifSupported(isSupported);
      setHasCheckedAvifSupport(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSpotlight = useCallback(() => {
    const currentStep = onboardingSteps[onboardingStepIndex];
    const target = document.querySelector<HTMLElement>(currentStep.selector);

    if (!target) {
      setSpotlightRect(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    const padding = 10;
    const viewportPadding = 8;
    const top = Math.max(rect.top - padding, viewportPadding);
    const left = Math.max(rect.left - padding, viewportPadding);

    setSpotlightRect({
      top,
      left,
      width: Math.max(0, Math.min(rect.width + padding * 2, window.innerWidth - left - viewportPadding)),
      height: Math.max(0, Math.min(rect.height + padding * 2, window.innerHeight - top - viewportPadding)),
    });
  }, [onboardingStepIndex]);

  useEffect(() => {
    if (!isOnboardingOpen) return;

    const currentStep = onboardingSteps[onboardingStepIndex];
    const target = document.querySelector<HTMLElement>(currentStep.selector);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    const timeout = window.setTimeout(updateSpotlight, 350);
    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight, true);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight, true);
    };
  }, [isOnboardingOpen, onboardingStepIndex, updateSpotlight]);

  const openOnboardingFromStart = () => {
    setOnboardingStepIndex(0);
    setIsOnboardingOpen(true);
  };

  const closeOnboarding = () => {
    localStorage.setItem(onboardingStorageKey, 'true');
    setIsOnboardingOpen(false);
  };

  const goToPreviousOnboardingStep = () => {
    setOnboardingStepIndex((stepIndex) => Math.max(stepIndex - 1, 0));
  };

  const goToNextOnboardingStep = () => {
    setOnboardingStepIndex((stepIndex) => Math.min(stepIndex + 1, onboardingSteps.length - 1));
  };

  const convertItems = useCallback(async (items: ImageItem[], settings: ConversionSettings) => {
    const runId = conversionRunIdRef.current + 1;
    conversionRunIdRef.current = runId;

    releaseConvertedImageUrls(items);
    setImages(items.map((item) => ({ ...item, status: 'queued', convertedBlob: undefined, convertedUrl: undefined, error: undefined })));
    setConversionProgress({ totalFiles: items.length, completedFiles: 0, failedFiles: 0, currentFileName: items[0]?.file.name });

    let nextIndex = 0;

    const processNextItem = async () => {
      while (nextIndex < items.length && conversionRunIdRef.current === runId) {
        const item = items[nextIndex];
        nextIndex += 1;

        setImages((currentItems) => currentItems.map((currentItem) => (currentItem.id === item.id ? { ...currentItem, status: 'processing', error: undefined } : currentItem)));
        setConversionProgress((progress) => (progress && conversionRunIdRef.current === runId ? { ...progress, currentFileName: item.file.name } : progress));

        let convertedItem: ImageItem;

        try {
          const result = await convertWithCanvas(item.file, item.originalUrl, settings);
          convertedItem = {
            ...item,
            originalWidth: result.originalWidth,
            originalHeight: result.originalHeight,
            convertedBlob: result.blob,
            convertedUrl: URL.createObjectURL(result.blob),
            outputWidth: result.outputWidth,
            outputHeight: result.outputHeight,
            status: 'done',
          };
        } catch (error) {
          convertedItem = {
            ...item,
            convertedBlob: undefined,
            convertedUrl: undefined,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unable to convert this image.',
          };
        }

        if (conversionRunIdRef.current !== runId) {
          releaseConvertedImageUrls([convertedItem]);
          return;
        }

        setImages((currentItems) => {
          const isItemStillPresent = currentItems.some((currentItem) => currentItem.id === item.id);
          if (!isItemStillPresent) {
            releaseConvertedImageUrls([convertedItem]);
            return currentItems;
          }

          return currentItems.map((currentItem) => (currentItem.id === item.id ? convertedItem : currentItem));
        });
        setConversionProgress((progress) => {
          if (!progress || conversionRunIdRef.current !== runId) return progress;

          return {
            ...progress,
            completedFiles: progress.completedFiles + (convertedItem.status === 'done' ? 1 : 0),
            failedFiles: progress.failedFiles + (convertedItem.status === 'error' ? 1 : 0),
          };
        });
      }
    };

    const workers = Array.from({ length: Math.min(conversionConcurrencyLimit, items.length) }, () => processNextItem());
    await Promise.all(workers);

    if (conversionRunIdRef.current === runId) {
      setConversionProgress((progress) => (progress ? { ...progress, currentFileName: undefined } : progress));
    }
  }, []);

  const handleFileUpload = (files: FileList | File[]) => {
    const incomingFiles = Array.from(files);
    const validFiles = incomingFiles.filter(isSupportedInputFile);

    if (validFiles.length === 0) {
      setUploadError('Please upload JPG, PNG, WebP, or HEIC/HEIF images. Other file types are not supported yet.');
      return;
    }

    setUploadError(incomingFiles.length !== validFiles.length ? 'Some files were skipped because only JPG, PNG, WebP, and HEIC/HEIF images are supported. HEIC conversion may vary by browser/device.' : null);

    const uploadedItems: ImageItem[] = validFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      originalUrl: URL.createObjectURL(file),
      status: 'idle',
    }));
    const nextItems = [...imagesRef.current, ...uploadedItems];

    if (resizeError) {
      setConversionProgress(null);
      setImages(nextItems);
      return;
    }

    void convertItems(nextItems, conversionSettings);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) handleFileUpload(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileUpload(event.dataTransfer.files);
  };

  const handleUploadKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleFormatKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

    const enabledOptions = formatOptions.filter((option) => option.value !== 'image/avif' || isAvifSupported);
    const currentIndex = enabledOptions.findIndex((option) => option.value === outputFormat);
    if (currentIndex === -1) return;

    event.preventDefault();

    const nextIndex = (() => {
      if (event.key === 'Home') return 0;
      if (event.key === 'End') return enabledOptions.length - 1;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') return (currentIndex + 1) % enabledOptions.length;
      return (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
    })();

    const nextFormat = enabledOptions[nextIndex]?.value;
    if (nextFormat) setOutputFormat(nextFormat);
  };

  const handleFormatChange = (format: OutputFormat) => {
    if (format === 'image/avif' && !isAvifSupported) return;
    setOutputFormat(format);
  };

  const handleQualityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuality(Number(event.target.value) / 100);
  };

  useEffect(() => {
    if (previousSettingsKeyRef.current === settingsKey) return;
    previousSettingsKeyRef.current = settingsKey;

    if (resizeError || imagesRef.current.length === 0) return;

    const timeout = window.setTimeout(() => {
      void convertItems(imagesRef.current, conversionSettings);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [conversionSettings, convertItems, resizeError, settingsKey]);

  const removeImage = (imageId: string) => {
    const imageToRemove = imagesRef.current.find((image) => image.id === imageId);
    if (!imageToRemove) return;

    releaseImageUrls([imageToRemove]);
    setImages((currentItems) => currentItems.filter((image) => image.id !== imageId));
  };

  const clearImages = () => {
    conversionRunIdRef.current += 1;
    releaseImageUrls(images);
    setImages([]);
    setConversionProgress(null);
    setUploadError(null);
  };

  const downloadSingle = (image: ImageItem) => {
    if (!image.convertedBlob) return;
    downloadBlob(image.convertedBlob, `${getBaseName(image.file.name)}.${selectedFormat.extension}`);
  };

  const downloadZipWithJSZip = async () => {
    if (completedImages.length === 0) return;
    setIsZipping(true);
    const zip = new JSZip();

    const usedFileNames = new Set<string>();

    completedImages.forEach((image) => {
      if (image.convertedBlob) {
        const fileName = getUniqueFileName(`${getBaseName(image.file.name)}.${selectedFormat.extension}`, usedFileNames);
        zip.file(fileName, image.convertedBlob);
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `fileflow-images-${selectedFormat.extension}.zip`);
    setIsZipping(false);
  };

  const handlePrimaryDownload = async () => {
    if (completedImages.length === 1) {
      downloadSingle(completedImages[0]);
      return;
    }

    await downloadZipWithJSZip();
  };

  const primaryButtonLabel = (() => {
    if (images.length === 0) return 'Upload images first';
    if (isProcessing) return 'Converting...';
    if (isZipping) return 'Preparing ZIP...';
    if (completedImages.length > 1) return 'Download ZIP';
    return 'Download image';
  })();

  const liveStatusMessage = (() => {
    if (uploadError) return uploadError;
    if (resizeError) return resizeError;
    if (isZipping) return 'Preparing ZIP download.';
    if (conversionProgress && images.length > 0) {
      const processedFiles = conversionProgress.completedFiles + conversionProgress.failedFiles;
      if (isProcessing && conversionProgress.currentFileName) {
        return `Converting ${conversionProgress.currentFileName}. ${processedFiles} of ${conversionProgress.totalFiles} files processed.`;
      }
      if (conversionProgress.failedFiles > 0) {
        return `Conversion finished with ${conversionProgress.failedFiles} failed file(s). ${conversionProgress.completedFiles} completed.`;
      }
      return `Conversion complete. ${conversionProgress.completedFiles} of ${conversionProgress.totalFiles} files converted.`;
    }
    if (completedImages.length > 0) return `${completedImages.length} converted image(s) ready to download.`;
    if (images.length === 0) return 'No images uploaded yet.';
    return 'Images are waiting for valid settings.';
  })();

  const currentOnboardingStep = onboardingSteps[onboardingStepIndex];
  const isFirstOnboardingStep = onboardingStepIndex === 0;
  const isLastOnboardingStep = onboardingStepIndex === onboardingSteps.length - 1;
  const viewportWidth = typeof window === 'undefined' ? 1024 : window.innerWidth;
  const viewportHeight = typeof window === 'undefined' ? 768 : window.innerHeight;
  const onboardingCardWidth = Math.min(360, viewportWidth - 32);
  const onboardingCardTop = spotlightRect ? Math.min(spotlightRect.top + spotlightRect.height + 16, viewportHeight - 260) : 120;
  const onboardingCardLeft = spotlightRect ? Math.min(Math.max(spotlightRect.left, 16), viewportWidth - onboardingCardWidth - 16) : 16;

  return (
    <div className="relative isolate overflow-hidden bg-background text-foreground">
      {isOnboardingOpen ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
          {spotlightRect ? (
            <>
              <div className="fixed left-0 top-0 bg-slate-950/70 backdrop-blur-[1px]" style={{ right: 0, height: spotlightRect.top }} />
              <div className="fixed left-0 bg-slate-950/70 backdrop-blur-[1px]" style={{ top: spotlightRect.top, width: spotlightRect.left, height: spotlightRect.height }} />
              <div className="fixed bg-slate-950/70 backdrop-blur-[1px]" style={{ top: spotlightRect.top, left: spotlightRect.left + spotlightRect.width, right: 0, height: spotlightRect.height }} />
              <div className="fixed bottom-0 left-0 bg-slate-950/70 backdrop-blur-[1px]" style={{ right: 0, top: spotlightRect.top + spotlightRect.height }} />
              <div
                className="pointer-events-none fixed rounded-[2rem] border-2 border-primary shadow-[0_0_0_7px_rgba(99,91,255,0.22),0_22px_70px_rgba(99,91,255,0.36)]"
                style={spotlightRect}
              />
            </>
          ) : (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-[1px]" />
          )}

          <div
            className="fixed rounded-[1.75rem] border border-border bg-card p-5 shadow-[0_28px_90px_rgba(16,14,50,0.28)]"
            style={{ top: Math.max(onboardingCardTop, 16), left: onboardingCardLeft, width: onboardingCardWidth }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
                Step {onboardingStepIndex + 1} of {onboardingSteps.length}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={closeOnboarding} className="h-8 rounded-full px-3 text-muted-foreground hover:text-foreground">
                Close
              </Button>
            </div>
            <h2 id="onboarding-title" className="font-heading text-xl font-black tracking-tight text-foreground">
              {currentOnboardingStep.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{currentOnboardingStep.description}</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <Button type="button" variant="ghost" onClick={goToPreviousOnboardingStep} disabled={isFirstOnboardingStep} className="rounded-xl">
                Prev
              </Button>
              {isLastOnboardingStep ? (
                <Button type="button" onClick={closeOnboarding} className="rounded-full bg-primary px-6 font-bold shadow-[0_14px_35px_rgba(99,91,255,0.28)] hover:bg-primary/90">
                  Got it
                </Button>
              ) : (
                <Button type="button" onClick={goToNextOnboardingStep} className="rounded-full bg-primary px-6 font-bold shadow-[0_14px_35px_rgba(99,91,255,0.28)] hover:bg-primary/90">
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveStatusMessage}
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_12%,rgba(99,91,255,0.14),transparent_30%)]" />
      <img src="/assets/design-system/ellipse-glow.png" alt="" aria-hidden="true" className="pointer-events-none absolute -right-24 top-6 -z-10 hidden w-[330px] opacity-80 lg:block" />

      <section id="hero-demo" className="relative px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/10 bg-card/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur">
              <ShieldCheck className="size-4" /> Private browser-based conversion
            </p>
            <h1 className="mt-6 font-heading text-5xl font-black leading-[0.96] tracking-[-0.06em] text-foreground sm:text-6xl lg:text-7xl">
              Free JPG to PNG, PNG to WebP, and WebP to JPG converter
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-xl">
              Use FileFlow as a private JPG to PNG converter, PNG to WebP converter, WebP to JPG converter, and batch image converter. Upload images, choose the output format, then download. No account, no watermark, and your files never leave your device.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-accent" /> Free to use</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-accent" /> Batch image converter</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-accent" /> Local processing</span>
            </div>
          </div>

          <div id="converter" className="mt-12 rounded-[2.25rem] border border-border bg-card/80 p-4 shadow-[0_30px_100px_rgba(18,18,43,0.12)] backdrop-blur-xl sm:p-6 lg:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Image converter</p>
                <p className="mt-1 text-sm text-muted-foreground">Need a quick guide? Replay the product tour anytime.</p>
              </div>
              <Button type="button" variant="outline" onClick={openOnboardingFromStart} className="rounded-full font-bold">
                <CircleHelp className="size-4" /> Tutorial
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-black text-foreground">1. Upload your images</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Drag files here or click the upload area.</p>
                </div>

                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif" multiple className="hidden" onChange={handleInputChange} />

                <div
                  id="tour-upload"
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={handleUploadKeyDown}
                  onDrop={handleDrop}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  className={cn(
                    'group grid min-h-[280px] cursor-pointer place-items-center rounded-[1.75rem] border-2 border-dashed border-primary/20 bg-secondary/70 p-8 text-center transition duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-card focus:outline-none focus:ring-4 focus:ring-primary/15',
                    isDragging && 'scale-[1.01] border-primary bg-card shadow-[0_24px_70px_rgba(99,91,255,0.14)]',
                  )}
                  aria-label="Upload JPG, PNG, WebP, or HEIC/HEIF images"
                >
                  <div>
                    <div className="mx-auto grid size-16 place-items-center rounded-[1.5rem] bg-primary text-primary-foreground shadow-[0_18px_40px_rgba(99,91,255,0.3)] transition group-hover:scale-105">
                      <UploadCloud className="size-8" />
                    </div>
                    <p className="mt-6 font-heading text-2xl font-black tracking-tight">Drop images here</p>
                    <p className="mt-2 text-sm text-muted-foreground">or click to browse from your device</p>
                    <p className="mt-5 inline-flex rounded-full bg-card px-3 py-1 text-xs font-bold text-muted-foreground shadow-sm">Supports JPG, PNG, WebP, and HEIC/HEIF</p>
                  </div>
                </div>

                {uploadError ? <p role="alert" className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-200">{uploadError}</p> : null}

                <div className="rounded-[1.5rem] border border-accent/15 bg-accent/10 p-4 text-sm text-foreground">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0" />
                    <div className="space-y-2">
                      <p><span className="font-semibold">Privacy first.</span> Images are converted locally in your browser, not uploaded to a server.</p>
                      <p className="text-muted-foreground">Canvas conversion usually strips most embedded metadata, including many EXIF fields, but browser behavior can vary.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-black text-foreground">2. Choose output format</h2>
                  <p className="mt-1 text-sm text-muted-foreground">This format will be applied to all uploaded images.</p>
                </div>

                <div id="tour-format" role="radiogroup" aria-label="Output format" onKeyDown={handleFormatKeyDown} className="grid gap-3 sm:grid-cols-4">
                  {formatOptions.map((option) => {
                    const isAvifOption = option.value === 'image/avif';
                    const isDisabled = isAvifOption && !isAvifSupported;
                    const disabledReason = hasCheckedAvifSupport ? 'AVIF export is disabled because this browser cannot encode AVIF with canvas.toBlob().' : 'Checking AVIF export support...';

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleFormatChange(option.value)}
                        disabled={isDisabled}
                        title={isDisabled ? disabledReason : option.description}
                        role="radio"
                        aria-checked={outputFormat === option.value}
                        aria-describedby={isDisabled ? 'avif-support-note' : undefined}
                        className={cn(
                          'rounded-[1.35rem] border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-55',
                          outputFormat === option.value ? 'border-primary/50 bg-primary/10 text-foreground shadow-sm ring-4 ring-primary/10' : 'border-border bg-card text-muted-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground',
                        )}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-heading text-xl font-black">{option.label}</span>
                          {outputFormat === option.value ? <CheckCircle2 className="size-5 text-primary" /> : null}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">{isDisabled ? 'Not supported in this browser' : option.description}</span>
                      </button>
                    );
                  })}
                </div>
                <p id="avif-support-note" className="text-xs leading-5 text-muted-foreground">
                  AVIF export appears only as an enabled option when your browser supports canvas AVIF encoding. HEIC/HEIF uploads are decoded only when selected, so the HEIC converter is lazy-loaded and browser/device support can vary.
                </p>

                <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm">
                  <div>
                    <h3 className="text-sm font-black text-foreground">Resize image</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Keep original size or resize before conversion.</p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-bold text-muted-foreground">
                      Resize mode
                      <select
                        value={resizeMode}
                        onChange={(event) => setResizeMode(event.target.value as ResizeMode)}
                        className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15"
                      >
                        <option value="original">Original size</option>
                        <option value="percentage">Percentage</option>
                        <option value="max-width">Max width</option>
                        <option value="max-height">Max height</option>
                        <option value="dimensions">Custom width/height</option>
                      </select>
                    </label>

                    {resizeMode === 'percentage' ? (
                      <label className="text-xs font-bold text-muted-foreground">
                        Percentage
                        <input
                          type="number"
                          min="1"
                          max={maxResizePercentage}
                          value={resizePercentage}
                          onChange={(event) => setResizePercentage(event.target.value)}
                          className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15"
                        />
                      </label>
                    ) : null}

                    {resizeMode === 'max-width' || resizeMode === 'dimensions' ? (
                      <label className="text-xs font-bold text-muted-foreground">
                        Width px
                        <input
                          type="number"
                          min="1"
                          max={maxResizeDimension}
                          value={resizeWidth}
                          onChange={(event) => setResizeWidth(event.target.value)}
                          placeholder={resizeMode === 'dimensions' && keepAspectRatio ? 'Auto if height set' : 'Width'}
                          className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15"
                        />
                      </label>
                    ) : null}

                    {resizeMode === 'max-height' || resizeMode === 'dimensions' ? (
                      <label className="text-xs font-bold text-muted-foreground">
                        Height px
                        <input
                          type="number"
                          min="1"
                          max={maxResizeDimension}
                          value={resizeHeight}
                          onChange={(event) => setResizeHeight(event.target.value)}
                          placeholder={resizeMode === 'dimensions' && keepAspectRatio ? 'Auto if width set' : 'Height'}
                          className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15"
                        />
                      </label>
                    ) : null}
                  </div>

                  {resizeMode === 'dimensions' ? (
                    <label className="mt-4 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <input type="checkbox" checked={keepAspectRatio} onChange={(event) => setKeepAspectRatio(event.target.checked)} className="size-4 accent-primary" />
                      Keep aspect ratio
                    </label>
                  ) : null}

                  {resizeError ? <p role="alert" className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">{resizeError}</p> : null}
                </div>

                <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-black text-foreground">Output quality</h3>
                      <p className="mt-1 text-xs text-muted-foreground">Adjust JPG/WebP/AVIF compression before download.</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-extrabold text-primary">{qualityPercentage}%</span>
                  </div>
                  <label htmlFor="quality-slider" className="sr-only">Output quality</label>
                  <input
                    id="quality-slider"
                    type="range"
                    min="1"
                    max="100"
                    value={qualityPercentage}
                    onChange={handleQualityChange}
                    disabled={!supportsQuality}
                    className="mt-4 h-2 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                    aria-describedby="quality-help"
                  />
                  <div id="quality-help" className="mt-3 text-xs leading-5 text-muted-foreground">
                    {supportsQuality ? (
                      <p>Lower quality usually creates smaller {selectedFormat.label} files. Existing images will be reconverted when this changes.</p>
                    ) : (
                      <p>PNG is lossless, so the quality slider is disabled and not used for conversion.</p>
                    )}
                  </div>
                </div>

                <div id="tour-download" className="rounded-[1.75rem] border border-border bg-card p-4 shadow-sm sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-foreground">3. Download result</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Converted files will appear below.</p>
                    </div>
                    {images.length > 0 ? (
                      <Button type="button" variant="ghost" size="sm" onClick={clearImages} className="text-muted-foreground hover:text-foreground" aria-label="Clear all uploaded images">
                        Clear all
                      </Button>
                    ) : null}
                  </div>

                  {conversionProgress && images.length > 0 ? (
                    <div className="mt-4 rounded-[1.25rem] border border-primary/10 bg-primary/5 p-3" aria-live="polite" aria-atomic="true">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-primary">
                        <span>
                          {conversionProgress.completedFiles + conversionProgress.failedFiles} of {conversionProgress.totalFiles} converted
                        </span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div
                        className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label="Batch conversion progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progressPercentage}
                      >
                        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
                      </div>
                      <p className="mt-2 truncate text-xs text-muted-foreground">
                        {isProcessing && conversionProgress.currentFileName ? `Processing ${conversionProgress.currentFileName}` : conversionProgress.failedFiles > 0 ? `${conversionProgress.failedFiles} file(s) failed` : 'Conversion complete'}
                      </p>
                    </div>
                  ) : null}

                  {!isProcessing && completedImages.length > 0 ? (
                    <div className="mt-4 rounded-[1.25rem] border border-accent/15 bg-accent/10 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-foreground">Batch size summary</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatFileSize(batchSizeStats.totalOriginalSize)} original → {formatFileSize(batchSizeStats.totalConvertedSize)} converted
                          </p>
                          <p className="mt-1 text-xs font-semibold text-muted-foreground">
                            {getSizeDifferenceLabel(batchSizeStats.totalOriginalSize, batchSizeStats.totalConvertedSize)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-xs font-extrabold',
                            batchSizeStats.isSameSize
                              ? 'bg-muted text-muted-foreground'
                              : batchSizeStats.isSmaller
                                ? 'bg-accent/15 text-accent'
                                : 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
                          )}
                        >
                          {batchSizeStats.isSameSize ? 'Same size' : batchSizeStats.isSmaller ? `Saved ${batchSizeStats.percentage}% total` : `Size increased ${batchSizeStats.percentage}% total`}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-3">
                    {images.length === 0 ? (
                      <div className="grid min-h-[180px] place-items-center rounded-[1.5rem] border border-dashed border-border bg-secondary/70 p-6 text-center">
                        <div>
                          <ImageIcon className="mx-auto size-10 text-muted-foreground" />
                          <p className="mt-3 font-semibold text-foreground">No images uploaded yet</p>
                          <p className="mt-1 text-sm text-muted-foreground">Upload images to start converting.</p>
                        </div>
                      </div>
                    ) : (
                      images.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-[1.1rem] border border-border bg-secondary/60 p-3 transition hover:bg-card">
                          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                            {item.convertedUrl ? <img src={item.convertedUrl} alt={`Preview of ${item.file.name}`} className="size-full object-cover" /> : <ImageIcon className="size-6" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{item.file.name}</p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                {formatFileSize(item.file.size)} original → {item.convertedBlob ? `${formatFileSize(item.convertedBlob.size)} converted` : selectedFormat.label}
                              </span>
                              {item.convertedBlob ? (
                                <span
                                  className={cn(
                                    'rounded-full px-2 py-0.5 text-[11px] font-extrabold',
                                    getSizeChangeStats(item.file.size, item.convertedBlob.size).isSameSize
                                      ? 'bg-muted text-muted-foreground'
                                      : getSizeChangeStats(item.file.size, item.convertedBlob.size).isSmaller
                                        ? 'bg-accent/15 text-accent'
                                        : 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
                                  )}
                                >
                                  {getSizeChangeLabel(item.file.size, item.convertedBlob.size)}
                                </span>
                              ) : null}
                            </div>
                            {item.originalWidth && item.originalHeight ? (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {item.originalWidth}×{item.originalHeight}px → {item.outputWidth && item.outputHeight ? `${item.outputWidth}×${item.outputHeight}px` : 'pending'}
                              </p>
                            ) : null}
                            <p className={cn('mt-0.5 text-xs font-bold', item.status === 'error' ? 'text-destructive' : item.status === 'done' ? 'text-accent' : 'text-primary')}>
                              {item.status === 'queued'
                                ? 'Queued'
                                : item.status === 'processing'
                                  ? 'Converting...'
                                  : item.status === 'error'
                                    ? item.error
                                    : item.status === 'idle'
                                      ? 'Waiting for valid resize settings'
                                      : 'Ready'}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <Button size="icon" variant="ghost" className="size-9 rounded-full text-muted-foreground" disabled={!item.convertedBlob || Boolean(resizeError)} onClick={() => downloadSingle(item)} aria-label={`Download converted image ${item.file.name}`}>
                              <Download className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-9 rounded-full text-destructive hover:text-destructive" onClick={() => removeImage(item.id)} aria-label={`Remove image ${item.file.name}`}>
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Button className="mt-4 h-12 w-full rounded-full bg-primary text-base font-extrabold shadow-[0_18px_45px_rgba(99,91,255,0.28)] transition hover:-translate-y-0.5 hover:bg-primary/90" disabled={completedImages.length === 0 || isProcessing || isZipping || Boolean(resizeError)} onClick={() => void handlePrimaryDownload()} aria-label={primaryButtonLabel}>
                    {completedImages.length > 1 ? <FileArchive className="size-4" /> : <Download className="size-4" />} {primaryButtonLabel}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative px-4 py-14 sm:px-6 lg:px-8">
        <img src="/assets/design-system/section-wave.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full w-full object-cover opacity-90" />
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">How it works</p>
            <h2 className="mt-3 font-heading text-4xl font-black tracking-[-0.05em] text-foreground">We help your images move faster.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[0_22px_70px_rgba(18,18,43,0.08)] transition hover:-translate-y-1">
                <div className="grid size-11 place-items-center rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-[0_14px_35px_rgba(99,91,255,0.24)]">{index + 1}</div>
                <h2 className="mt-5 font-heading text-xl font-black tracking-tight">{step.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="conversion-tools" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Popular conversion tools</p>
            <h2 className="mt-3 font-heading text-4xl font-black tracking-[-0.05em] text-foreground">Convert common image formats in one private workspace.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">FileFlow covers high-intent conversion workflows without sending files to a server: JPG to PNG, PNG to WebP, WebP to JPG, plus batch image conversion with ZIP export.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-black text-foreground">JPG to PNG converter</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Create PNG copies from JPG photos for design workflows, screenshots, and archival needs.</p>
            </article>
            <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-black text-foreground">PNG to WebP converter</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Optimize PNG images into WebP with quality control to help reduce website asset size.</p>
            </article>
            <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-black text-foreground">WebP to JPG converter</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Convert WebP images to JPG for apps, upload forms, and platforms that need wider compatibility.</p>
            </article>
            <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-black text-foreground">Batch image converter</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Convert multiple images at once, track progress, compare file sizes, and download everything as a ZIP.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="faq" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Image converter FAQ</p>
            <h2 className="mt-3 font-heading text-4xl font-black tracking-[-0.05em] text-foreground">Format support, privacy, and batch conversion answers.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">A quick guide for JPG to PNG, PNG to WebP, WebP to JPG, metadata, uploads, and supported image formats.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
                <h3 className="text-base font-black text-foreground">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer id="privacy" className="relative overflow-hidden border-t border-border bg-card px-4 py-14 text-card-foreground sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(99,91,255,0.28),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h2 className="font-heading text-3xl font-black tracking-tight">FileFlow</h2>
              <p className="mt-4 leading-7 text-muted-foreground">A simple, private image converter for JPG, PNG, WebP, and HEIC/HEIF files.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold">Available tools</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li>JPG to PNG/WebP/AVIF</li>
                <li>PNG to JPG/WebP/AVIF</li>
                <li>WebP/HEIC to JPG/PNG/WebP</li>
                <li>Batch ZIP download</li>
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-bold">Privacy first</h2>
              <p className="mt-4 leading-7 text-muted-foreground">Your images are processed in your browser and never leave your device.</p>
              <p className="mt-3 leading-7 text-muted-foreground">Conversion through canvas usually strips most embedded metadata, including many EXIF fields, without claiming guaranteed removal in every browser.</p>
            </div>
          </div>
          <p className="mt-12 border-t border-border pt-7 text-sm text-muted-foreground">© {new Date().getFullYear()} FileFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
