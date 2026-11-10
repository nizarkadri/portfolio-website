import fs from 'fs';
import path from 'path';

/** Certificates held in total. Frames without an image on file render as reserved. */
export const CERTIFICATE_SLOTS = 17;

export interface Certificate {
  src: string;
  title: string;
  issuer?: string;
  date?: string;
}

type Meta = Record<string, { title?: string; issuer?: string; date?: string }>;

const DIR = path.join(process.cwd(), 'public', 'images', 'certificates');
const SMALL = new Set(['a', 'an', 'and', 'for', 'in', 'of', 'on', 'the', 'to', 'with']);

function deslugify(name: string) {
  return name
    .replace(/\.[a-z0-9]+$/i, '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w, i) => (i > 0 && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

/**
 * Reads public/images/certificates at render time. Drop a new image into the
 * folder and it takes the next frame. An optional certificates.json in the same
 * folder (keyed by file name without extension) supplies nicer titles.
 */
export function getCertificates(): Certificate[] {
  if (!fs.existsSync(DIR)) return [];
  let meta: Meta = {};
  try {
    meta = JSON.parse(fs.readFileSync(path.join(DIR, 'certificates.json'), 'utf8')) as Meta;
  } catch {
    meta = {};
  }
  return fs
    .readdirSync(DIR)
    .filter((f) => /\.(webp|avif|png|jpe?g)$/i.test(f))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => {
      const m = meta[file.replace(/\.[a-z0-9]+$/i, '')] ?? {};
      return { src: `/images/certificates/${file}`, title: m.title || deslugify(file), issuer: m.issuer, date: m.date };
    });
}
