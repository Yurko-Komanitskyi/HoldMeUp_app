import { apiClient } from '@/shared/api/axios';
import type { FileType, FileResponse } from '../model/types';
export async function uploadFile(file: any): Promise<FileType> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<FileResponse>('/api/v1/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data.file;
}
