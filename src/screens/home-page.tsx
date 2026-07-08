'use client';

import JSZip from 'jszip';
import { CheckCircle2, Download, FileArchive, ImageIcon, ShieldCheck, UploadCloud } from 'lucide-react';
import { ChangeEvent, DragEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';
type ConversionStatus = 'idle' | 'processing' | 'done' | 'error';

type ImageItem = {
  id: string;
  file: File;
  originalUrl: string;
  convertedUrl?: string;
  convertedBlob?: Blob;
  status: ConversionStatus;
  error?: string;
};

type FormatOption = {
  label: string;
  value: OutputFormat;
  extension: string;
  description: string;
};

const supportedInputTypes = ['image/jpeg', 'image/png', 'image/webp'];

const formatOptions: FormatOption[] = [
  { label: 'JPG', value: 'image/jpeg', extension: 'jpg', description: 'Best for photos' },
  { label: 'PNG', value: 'image/png', extension: 'png', description: 'Best for transparency' },
  { label: 'WebP', value: 'image/webp', extension: 'webp', description: 'Small file size' },
];

const steps = [
  { title: 'Upload images', description: 'Drop JPG, PNG, or WebP files into the upload area.' },
  { title: 'Choose format', description: 'Select one output format for all uploaded images.' },
  { title: 'Download', description: 'Download a single image or a ZIP for multiple files.' },
];

const onboardingStorageKey = 'fileflow-onboarding-completed';

const onboardingSteps = [
  {
    selector: '#tour-upload',
    title: '1. Upload images',
    description: 'Click this upload area or drag and drop your images here. You can select multiple JPG, PNG, or WebP files at once.',
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

function getBaseName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '');
}

function getFormatMeta(format: OutputFormat) {
  return formatOptions.find((option) => option.value === format) ?? formatOptions[2];
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to read this image.'));
    image.src = url;
  });
}

async function convertWithCanvas(file: File, originalUrl: string, outputFormat: OutputFormat) {
  const image = await loadImage(originalUrl);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser does not support image conversion. Please try Chrome, Edge, or Firefox.');

  if (outputFormat === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Unable to convert ${file.name}.`));
          return;
        }
        resolve(blob);
      },
      outputFormat,
      0.92,
    );
  });
}

export function HomePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/webp');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingStepIndex, setOnboardingStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);

  const completedImages = useMemo(() => images.filter((image) => image.convertedBlob), [images]);
  const selectedFormat = getFormatMeta(outputFormat);
  const isProcessing = images.some((image) => image.status === 'processing');

  useEffect(() => {
    if (localStorage.getItem(onboardingStorageKey) !== 'true') {
      setIsOnboardingOpen(true);
    }
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
    setSpotlightRect({
      top: Math.max(rect.top - padding, 8),
      left: Math.max(rect.left - padding, 8),
      width: Math.min(rect.width + padding * 2, window.innerWidth - 16),
      height: Math.min(rect.height + padding * 2, window.innerHeight - 16),
    });
  }, [onboardingStepIndex]);

  useEffect(() => {
    if (!isOnboardingOpen) return;

    const currentStep = onboardingSteps[onboardingStepIndex];
    const target = document.querySelector<HTMLElement>(currentStep.selector);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

    const timeout = window.setTimeout(updateSpotlight, 350);
    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight, true);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight, true);
    };
  }, [isOnboardingOpen, onboardingStepIndex, updateSpotlight]);

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

  const releaseUrls = (items: ImageItem[]) => {
    items.forEach((item) => {
      URL.revokeObjectURL(item.originalUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
  };

  const convertItems = async (items: ImageItem[], format: OutputFormat) => {
    setImages(items.map((item) => ({ ...item, status: 'processing', convertedBlob: undefined, convertedUrl: undefined, error: undefined })));

    const convertedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const blob = await convertWithCanvas(item.file, item.originalUrl, format);
          return {
            ...item,
            convertedBlob: blob,
            convertedUrl: URL.createObjectURL(blob),
            status: 'done' as const,
          };
        } catch (error) {
          return {
            ...item,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unable to convert this image.',
          };
        }
      }),
    );

    setImages(convertedItems);
  };

  const handleFileUpload = (files: FileList | File[]) => {
    const incomingFiles = Array.from(files);
    const validFiles = incomingFiles.filter((file) => supportedInputTypes.includes(file.type));

    if (validFiles.length === 0) {
      setUploadError('Please upload JPG, PNG, or WebP images. Other file types are not supported yet.');
      return;
    }

    setUploadError(incomingFiles.length !== validFiles.length ? 'Some files were skipped because only JPG, PNG, and WebP images are supported.' : null);
    releaseUrls(images);

    const nextItems: ImageItem[] = validFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      originalUrl: URL.createObjectURL(file),
      status: 'idle',
    }));

    void convertItems(nextItems, outputFormat);
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

  const handleFormatChange = (format: OutputFormat) => {
    setOutputFormat(format);
    if (images.length > 0) {
      const cleanItems = images.map((image) => ({ ...image, convertedBlob: undefined, convertedUrl: undefined }));
      void convertItems(cleanItems, format);
    }
  };

  const clearImages = () => {
    releaseUrls(images);
    setImages([]);
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

    completedImages.forEach((image) => {
      if (image.convertedBlob) {
        zip.file(`${getBaseName(image.file.name)}.${selectedFormat.extension}`, image.convertedBlob);
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

  const currentOnboardingStep = onboardingSteps[onboardingStepIndex];
  const isFirstOnboardingStep = onboardingStepIndex === 0;
  const isLastOnboardingStep = onboardingStepIndex === onboardingSteps.length - 1;
  const viewportWidth = typeof window === 'undefined' ? 1024 : window.innerWidth;
  const viewportHeight = typeof window === 'undefined' ? 768 : window.innerHeight;
  const onboardingCardWidth = Math.min(360, viewportWidth - 32);
  const onboardingCardTop = spotlightRect ? Math.min(spotlightRect.top + spotlightRect.height + 16, viewportHeight - 260) : 120;
  const onboardingCardLeft = spotlightRect ? Math.min(Math.max(spotlightRect.left, 16), viewportWidth - onboardingCardWidth - 16) : 16;

  return (
    <div className="relative overflow-hidden bg-[#f6fbff] text-slate-950">
      {isOnboardingOpen ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
          {spotlightRect ? (
            <>
              <div className="fixed left-0 top-0 bg-slate-950/60 backdrop-blur-[1px]" style={{ right: 0, height: spotlightRect.top }} />
              <div className="fixed left-0 bg-slate-950/60 backdrop-blur-[1px]" style={{ top: spotlightRect.top, width: spotlightRect.left, height: spotlightRect.height }} />
              <div className="fixed bg-slate-950/60 backdrop-blur-[1px]" style={{ top: spotlightRect.top, left: spotlightRect.left + spotlightRect.width, right: 0, height: spotlightRect.height }} />
              <div className="fixed bottom-0 left-0 bg-slate-950/60 backdrop-blur-[1px]" style={{ right: 0, top: spotlightRect.top + spotlightRect.height }} />
              <div
                className="pointer-events-none fixed rounded-[1.75rem] border-2 border-blue-400 shadow-[0_0_0_6px_rgba(59,130,246,0.25),0_18px_60px_rgba(37,99,235,0.35)]"
                style={spotlightRect}
              />
            </>
          ) : (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-[1px]" />
          )}

          <div
            className="fixed rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.3)]"
            style={{ top: Math.max(onboardingCardTop, 16), left: onboardingCardLeft, width: onboardingCardWidth }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                Step {onboardingStepIndex + 1} of {onboardingSteps.length}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={closeOnboarding} className="h-8 rounded-full px-3 text-slate-500 hover:text-slate-950">
                Close
              </Button>
            </div>
            <h2 id="onboarding-title" className="text-lg font-extrabold text-slate-950">
              {currentOnboardingStep.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{currentOnboardingStep.description}</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <Button type="button" variant="ghost" onClick={goToPreviousOnboardingStep} disabled={isFirstOnboardingStep} className="rounded-xl">
                Prev
              </Button>
              {isLastOnboardingStep ? (
                <Button type="button" onClick={closeOnboarding} className="rounded-xl bg-blue-600 font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700">
                  Got it
                </Button>
              ) : (
                <Button type="button" onClick={goToNextOnboardingStep} className="rounded-xl bg-blue-600 font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700">
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_95%_86%,rgba(255,255,255,0.95),transparent_7%)]" />

      <section id="hero-demo" className="relative px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
              <ShieldCheck className="size-4" /> Private browser-based conversion
            </p>
            <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              Convert images in 3 simple steps
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
              Upload JPG, PNG, or WebP images, choose the output format, then download. No account, no watermark, and your files never leave your device.
            </p>
          </div>

          <div id="converter" className="mt-10 rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">1. Upload your images</h2>
                  <p className="mt-1 text-sm text-slate-600">Drag files here or click the upload area.</p>
                </div>

                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={handleInputChange} />

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
                    'grid min-h-[260px] cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-8 text-center transition duration-200 hover:border-blue-500 hover:bg-blue-50/70 focus:outline-none focus:ring-4 focus:ring-blue-100',
                    isDragging && 'scale-[1.01] border-blue-600 bg-blue-50 shadow-xl shadow-blue-500/10',
                  )}
                  aria-label="Upload JPG, PNG, or WebP images"
                >
                  <div>
                    <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                      <UploadCloud className="size-8" />
                    </div>
                    <p className="mt-5 text-xl font-bold">Drop images here</p>
                    <p className="mt-2 text-sm text-slate-600">or click to browse from your device</p>
                    <p className="mt-4 text-xs font-medium text-slate-500">Supports JPG, PNG, and WebP</p>
                  </div>
                </div>

                {uploadError ? <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{uploadError}</p> : null}

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-emerald-900">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0" />
                    <p><span className="font-semibold">Privacy first.</span> Images are converted locally in your browser, not uploaded to a server.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">2. Choose output format</h2>
                  <p className="mt-1 text-sm text-slate-600">This format will be applied to all uploaded images.</p>
                </div>

                <div id="tour-format" className="grid gap-3 sm:grid-cols-3">
                  {formatOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleFormatChange(option.value)}
                      className={cn(
                        'rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-blue-100',
                        outputFormat === option.value ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50',
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-lg font-extrabold">{option.label}</span>
                        {outputFormat === option.value ? <CheckCircle2 className="size-5 text-blue-600" /> : null}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">{option.description}</span>
                    </button>
                  ))}
                </div>

                <div id="tour-download" className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">3. Download result</h2>
                      <p className="mt-1 text-sm text-slate-600">Converted files will appear below.</p>
                    </div>
                    {images.length > 0 ? (
                      <Button type="button" variant="ghost" size="sm" onClick={clearImages} className="text-slate-500 hover:text-slate-950">
                        Clear
                      </Button>
                    ) : null}
                  </div>

                  <div className="mt-4 space-y-3">
                    {images.length === 0 ? (
                      <div className="grid min-h-[180px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
                        <div>
                          <ImageIcon className="mx-auto size-10 text-slate-400" />
                          <p className="mt-3 font-semibold text-slate-800">No images uploaded yet</p>
                          <p className="mt-1 text-sm text-slate-500">Upload images to start converting.</p>
                        </div>
                      </div>
                    ) : (
                      images.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-blue-100 text-blue-600">
                            {item.convertedUrl ? <img src={item.convertedUrl} alt={`Preview of ${item.file.name}`} className="size-full object-cover" /> : <ImageIcon className="size-6" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-950">{item.file.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {formatFileSize(item.file.size)} → {item.convertedBlob ? formatFileSize(item.convertedBlob.size) : selectedFormat.label}
                            </p>
                            <p className={cn('mt-0.5 text-xs font-medium', item.status === 'error' ? 'text-red-600' : item.status === 'done' ? 'text-emerald-700' : 'text-blue-700')}>
                              {item.status === 'processing' ? 'Converting...' : item.status === 'error' ? item.error : 'Ready'}
                            </p>
                          </div>

                          <Button size="icon" variant="ghost" className="size-9 shrink-0 rounded-full text-slate-600" disabled={!item.convertedBlob} onClick={() => downloadSingle(item)} aria-label="Download converted image">
                            <Download className="size-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>

                  <Button className="mt-4 h-12 w-full rounded-xl bg-blue-600 text-base font-semibold shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700" disabled={completedImages.length === 0 || isProcessing || isZipping} onClick={() => void handlePrimaryDownload()}>
                    {completedImages.length > 1 ? <FileArchive className="size-4" /> : <Download className="size-4" />} {primaryButtonLabel}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-white/75 p-5 shadow-sm backdrop-blur">
                <div className="grid size-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">{index + 1}</div>
                <h2 className="mt-4 text-lg font-bold">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="privacy" className="relative px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl border-t border-slate-200 pt-7">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h2 className="text-lg font-bold">FileFlow</h2>
              <p className="mt-4 leading-7 text-slate-700">A simple, private image converter for JPG, PNG, and WebP files.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold">Available tools</h2>
              <ul className="mt-4 space-y-3 text-slate-700">
                <li>JPG to PNG/WebP</li>
                <li>PNG to JPG/WebP</li>
                <li>WebP to JPG/PNG</li>
                <li>Batch ZIP download</li>
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-bold">Privacy first</h2>
              <p className="mt-4 leading-7 text-slate-700">Your images are processed in your browser and never leave your device.</p>
            </div>
          </div>
          <p className="mt-8 text-sm text-slate-500">© {new Date().getFullYear()} FileFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
