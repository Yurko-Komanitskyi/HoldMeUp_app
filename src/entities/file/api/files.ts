import { apiClient } from '@/shared/api/axios';
import type { FileType, FileResponse } from '../model/types';

function guessMimeType(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic' || ext === 'heif') return 'image/heic';
  return 'image/jpeg';
}

function toUploadPart(file: unknown) {
  if (typeof file === 'string') {
    const uri = file;
    const name = uri.split('/').pop() || `photo-${Date.now()}.jpg`;
    return {
      uri,
      name,
      type: guessMimeType(uri),
    } as unknown as Blob;
  }
  return file as Blob;
}

export async function uploadFile(file: any): Promise<FileType> {
  const formData = new FormData();
  formData.append('file', toUploadPart(file));

  const { data } = await apiClient.post<FileResponse>('/api/v1/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data.file;
}
