import { apiClient } from './axios';

interface UploadedFile {
  id: string;
  path: string;
}

export async function uploadFile(localUri: string, mimeType = 'image/jpeg'): Promise<UploadedFile> {
  const ext = mimeType.split('/')[1] ?? 'jpg';
  const fileName = `upload_${Date.now()}.${ext}`;

  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const { data } = await apiClient.post<{ file: UploadedFile }>('/api/v1/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.file;
}
