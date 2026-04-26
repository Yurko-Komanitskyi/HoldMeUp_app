import type { AnnotationData } from '../model/types';

export function normalizeAnnotationData(raw: unknown): AnnotationData | null {
  if (!raw) return null;

  let parsed: unknown = raw;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }

  if (parsed == null || typeof parsed !== 'object') return null;
  const candidate = parsed as Partial<AnnotationData>;
  if (!Array.isArray(candidate.shapes)) return null;
  if (typeof candidate.canvasWidth !== 'number' || typeof candidate.canvasHeight !== 'number') {
    return null;
  }
  return candidate as AnnotationData;
}
