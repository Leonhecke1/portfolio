import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const STRINGS = {
  de: {
    drop: 'Bild hierher ziehen oder auswählen',
    choose: 'Bild auswählen',
    sample: 'Beispielbild verwenden',
    sampleNote: 'Das Beispielbild wird im Browser gezeichnet.',
    format: 'Format',
    quality: 'Qualität',
    maxWidth: 'Maximale Breite',
    original: 'Original',
    compressed: 'Komprimiert',
    saved: 'gespart',
    larger: 'größer als das Original',
    download: 'Herunterladen',
    compare: 'Vergleich: Original links, komprimiert rechts',
    working: 'Wird komprimiert …',
    unsupported: 'Dein Browser kann dieses Format nicht erzeugen; es wurde PNG verwendet.',
    error: 'Diese Datei konnte nicht als Bild gelesen werden.',
  },
  en: {
    drop: 'Drop an image here or choose one',
    choose: 'Choose image',
    sample: 'Use sample image',
    sampleNote: 'The sample image is drawn in the browser.',
    format: 'Format',
    quality: 'Quality',
    maxWidth: 'Max width',
    original: 'Original',
    compressed: 'Compressed',
    saved: 'saved',
    larger: 'larger than the original',
    download: 'Download',
    compare: 'Comparison: original left, compressed right',
    working: 'Compressing …',
    unsupported: 'Your browser cannot encode this format; PNG was used instead.',
    error: 'This file could not be read as an image.',
  },
};

type Format = 'image/webp' | 'image/jpeg' | 'image/avif';
const FORMATS: { value: Format; label: string }[] = [
  { value: 'image/webp', label: 'WebP' },
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/avif', label: 'AVIF' },
];

const formatBytes = (n: number) => (n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`);

// A procedural landscape so the demo works without an upload.
const drawSample = (): Promise<Blob> => {
  const c = document.createElement('canvas');
  c.width = 1600;
  c.height = 1000;
  const g = c.getContext('2d')!;
  for (let y = 0; y < c.height; y++) {
    const t = y / c.height;
    g.fillStyle = `rgb(${Math.round(120 + 110 * t)}, ${Math.round(170 + 60 * t)}, ${Math.round(235 - 20 * t)})`;
    g.fillRect(0, y, c.width, 1);
  }
  g.fillStyle = '#ffd36b';
  g.beginPath();
  g.arc(1180, 260, 90, 0, Math.PI * 2);
  g.fill();
  const ridge = (base: number, amp: number, color: string, seed: number) => {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, c.height);
    for (let x = 0; x <= c.width; x += 8) {
      g.lineTo(x, base - amp * (Math.sin(x / 210 + seed) * 0.6 + Math.sin(x / 67 + seed * 2) * 0.25 + Math.sin(x / 23 + seed) * 0.08));
    }
    g.lineTo(c.width, c.height);
    g.fill();
  };
  ridge(560, 180, '#6d8fb3', 1);
  ridge(680, 140, '#3f6b5a', 3);
  ridge(820, 90, '#2d4d3c', 5);
  // Fine grain so compression has detail to work on.
  const img = g.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  return new Promise((resolve) => c.toBlob((b) => resolve(b!), 'image/png'));
};

const ImageCompressor: React.FC = () => {
  const { language } = useLanguage();
  const s = STRINGS[language];
  const [source, setSource] = useState<{ blob: Blob; url: string; name: string; width: number; height: number } | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string; type: string; key: string } | null>(null);
  const [format, setFormat] = useState<Format>('image/webp');
  const [quality, setQuality] = useState(0.72);
  const [maxWidth, setMaxWidth] = useState(1600);
  const [split, setSplit] = useState(50);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback((blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      setError('');
      setSource((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { blob, url, name, width: img.naturalWidth, height: img.naturalHeight };
      });
      setMaxWidth(Math.min(img.naturalWidth, 1600));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError(s.error);
    };
    img.src = url;
  }, [s.error]);

  // Re-encode whenever the source or a setting changes.
  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    const key = `${source.url}|${format}|${quality}|${maxWidth}`;
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      const g = c.getContext('2d')!;
      if (format === 'image/jpeg') {
        g.fillStyle = '#ffffff';
        g.fillRect(0, 0, c.width, c.height);
      }
      g.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((blob) => {
        if (cancelled || !blob) return;
        setResult((prev) => {
          if (prev) URL.revokeObjectURL(prev.url);
          return { blob, url: URL.createObjectURL(blob), type: blob.type, key };
        });
      }, format, quality);
    };
    img.src = source.url;
    return () => {
      cancelled = true;
    };
  }, [source, format, quality, maxWidth]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) load(file, file.name);
  };

  // The result is stale while a newer encode for the current settings is running.
  const busy = !source || !result || result.key !== `${source.url}|${format}|${quality}|${maxWidth}`;
  const delta = source && result ? 1 - result.blob.size / source.blob.size : 0;
  const ext = result?.type.split('/')[1] ?? 'png';
  const fellBack = result && result.type !== format;

  return (
    <div className="demo compressor">
      <div
        className={`dropzone${dragOver ? ' is-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <p>{s.drop}</p>
        <div className="demo-actions">
          <button type="button" className="btn" onClick={() => inputRef.current?.click()}>{s.choose}</button>
          <button type="button" className="btn-accent" onClick={() => drawSample().then((b) => load(b, 'beispiel.png'))}>{s.sample}</button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) load(file, file.name);
            e.target.value = '';
          }}
        />
        {error && <p className="demo-error" role="alert">{error}</p>}
      </div>

      {source && (
        <>
          <div className="demo-controls">
            <label className="demo-field">
              <span>{s.format}</span>
              <select value={format} onChange={(e) => setFormat(e.target.value as Format)}>
                {FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </label>
            <label className="demo-field demo-field--range">
              <span>{s.quality} <output>{Math.round(quality * 100)}</output></span>
              <input type="range" min={0.1} max={1} step={0.01} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
            </label>
            <label className="demo-field demo-field--range">
              <span>{s.maxWidth} <output>{maxWidth}px</output></span>
              <input type="range" min={200} max={source.width} step={10} value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} />
            </label>
          </div>

          <div className="compare" aria-label={s.compare} style={{ '--split': `${split}%`, aspectRatio: `${source.width} / ${source.height}` } as React.CSSProperties}>
            <img src={source.url} alt={s.original} />
            {result && <img className="compare-after" src={result.url} alt={s.compressed} />}
            <span className="compare-line" aria-hidden="true" />
            <input className="compare-range" type="range" min={0} max={100} value={split} onChange={(e) => setSplit(Number(e.target.value))} aria-label={s.compare} />
          </div>

          <dl className="demo-stats" aria-live="polite">
            <div><dt>{s.original}</dt><dd>{formatBytes(source.blob.size)}</dd></div>
            <div><dt>{s.compressed}</dt><dd>{busy || !result ? s.working : formatBytes(result.blob.size)}</dd></div>
            <div>
              <dt>{delta >= 0 ? s.saved : s.larger}</dt>
              <dd className={delta >= 0 ? 'is-good' : 'is-bad'}>{result ? `${Math.abs(Math.round(delta * 100))} %` : '–'}</dd>
            </div>
          </dl>
          {fellBack && <p className="demo-note">{s.unsupported}</p>}
          {source.name === 'beispiel.png' && <p className="demo-note">{s.sampleNote}</p>}
          {result && (
            <a className="btn" href={result.url} download={`${source.name.replace(/\.[^.]+$/, '')}-compressed.${ext}`}>{s.download}</a>
          )}
        </>
      )}
    </div>
  );
};

export default ImageCompressor;
