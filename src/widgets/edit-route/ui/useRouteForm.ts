import * as React from 'react';
import { useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import { parseApiError } from '@/shared/lib/api-error';
import { AnnotationData } from '@/features/route-annotation';
import { uploadFile } from '@/entities/file/api/files';
import { useToastStore } from '@/shared/ui/app-toast';

const ROUTE_STYLES = ['boulder', 'lead', 'top_rope', 'speed'] as const;

export type FormValues = {
  name: string;
  grade: string;
  color: string;
  sectorId: string;
  style?: (typeof ROUTE_STYLES)[number];
  description?: string;
  height: string;
  holdTypes?: string[];
  tags?: string;
  status: 'active' | 'archived';
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
  status: 'active' | 'archived';
  photoUrl: string | undefined;
  annotationData: AnnotationData | null;
};

export type RouteFormScrollOptions = {
  onInvalidSubmit?: (errors: FieldErrors<FormValues>) => void;
  onServerError?: () => void;
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
  status?: 'active' | 'archived';
  photoUrl?: string;
  photoDisplayUri?: string;
  annotationData?: AnnotationData | null;
}

export function useRouteForm(
  initialValues: RouteFormInitialValues | undefined,
  onSubmitForm: (data: RouteFormSubmitData) => Promise<void>,
  scrollOptions?: RouteFormScrollOptions
) {
  const { t } = useTranslation();
  const toast = useToastStore();
  const scrollOptionsRef = React.useRef(scrollOptions);
  scrollOptionsRef.current = scrollOptions;

  const schema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('validation.routeNameRequired')).max(80, t('validation.max80')),
        grade: z.string().min(1, t('validation.pickGrade')),
        color: z.string().min(1, t('validation.pickColor')),
        sectorId: z.string().min(1, t('validation.pickSector')),
        style: z.enum(ROUTE_STYLES).optional(),
        description: z.string().max(2000, t('validation.maxDescription')).optional(),
        height: z
          .string()
          .refine(
            (val) => {
              const v = val.trim();
              if (v === '') return true;
              const n = parseFloat(v);
              return !Number.isNaN(n) && n > 0 && n <= 200;
            },
            { message: t('validation.heightInvalid') }
          ),
        holdTypes: z.array(z.string()).optional(),
        tags: z.string().max(500, t('validation.maxTags')).optional(),
        status: z.enum(['active', 'archived']),
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
  const [photoSourceVisible, setPhotoSourceVisible] = useState(false);
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

  async function uploadPickedAsset(asset: ImagePicker.ImagePickerAsset) {
    setLocalPhotoUri(asset.uri);
    setAnnotationData(null);
    setUploading(true);
    try {
      const uploaded = await uploadFile(asset.uri);
      setValue('photoUrl', uploaded.path);
    } catch {
      toast.show('error', t('common.photoUploadFailed'));
      setLocalPhotoUri(null);
      setValue('photoUrl', '');
    } finally {
      setUploading(false);
    }
  }

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.show('error', t('common.galleryPermissionTitle'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;
    await uploadPickedAsset(result.assets[0]);
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      toast.show('error', t('common.cameraPermissionTitle'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: false,
      cameraType: ImagePicker.CameraType.back,
    });
    if (result.canceled || !result.assets[0]) return;
    await uploadPickedAsset(result.assets[0]);
  }

  function pickPhoto() {
    setPhotoSourceVisible(true);
  }

  async function pickPhotoFromGallery() {
    setPhotoSourceVisible(false);
    await pickFromGallery();
  }

  async function pickPhotoFromCamera() {
    setPhotoSourceVisible(false);
    await pickFromCamera();
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
      scrollOptionsRef.current?.onServerError?.();
    }
  }

  return {
    form,
    state: {
      localPhotoUri,
      uploading,
      annotationData,
      annotatorVisible,
      photoSourceVisible,
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
      setPhotoSourceVisible,
      setAnnotationData,
      pickPhoto,
      pickPhotoFromGallery,
      pickPhotoFromCamera,
      removePhoto,
      toggleHoldType,
      submit: handleSubmit(onSubmit, (errors) => {
        scrollOptionsRef.current?.onInvalidSubmit?.(errors);
      }),
      setValue,
    },
  };
}
