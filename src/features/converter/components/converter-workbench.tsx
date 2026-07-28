'use client';

import { CheckCircle2, CircleHelp, Download, Eye, FileArchive, ImageIcon, Trash2, UploadCloud, X } from 'lucide-react';
import { ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { defaultConversionQuality, formatOptions } from '@/features/converter/constants';
import { convertWithCanvas, maxCanvasDimension } from '@/features/converter/image-conversion';
import type { ConversionProgress, ConversionSettings, ImageItem, OutputFormat, ResizeMode } from '@/features/converter/types';
import { downloadBlob, formatFileSize, getBaseName, getFormatMeta, getUniqueFileName, isSupportedInputFile, releaseConvertedImageUrls, releaseImageUrls, supportsCanvasOutputFormat } from '@/features/converter/utils';
import { cn } from '@/lib/utils';

const onboardingStorageKey = 'pixconvertly-onboarding-completed';
const maxResizeDimension = maxCanvasDimension;
const maxResizePercentage = 500;
const maxFilesPerBatch = 20;
const maxFileSizeBytes = 25 * 1024 * 1024;
const maxBatchSizeBytes = 150 * 1024 * 1024;
const maxZipSizeBytes = 200 * 1024 * 1024;

function getConversionConcurrency() {
  return window.matchMedia('(max-width: 768px)').matches ? 1 : 2;
}

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
    selector: '#tour-convert',
    title: '3. Convert and download',
    description: 'Start the conversion with this button. The finished images will appear directly below the upload area for individual or ZIP download.',
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

export function ConverterWorkbench() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const onboardingDialogRef = useRef<HTMLDivElement | null>(null);
  const onboardingTriggerRef = useRef<HTMLButtonElement | null>(null);
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
  const [previewImage, setPreviewImage] = useState<ImageItem | null>(null);
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
    if (!previewImage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => previewCloseButtonRef.current?.focus());

    const handlePreviewKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewImage(null);
    };

    document.addEventListener('keydown', handlePreviewKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handlePreviewKeyDown);
    };
  }, [previewImage]);

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

    const dialog = onboardingDialogRef.current;
    const trigger = onboardingTriggerRef.current;
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => dialog?.focus());

    const handleDialogKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        localStorage.setItem(onboardingStorageKey, 'true');
        setIsOnboardingOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;
      const focusableElements = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleDialogKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleDialogKeyDown);
      trigger?.focus();
    };
  }, [isOnboardingOpen]);

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

    const workers = Array.from({ length: Math.min(getConversionConcurrency(), items.length) }, () => processNextItem());
    await Promise.all(workers);

    if (conversionRunIdRef.current === runId) {
      setConversionProgress((progress) => (progress ? { ...progress, currentFileName: undefined } : progress));
    }
  }, []);

  const handleFileUpload = (files: FileList | File[]) => {
    const incomingFiles = Array.from(files);
    const currentFiles = imagesRef.current;
    const availableSlots = Math.max(0, maxFilesPerBatch - currentFiles.length);
    const currentBatchSize = currentFiles.reduce((total, item) => total + item.file.size, 0);
    let acceptedBatchSize = currentBatchSize;
    let skippedFiles = 0;

    const validFiles = incomingFiles.filter((file) => {
      const isAccepted = isSupportedInputFile(file)
        && file.size <= maxFileSizeBytes
        && acceptedBatchSize + file.size <= maxBatchSizeBytes;

      if (!isAccepted) {
        skippedFiles += 1;
        return false;
      }

      acceptedBatchSize += file.size;
      return true;
    }).slice(0, availableSlots);

    skippedFiles += Math.max(0, incomingFiles.length - skippedFiles - validFiles.length);

    if (validFiles.length === 0) {
      setUploadError(`No files were added. Use up to ${maxFilesPerBatch} supported images, ${formatFileSize(maxFileSizeBytes)} each and ${formatFileSize(maxBatchSizeBytes)} total.`);
      return;
    }

    setUploadError(skippedFiles > 0 ? `${skippedFiles} file(s) were skipped due to format, file-size, batch-size, or file-count limits.` : null);

    const uploadedItems: ImageItem[] = validFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      originalUrl: URL.createObjectURL(file),
      status: 'idle',
    }));
    const nextItems = [...imagesRef.current, ...uploadedItems];

    setConversionProgress(null);
    setImages(nextItems);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) handleFileUpload(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileUpload(event.dataTransfer.files);
  };

  const handleFormatChange = (format: OutputFormat) => {
    if (format === 'image/avif' && !isAvifSupported) return;
    setOutputFormat(format);
  };

  const handleQualityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuality(Number(event.target.value) / 100);
  };

  useEffect(() => {
    if (previousSettingsKeyRef.current === '') {
      previousSettingsKeyRef.current = settingsKey;
      return;
    }

    if (previousSettingsKeyRef.current === settingsKey) return;
    previousSettingsKeyRef.current = settingsKey;
    conversionRunIdRef.current += 1;

    const currentItems = imagesRef.current;
    if (!currentItems.some((item) => item.convertedBlob || item.status === 'processing' || item.status === 'queued')) return;

    releaseConvertedImageUrls(currentItems);
    setPreviewImage(null);
    setImages(currentItems.map((item) => ({
      ...item,
      status: 'idle',
      convertedBlob: undefined,
      convertedUrl: undefined,
      error: undefined,
    })));
    setConversionProgress(null);
  }, [settingsKey]);

  const handleConvertImages = () => {
    if (imagesRef.current.length === 0 || resizeError || isProcessing) return;
    void convertItems(imagesRef.current, conversionSettings);
  };

  const removeImage = (imageId: string) => {
    const imageToRemove = imagesRef.current.find((image) => image.id === imageId);
    if (!imageToRemove) return;

    releaseImageUrls([imageToRemove]);
    setPreviewImage((currentPreview) => currentPreview?.id === imageId ? null : currentPreview);
    setImages((currentItems) => currentItems.filter((image) => image.id !== imageId));
  };

  const clearImages = () => {
    conversionRunIdRef.current += 1;
    releaseImageUrls(images);
    setPreviewImage(null);
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

    try {
      const totalOutputSize = completedImages.reduce((total, image) => total + (image.convertedBlob?.size ?? 0), 0);
      if (totalOutputSize > maxZipSizeBytes) {
        setUploadError(`ZIP download is limited to ${formatFileSize(maxZipSizeBytes)} to protect browser memory. Download files individually or use a smaller batch.`);
        return;
      }

      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const usedFileNames = new Set<string>();

      completedImages.forEach((image) => {
        if (image.convertedBlob) {
          const fileName = getUniqueFileName(`${getBaseName(image.file.name)}.${selectedFormat.extension}`, usedFileNames);
          zip.file(fileName, image.convertedBlob);
        }
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(blob, `pixconvertly-images-${selectedFormat.extension}.zip`);
    } catch {
      setUploadError('Unable to create the ZIP in this browser. Try a smaller batch or download files individually.');
    } finally {
      setIsZipping(false);
    }
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
    if (completedImages.length === 0) return 'Convert images first';
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
    return resizeError ? 'Images are waiting for valid settings.' : 'Images are ready to convert.';
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
    <div className="relative isolate overflow-clip bg-background text-foreground">
      {isOnboardingOpen ? (
        <div ref={onboardingDialogRef} className="fixed inset-0 z-50 outline-none" role="dialog" aria-modal="true" aria-labelledby="onboarding-title" aria-describedby="onboarding-description" tabIndex={-1}>
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
            className="fixed border-2 border-foreground bg-card p-5 shadow-[8px_8px_0_hsl(var(--foreground)/0.2)]"
            style={{ top: Math.max(onboardingCardTop, 16), left: onboardingCardLeft, width: onboardingCardWidth }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="border border-primary px-2 py-1 font-mono text-[11px] font-extrabold uppercase text-primary">
                Step {onboardingStepIndex + 1} of {onboardingSteps.length}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={closeOnboarding} className="h-8 px-3 text-muted-foreground hover:text-foreground">
                Close
              </Button>
            </div>
            <h2 id="onboarding-title" className="font-heading text-xl font-black tracking-tight text-foreground">
              {currentOnboardingStep.title}
            </h2>
            <p id="onboarding-description" className="mt-2 text-sm leading-6 text-muted-foreground">{currentOnboardingStep.description}</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <Button type="button" variant="ghost" onClick={goToPreviousOnboardingStep} disabled={isFirstOnboardingStep} className="border border-foreground/20">
                Prev
              </Button>
              {isLastOnboardingStep ? (
                <Button type="button" onClick={closeOnboarding} className="border border-foreground bg-primary px-6 font-bold shadow-none hover:bg-foreground hover:text-background">
                  Got it
                </Button>
              ) : (
                <Button type="button" onClick={goToNextOnboardingStep} className="border border-foreground bg-primary px-6 font-bold shadow-none hover:bg-foreground hover:text-background">
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {previewImage?.convertedUrl ? (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewImage(null);
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden border-2 border-foreground bg-card shadow-[10px_10px_0_hsl(var(--foreground)/0.25)]">
            <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <h2 id="preview-title" className="truncate text-base font-black text-foreground">Preview: {previewImage.file.name}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {previewImage.outputWidth && previewImage.outputHeight ? `${previewImage.outputWidth}×${previewImage.outputHeight}px · ` : ''}
                  {previewImage.convertedBlob ? formatFileSize(previewImage.convertedBlob.size) : ''} · {selectedFormat.label}
                </p>
              </div>
              <Button ref={previewCloseButtonRef} type="button" size="icon" variant="ghost" className="size-10 shrink-0 border border-foreground/20" onClick={() => setPreviewImage(null)} aria-label="Close image preview">
                <X className="size-5" />
              </Button>
            </div>

            <div className="grid min-h-0 flex-1 place-items-center overflow-auto bg-[linear-gradient(45deg,hsl(var(--muted))_25%,transparent_25%),linear-gradient(-45deg,hsl(var(--muted))_25%,transparent_25%),linear-gradient(45deg,transparent_75%,hsl(var(--muted))_75%),linear-gradient(-45deg,transparent_75%,hsl(var(--muted))_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0] p-4 sm:p-8">
              <img src={previewImage.convertedUrl} alt={`Converted preview of ${previewImage.file.name}`} className="max-h-[68vh] max-w-full object-contain shadow-xl" />
            </div>

            <div className="flex justify-end border-t border-border p-3 sm:px-5">
              <Button type="button" className="border border-foreground font-bold" onClick={() => downloadSingle(previewImage)} disabled={!previewImage.convertedBlob}>
                <Download className="size-4" /> Download {selectedFormat.label}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveStatusMessage}
      </div>
      <section id="hero-demo" className="relative px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div id="converter" className="overflow-clip border-2 border-foreground bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground bg-foreground px-5 py-3 text-background sm:px-6">
              <div>
                <p className="font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-primary">PX / Conversion desk</p>
                <p className="mt-1 font-mono text-[11px] text-background/55">Local session · files never transmitted</p>
              </div>
              <div className="flex items-center gap-4">
                <ol className="hidden items-center gap-2 font-mono text-[11px] font-bold text-background/50 sm:flex" aria-label="Conversion steps">
                  <li className={cn(images.length === 0 && 'text-primary')}>01 FILES</li>
                  <li aria-hidden="true">/</li>
                  <li className={cn(images.length > 0 && completedImages.length === 0 && 'text-primary')}>02 OUTPUT</li>
                  <li aria-hidden="true">/</li>
                  <li className={cn(completedImages.length > 0 && 'text-primary')}>03 READY</li>
                </ol>
                <Button ref={onboardingTriggerRef} type="button" variant="outline" onClick={openOnboardingFromStart} className="h-9 rounded-none border-background/30 bg-transparent font-mono text-xs text-background hover:bg-background hover:text-foreground">
                  <CircleHelp className="size-4" /> Guide
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)] lg:items-start">
              <div className="space-y-5 p-5 sm:p-7 lg:p-8">
                <div>
                  <p className="technical-label text-primary">Input / 01</p>
                  <h2 className="mt-1 text-xl font-black text-foreground">Load source files</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Drag files here or click the upload area.</p>
                </div>

                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif" multiple className="sr-only" tabIndex={-1} onChange={handleInputChange} />

                <button
                  id="tour-upload"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  className={cn(
                    'upload-stage group grid min-h-[280px] w-full cursor-pointer place-items-center overflow-hidden border border-dashed border-foreground/50 bg-background p-8 text-center transition-[border-color,background-color] duration-150 hover:border-primary hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isDragging && 'border-primary bg-primary/[0.06]',
                  )}
                  aria-label="Upload JPG, PNG, WebP, or HEIC/HEIF images"
                >
                  <div>
                    <div className="mx-auto grid size-14 place-items-center border border-foreground bg-foreground text-background transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                      <UploadCloud className="size-8" />
                    </div>
                    <p className="mt-6 font-heading text-2xl font-black uppercase tracking-[-0.02em]">Drop images here</p>
                    <p className="mt-2 text-sm text-muted-foreground">or click to browse from your device</p>
                    <p className="mt-5 font-mono text-[11px] font-bold uppercase tracking-wide text-muted-foreground">JPG · PNG · WebP · HEIC/HEIF</p>
                    <p className="mt-2 text-xs text-muted-foreground">Up to {maxFilesPerBatch} files · {formatFileSize(maxFileSizeBytes)} each · {formatFileSize(maxBatchSizeBytes)} total</p>
                  </div>
                </button>

                {uploadError ? <p role="alert" className="border-l-4 border-amber-600 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-200">{uploadError}</p> : null}

                <section id="tour-download" className="border-t border-foreground/20 pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="technical-label text-primary">Output / 03</p>
                      <h2 className="mt-1 text-xl font-black text-foreground">Processed files</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Converted files will appear below.</p>
                    </div>
                    {images.length > 0 ? (
                      <Button type="button" variant="ghost" size="sm" onClick={clearImages} className="text-muted-foreground hover:text-foreground" aria-label="Clear all uploaded images">
                        Clear all
                      </Button>
                    ) : null}
                  </div>

                  {conversionProgress && images.length > 0 ? (
                    <div className="mt-4 border-l-4 border-primary bg-primary/5 p-3" aria-live="polite" aria-atomic="true">
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
                    <div className="mt-4 border-l-4 border-accent bg-accent/10 p-4">
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

                  <div className={cn('mt-4 space-y-3', images.length > 4 && 'max-h-[32rem] overflow-y-auto pr-1')}>
                    {images.length === 0 ? (
                      <div className="grid min-h-[160px] place-items-center border border-dashed border-foreground/30 bg-background p-6 text-center">
                        <div>
                          <ImageIcon className="mx-auto size-10 text-muted-foreground" />
                          <p className="mt-3 font-semibold text-foreground">No images uploaded yet</p>
                          <p className="mt-1 text-sm text-muted-foreground">Upload images to start converting.</p>
                        </div>
                      </div>
                    ) : (
                      images.map((item) => (
                        <div key={item.id} className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 py-3 transition-colors last:border-b-0 hover:bg-muted/35">
                          <div className="grid size-12 shrink-0 place-items-center overflow-hidden border border-foreground/20 bg-background text-primary">
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
                                      ? resizeError ? 'Waiting for valid resize settings' : 'Ready to convert'
                                      : 'Ready'}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <Button size="icon" variant="ghost" className="size-9 border border-transparent text-muted-foreground hover:border-foreground/20" disabled={!item.convertedUrl || Boolean(resizeError)} onClick={() => setPreviewImage(item)} aria-label={`Preview converted image ${item.file.name}`} title="Preview image">
                              <Eye className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-9 border border-transparent text-muted-foreground hover:border-foreground/20" disabled={!item.convertedBlob || Boolean(resizeError)} onClick={() => downloadSingle(item)} aria-label={`Download converted image ${item.file.name}`} title="Download image">
                              <Download className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-9 border border-transparent text-destructive hover:border-destructive hover:text-destructive" onClick={() => removeImage(item.id)} aria-label={`Remove image ${item.file.name}`}>
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Button className="sticky bottom-3 mt-4 h-12 w-full rounded-none border border-foreground bg-foreground text-sm font-extrabold uppercase tracking-wide text-background shadow-none transition-colors hover:bg-primary hover:text-primary-foreground active:bg-primary/90 lg:static" disabled={completedImages.length === 0 || isProcessing || isZipping || Boolean(resizeError)} onClick={() => void handlePrimaryDownload()} aria-label={primaryButtonLabel}>
                    {completedImages.length > 1 ? <FileArchive className="size-4" /> : <Download className="size-4" />} {primaryButtonLabel}
                  </Button>
                </section>
              </div>

              <aside className="space-y-5 border-t border-foreground bg-secondary/35 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
                <div>
                  <p className="technical-label text-primary">Settings / 02</p>
                  <h2 className="mt-2 text-xl font-black text-foreground">Define the output</h2>
                  <p className="mt-1 text-sm text-muted-foreground">This format will be applied to all uploaded images.</p>
                </div>

                <RadioGroup id="tour-format" value={outputFormat} onValueChange={(value) => handleFormatChange(value as OutputFormat)} aria-label="Output format" className="grid grid-cols-2 border border-foreground/30 bg-background sm:grid-cols-4">
                  {formatOptions.map((option) => {
                    const isAvifOption = option.value === 'image/avif';
                    const isDisabled = isAvifOption && !isAvifSupported;
                    const disabledReason = hasCheckedAvifSupport ? 'AVIF export is disabled because this browser cannot encode AVIF with canvas.toBlob().' : 'Checking AVIF export support...';

                    return (
                      <RadioGroupItem
                        key={option.value}
                        value={option.value}
                        disabled={isDisabled}
                        title={isDisabled ? disabledReason : option.description}
                        aria-describedby={isDisabled ? 'avif-support-note' : undefined}
                        className={cn(
                          'h-auto w-full rounded-none border-0 border-r border-foreground/20 px-3 py-3 text-left transition-colors last:border-r-0 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-55 [&>div:first-child]:hidden',
                          outputFormat === option.value ? 'bg-foreground text-background shadow-none' : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-heading text-base font-black">{option.label}</span>
                          {outputFormat === option.value ? <CheckCircle2 className="size-4 text-primary" /> : null}
                        </span>
                        <span className="sr-only">{isDisabled ? 'Not supported in this browser' : option.description}</span>
                      </RadioGroupItem>
                    );
                  })}
                </RadioGroup>
                <p className="text-sm font-medium text-foreground">{selectedFormat.description}</p>
                <p id="avif-support-note" className="text-xs leading-5 text-muted-foreground">
                  AVIF export appears only as an enabled option when your browser supports canvas AVIF encoding. HEIC/HEIF uploads are decoded only when selected, so the HEIC converter is lazy-loaded and browser/device support can vary.
                </p>

                <Button
                  id="tour-convert"
                  type="button"
                  className="h-12 w-full rounded-none border border-foreground bg-primary text-sm font-extrabold uppercase tracking-wide text-primary-foreground shadow-none transition-colors hover:bg-foreground hover:text-background disabled:shadow-none"
                  disabled={images.length === 0 || isProcessing || Boolean(resizeError)}
                  onClick={handleConvertImages}
                >
                  <ImageIcon className="size-4" />
                  {isProcessing ? 'Converting…' : `Convert to ${selectedFormat.label}`}
                </Button>

                {images.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground">Upload at least one image to enable conversion.</p>
                ) : null}

                <section className="border-t border-border pt-5">
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
                        className="mt-1 h-10 w-full rounded-none border border-foreground/30 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                          className="mt-1 h-10 w-full rounded-none border border-foreground/30 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                          className="mt-1 h-10 w-full rounded-none border border-foreground/30 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                          className="mt-1 h-10 w-full rounded-none border border-foreground/30 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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

                  {resizeError ? <p role="alert" className="mt-3 border-l-4 border-destructive bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">{resizeError}</p> : null}
                </section>

                <section className="border-t border-border pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-black text-foreground">Output quality</h3>
                      <p className="mt-1 text-xs text-muted-foreground">Adjust JPG/WebP/AVIF compression before download.</p>
                    </div>
                    <span className="border border-primary/40 px-2 py-1 font-mono text-xs font-extrabold text-primary">{qualityPercentage}%</span>
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
                      <p>Lower quality usually creates smaller {selectedFormat.label} files. Convert again after changing this setting.</p>
                    ) : (
                      <p>PNG is lossless, so the quality slider is disabled and not used for conversion.</p>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
