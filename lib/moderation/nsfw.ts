import { Platform } from 'react-native';

import type { MediaType } from '@/types';

/** Conservative thresholds for nsfwjs class probabilities (0–1). */
const THRESHOLDS = {
  Porn: 0.6,
  Hentai: 0.6,
  Sexy: 0.85,
} as const;

export const NSFW_REJECT_MESSAGE =
  'Nakenhet eller seksuelt innhold er ikke tillatt på BioBlix.';

type NsfwClassName = 'Drawing' | 'Hentai' | 'Neutral' | 'Porn' | 'Sexy';

type Prediction = { className: NsfwClassName; probability: number };

type NsfwModel = {
  classify: (
    input: HTMLImageElement | HTMLCanvasElement | ImageData,
    topK?: number
  ) => Promise<Prediction[]>;
};

let modelPromise: Promise<NsfwModel> | null = null;

async function loadModel(): Promise<NsfwModel> {
  if (!modelPromise) {
    modelPromise = (async () => {
      // Dynamic import keeps startup light; model loads on first check.
      await import('@tensorflow/tfjs');
      const nsfwjs = await import('nsfwjs');
      return nsfwjs.load() as Promise<NsfwModel>;
    })().catch((err) => {
      modelPromise = null;
      throw err;
    });
  }
  return modelPromise;
}

function exceedsThreshold(predictions: Prediction[]): boolean {
  for (const p of predictions) {
    if (p.className === 'Porn' && p.probability >= THRESHOLDS.Porn) return true;
    if (p.className === 'Hentai' && p.probability >= THRESHOLDS.Hentai)
      return true;
    if (p.className === 'Sexy' && p.probability >= THRESHOLDS.Sexy) return true;
  }
  return false;
}

function loadHtmlImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('Kunne ikke laste bilde for innholdssjekk.'));
    img.src = uri;
  });
}

/** Capture the first decoded frame of a video URI via canvas (web only). */
async function videoFirstFrame(uri: string): Promise<HTMLCanvasElement> {
  if (typeof document === 'undefined') {
    throw new Error('Kunne ikke sjekke video.');
  }

  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.crossOrigin = 'anonymous';
  video.src = uri;

  await new Promise<void>((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('Kunne ikke sjekke video.'));
    };
    const cleanup = () => {
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('error', onError);
    };
    video.addEventListener('loadeddata', onReady);
    video.addEventListener('error', onError);
    void video.play().catch(() => {
      // Autoplay may fail; loadeddata is enough for a still frame.
    });
  });

  video.pause();
  video.currentTime = 0;

  const width = video.videoWidth || 0;
  const height = video.videoHeight || 0;
  if (width < 8 || height < 8) {
    throw new Error('Kunne ikke sjekke video.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Kunne ikke sjekke video.');
  ctx.drawImage(video, 0, 0, width, height);
  video.removeAttribute('src');
  video.load();
  return canvas;
}

/**
 * Classify local/remote media. Throws Error with NSFW_REJECT_MESSAGE when blocked.
 * On native (no DOM), skips classification — server-side moderation can follow later.
 */
export async function assertMediaAllowed(
  uri: string,
  mediaType: MediaType
): Promise<void> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    console.warn(
      '[nsfw] Client moderation runs on web only; skipping on',
      Platform.OS
    );
    return;
  }

  const model = await loadModel();

  let input: HTMLImageElement | HTMLCanvasElement;
  if (mediaType === 'video') {
    input = await videoFirstFrame(uri);
  } else {
    input = await loadHtmlImage(uri);
  }

  const predictions = await model.classify(input);
  if (exceedsThreshold(predictions)) {
    throw new Error(NSFW_REJECT_MESSAGE);
  }
}
