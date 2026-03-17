import { useState } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';

import { parseApiError } from '@/shared/lib/api-error';
import { AnnotationData } from '@/features/route-annotation';
import { uploadFile } from '@/entities/file/api/files';

const schema = z.object({
  name: z.string().min(1, 'Введіть назву').max(80, 'Максимум 80 символів'),
  grade: z.string().min(1, 'Оберіть категорію'),
  color: z.string().min(1, 'Оберіть колір'),
  sectorId: z.string().min(1, 'Оберіть сектор'),
  description: z.string().optional(),
  height: z.string().optional(),
  holdTypes: z.array(z.string()).optional(),
  tags: z.string().optional(),
  status: z.enum(['active', 'draft']),
  photoUrl: z.string().optional(),
});

export type FormValues = z.infer<typeof schema>;

export type RouteFormSubmitData = {
  name: string;
  grade: string;
  color: string;
  sectorId: string;
  description: string | undefined;
  height: string | undefined;
  holdTypes: string[];
  tags: string | undefined;
  status: 'active' | 'draft';
  photoUrl: string | undefined;
  annotationData: AnnotationData | null;
};

export interface RouteFormInitialValues {
  name?: string;
  grade?: string;
  color?: string;
  sectorId?: string;
  description?: string;
  height?: string;
  holdTypes?: string[];
  tags?: string;
  status?: 'active' | 'draft';
  photoUrl?: string;
  photoDisplayUri?: string;
  annotationData?: AnnotationData | null;
}

export function useRouteForm(
  initialValues: RouteFormInitialValues | undefined,
  onSubmitForm: (data: RouteFormSubmitData) => Promise<void>
) {
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(
    initialValues?.photoDisplayUri ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [annotationData, setAnnotationData] = useState<AnnotationData | null>(
    initialValues?.annotationData ?? null
  );
  const [annotatorVisible, setAnnotatorVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? '',
      grade: initialValues?.grade ?? '',
      color: initialValues?.color ?? '',
      sectorId: initialValues?.sectorId ?? '',
      description: initialValues?.description ?? '',
      height: initialValues?.height ?? '',
      holdTypes: initialValues?.holdTypes ?? [],
      tags: initialValues?.tags ?? '',
      status: initialValues?.status ?? 'active',
      photoUrl: initialValues?.photoUrl ?? '',
    },
  });

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const selectedGrade = watch('grade');
  const selectedColor = watch('color');
  const selectedSector = watch('sectorId');
  const selectedHoldTypes = watch('holdTypes') ?? [];
  const selectedStatus = watch('status');

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Дозвіл потрібен', 'Дозволь доступ до галереї у налаштуваннях.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setLocalPhotoUri(asset.uri);
    setAnnotationData(null);
    setUploading(true);
    try {
      const uploaded = await uploadFile(asset.uri);
      setValue('photoUrl', uploaded.path);
    } catch {
      Alert.alert('Помилка', 'Не вдалося завантажити фото. Спробуй ще раз.');
      setLocalPhotoUri(null);
    } finally {
      setUploading(false);
    }
  }

  function removePhoto() {
    setLocalPhotoUri(null);
    setAnnotationData(null);
    setValue('photoUrl', '');
  }

  function toggleHoldType(value: string) {
    setValue(
      'holdTypes',
      selectedHoldTypes.includes(value)
        ? selectedHoldTypes.filter((h) => h !== value)
        : [...selectedHoldTypes, value]
    );
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await onSubmitForm({
        ...values,
        name: values.name.trim(),
        description: values.description?.trim() ?? '',
        holdTypes: values.holdTypes ?? [],
        tags: values.tags?.trim() ?? '',
        status: values.status,
        photoUrl: values.photoUrl?.trim() ?? '',
        height: values.height?.trim() ?? '',
        annotationData,
      });
    } catch (error: unknown) {
      const { message } = parseApiError(error);
      setServerError(message);
    }
  }

  return {
    form,
    state: {
      localPhotoUri,
      uploading,
      annotationData,
      annotatorVisible,
      serverError,
      selectedGrade,
      selectedColor,
      selectedSector,
      selectedHoldTypes,
      selectedStatus,
      errors,
      isSubmitting,
    },
    actions: {
      setAnnotatorVisible,
      setAnnotationData,
      pickPhoto,
      removePhoto,
      toggleHoldType,
      submit: handleSubmit(onSubmit),
      setValue,
    },
  };
}
