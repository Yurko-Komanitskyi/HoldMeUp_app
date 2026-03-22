import * as React from 'react';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import { parseApiError } from '@/shared/lib/api-error';
import { AnnotationData } from '@/features/route-annotation';
import { uploadFile } from '@/entities/file/api/files';

const ROUTE_STYLES = ['boulder', 'lead', 'top_rope', 'speed'] as const;

export type FormValues = {
  name: string;
  grade: string;
  color: string;
  sectorId: string;
  style?: (typeof ROUTE_STYLES)[number];
  description?: string;
  height?: string;
  holdTypes?: string[];
  tags?: string;
  status: 'active' | 'draft';
  photoUrl?: string;
};

export type RouteFormSubmitData = {
  name: string;
  grade: string;
  color: string;
  sectorId: string;
  style?: (typeof ROUTE_STYLES)[number];
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
  style?: (typeof ROUTE_STYLES)[number];
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
  const { t } = useTranslation();

  const schema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('validation.routeNameRequired')).max(80, t('validation.max80')),
        grade: z.string().min(1, t('validation.pickGrade')),
        color: z.string().min(1, t('validation.pickColor')),
        sectorId: z.string().min(1, t('validation.pickSector')),
        style: z.enum(ROUTE_STYLES).optional(),
        description: z.string().optional(),
        height: z.string().optional(),
        holdTypes: z.array(z.string()).optional(),
        tags: z.string().optional(),
        status: z.enum(['active', 'draft']),
        photoUrl: z.string().optional(),
      }),
    [t]
  );

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
      style: initialValues?.style ?? undefined,
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
  const selectedStyle = watch('style');

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('common.galleryPermissionTitle'), t('common.galleryPermissionBody'));
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
      Alert.alert(t('common.errorTitle'), t('common.photoUploadFailed'));
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
      selectedStyle,
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
