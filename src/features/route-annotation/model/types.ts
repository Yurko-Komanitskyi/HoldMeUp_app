import { CIRCLE_SIZES } from '../lib/constants';

export interface AnnotationCircle {
  type: 'circle';
  id: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
}

export interface AnnotationPath {
  type: 'path';
  id: string;
  d: string;
  color: string;
  strokeWidth: number;
}

export type AnnotationShape = AnnotationCircle | AnnotationPath;

export interface AnnotationData {
  canvasWidth: number;
  canvasHeight: number;
  shapes: AnnotationShape[];
  mergedImageUrl?: string;
}

export type Tool = 'circle' | 'path' | 'erase';
export type CircleSizeLabel = (typeof CIRCLE_SIZES)[number]['label'];

