import * as React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Controller } from 'react-hook-form';
import { CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { ServerErrorBanner } from '@/shared/ui/server-error-banner';
import { RouteAnnotator } from '@/features/route-annotation/ui/route-annotator';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { GRADES, HOLD_TYPES, ROUTE_COLORS } from '@/entities/route/lib/constants';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import {
  useRouteForm,
  type RouteFormInitialValues,
  type RouteFormSubmitData,
} from '@/widgets/edit-route/ui/useRouteForm';
import type { RouteStyle } from '@/entities/route/model/route';


import { RouteFormPhoto } from './route-form-photo';
import { RouteFormSubmitBar } from './route-form-submit';
import { useSectorsQuery } from '@/entities/sector/model/sectorHooks';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

interface RouteFormWidgetProps {
  initialValues?: RouteFormInitialValues;
  title?: string;
  subtitle?: string;
  submitLabel: string;
  onSubmitForm: (data: RouteFormSubmitData) => Promise<void>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text
      className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      style={{ marginBottom: 14 }}>
      {children}
    </Text>
  );
}

function SelectChip({
  label,
  selected,
  onPress,
  accentColor,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  accentColor?: string;
}) {
  const colors = useThemeColor();
  const color = accentColor ?? ACCENT;
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderColor: selected ? color : colors.border,
        backgroundColor: selected ? color + '1a' : 'transparent',
      }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: selected ? '700' : '400',
          color: selected ? color : colors.mutedForeground,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function RouteFormWidget({
  initialValues,
  title,
  subtitle,
  submitLabel,
  onSubmitForm,
}: RouteFormWidgetProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const isDark = colors.isDark;

  const STYLE_OPTIONS = React.useMemo(
    (): { value: RouteStyle; label: string; color: string }[] => [
      { value: 'boulder', label: t('routes.styleKeys.boulder'), color: '#f59e0b' },
      { value: 'lead', label: t('routes.styleKeys.lead'), color: '#3b82f6' },
      { value: 'top_rope', label: t('routes.styleKeys.top_rope'), color: '#22c55e' },
      { value: 'speed', label: t('routes.styleKeys.speed'), color: '#ef4444' },
    ],
    [t]
  );

  const currentGymId = useGymMemberStore((s) => s.currentGymId);
  const {
    data: sectors = [],
    isError: sectorsError,
    isLoading: sectorsLoading,
    error: sectorsQueryError,
    refetch: refetchSectors,
  } = useSectorsQuery(currentGymId ?? '');

  const iconColor = colors.mutedForeground;

  const { form, state, actions } = useRouteForm(initialValues, onSubmitForm);
  const { control, setValue } = form;
  const {
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
  } = state;
  const { setAnnotatorVisible, setAnnotationData, pickPhoto, removePhoto, toggleHoldType, submit } =
    actions;

  const bgColor = colors.background;
  const borderTopColor = colors.border;

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: bgColor }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 128 }}>
          <View style={{ gap: 28, paddingHorizontal: 20, paddingTop: 24 }}>
            {sectorsError && !sectorsLoading ? (
              <QueryErrorPanel
                error={sectorsQueryError ?? new Error('')}
                onRetry={() => void refetchSectors()}
              />
            ) : null}
            {(title || subtitle) && (
              <View>
                {title && <Text className="text-2xl font-bold text-foreground">{title}</Text>}
                {subtitle && (
                  <Text className="mt-0.5 text-sm text-muted-foreground">{subtitle}</Text>
                )}
              </View>
            )}

            <ServerErrorBanner message={serverError} />

            {/* Name */}
            <View>
              <SectionTitle>{t('routeForm.routeName')}</SectionTitle>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('routeForm.namePlaceholder')}
                    returnKeyType="next"
                  />
                )}
              />
              {errors.name && (
                <Text className="mt-1 text-xs text-destructive">{errors.name.message}</Text>
              )}
            </View>

            {/* Status */}
            <View>
              <SectionTitle>{t('routeForm.status')}</SectionTitle>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {(['active', 'draft'] as const).map((s) => {
                  const isSelected = selectedStatus === s;
                  const accentColor = s === 'active' ? '#22c55e' : '#f59e0b';
                  const label = s === 'active' ? t('routeForm.statusActive') : t('routeForm.statusDraft');
                  const sub =
                    s === 'active' ? t('routeForm.statusActiveSub') : t('routeForm.statusDraftSub');
                  return (
                    <Pressable
                      key={s}
                      onPress={() => setValue('status', s)}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        borderRadius: 16,
                        paddingVertical: 13,
                        borderWidth: 1.5,
                        borderColor: isSelected ? accentColor : colors.border,
                        backgroundColor: isSelected ? accentColor + '1a' : colors.muted,
                      }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '700',
                          color: isSelected ? accentColor : colors.mutedForeground,
                        }}>
                        {label}
                      </Text>
                      <Text
                        style={{
                          marginTop: 3,
                          fontSize: 11,
                          color: colors.mutedForeground,
                        }}>
                        {sub}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Style */}
            <View>
              <SectionTitle>{t('routeForm.style')}</SectionTitle>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {STYLE_OPTIONS.map((opt) => {
                  const isSelected = selectedStyle === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() =>
                        setValue('style', isSelected ? undefined : opt.value)
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 7,
                        borderRadius: 12,
                        borderWidth: 1,
                        paddingHorizontal: 14,
                        paddingVertical: 9,
                        borderColor: isSelected ? opt.color : colors.border,
                        backgroundColor: isSelected ? opt.color + '1a' : 'transparent',
                      }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: isSelected ? opt.color : colors.muted,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: isSelected ? '700' : '400',
                          color: isSelected ? opt.color : colors.mutedForeground,
                        }}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Grade */}
            <View>
              <SectionTitle>
                {selectedGrade
                  ? t('routeForm.gradeWithValue', { grade: selectedGrade })
                  : t('routeForm.gradeSection')}
              </SectionTitle>
              {errors.grade && (
                <Text className="mb-2 text-xs text-destructive">{errors.grade.message}</Text>
              )}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {GRADES.map((g) => {
                    const isActive = selectedGrade === g;
                    return (
                      <Pressable
                        key={g}
                        onPress={() => setValue('grade', g)}
                        style={{
                          height: 48,
                          minWidth: 52,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: isActive ? ACCENT : colors.border,
                          backgroundColor: isActive ? ACCENT + '1a' : 'transparent',
                        }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: isActive ? ACCENT : colors.mutedForeground,
                          }}>
                          {g}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Color */}
            <View>
              <SectionTitle>{t('routeForm.holdColor')}</SectionTitle>
              {errors.color && (
                <Text className="mb-2 text-xs text-destructive">{errors.color.message}</Text>
              )}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 14, paddingVertical: 6, paddingRight: 4 }}>
                {ROUTE_COLORS.map((c) => {
                  const isSelected = selectedColor === c.value;
                  const isMulticolor = c.value === 'multicolor';
                  const isWhite = c.value === 'white';
                  const checkColor = isWhite ? '#1f2937' : '#ffffff';
                  return (
                    <Pressable
                      key={c.value}
                      onPress={() => setValue('color', c.value)}
                      style={{ width: 76, alignItems: 'center', gap: 8 }}>
                      <View
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 16,
                          overflow: 'hidden',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: isSelected ? 3 : isWhite ? 1.5 : 0,
                          borderColor: isSelected ? ACCENT : colors.border,
                          shadowColor: '#000',
                          shadowOpacity: isSelected ? 0.25 : 0.08,
                          shadowRadius: isSelected ? 6 : 3,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: isSelected ? 4 : 2,
                        }}>
                        {isMulticolor ? (
                          <LinearGradient
                            colors={['#ef4444', '#eab308', '#22c55e', '#3b82f6', '#a855f7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            {isSelected && <CheckCircle2 size={20} color={checkColor} />}
                          </LinearGradient>
                        ) : (
                          <View
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: c.hex!,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            {isSelected && <CheckCircle2 size={20} color={checkColor} />}
                          </View>
                        )}
                      </View>
                      <Text
                        className="text-center text-[11px] leading-tight"
                        style={{
                          color: isSelected
                            ? isMulticolor
                              ? '#f97316'
                              : (c.hex ?? ACCENT)
                            : colors.mutedForeground,
                          fontWeight: isSelected ? '700' : '500',
                        }}
                        numberOfLines={2}>
                        {t(`routeColors.${c.value}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Sector */}
            <View>
              <SectionTitle>{t('routeForm.sector')}</SectionTitle>
              {errors.sectorId && (
                <Text className="mb-2 text-xs text-destructive">{errors.sectorId.message}</Text>
              )}
              {sectors.length === 0 ? (
                <View
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: colors.border,
                    paddingVertical: 24,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.mutedForeground,
                    }}>
                    {currentGymId ? t('routeForm.noSectorsInGym') : t('routeForm.selectGymFirst')}
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {sectors.map((s: { id: string; name: string }) => (
                    <SelectChip
                      key={s.id}
                      label={s.name}
                      selected={selectedSector === s.id}
                      onPress={() => setValue('sectorId', s.id)}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Hold Types */}
            <View>
              <SectionTitle>{t('routeForm.holdTypesOptional')}</SectionTitle>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {HOLD_TYPES.map((h) => (
                  <SelectChip
                    key={h.value}
                    label={t(`holdTypes.${h.value}`)}
                    selected={selectedHoldTypes.includes(h.value)}
                    onPress={() => toggleHoldType(h.value)}
                  />
                ))}
              </View>
            </View>

            {/* Tags */}
            <View>
              <SectionTitle>{t('routeForm.tagsOptional')}</SectionTitle>
              <Controller
                control={control}
                name="tags"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('routeForm.tagsPlaceholder')}
                    returnKeyType="next"
                  />
                )}
              />
              <Text className="mt-1.5 text-[11px] text-muted-foreground">{t('common.tagsCommaHint')}</Text>
            </View>

            {/* Height */}
            <View>
              <SectionTitle>{t('routeForm.heightOptional')}</SectionTitle>
              <Controller
                control={control}
                name="height"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="flex-row items-center gap-2">
                    <Input
                      className="flex-1"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                      placeholder={t('routeForm.heightPlaceholder')}
                      returnKeyType="next"
                    />
                    <Text className="text-sm text-muted-foreground">{t('common.meter')}</Text>
                  </View>
                )}
              />
            </View>

            {/* Description */}
            <View>
              <SectionTitle>{t('routeForm.descriptionOptional')}</SectionTitle>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Textarea
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('routeForm.descriptionPlaceholder')}
                    numberOfLines={8}
                    className="rounded-xl px-4 py-3"
                  />
                )}
              />
            </View>

            {/* Photo */}
            <View>
              <SectionTitle>{t('routeForm.photoOptional')}</SectionTitle>
              <RouteFormPhoto
                localPhotoUri={localPhotoUri}
                annotationData={annotationData}
                uploading={uploading}
                isDark={isDark}
                iconColor={iconColor}
                onPickPhoto={pickPhoto}
                onRemovePhoto={removePhoto}
                onOpenAnnotator={() => setAnnotatorVisible(true)}
              />
            </View>
          </View>
        </ScrollView>

        <RouteFormSubmitBar
          bgColor={bgColor}
          borderTopColor={borderTopColor}
          isSubmitting={isSubmitting}
          uploading={uploading}
          submitLabel={submitLabel}
          onSubmit={submit}
        />
      </KeyboardAvoidingView>

      {localPhotoUri && (
        <RouteAnnotator
          visible={annotatorVisible}
          photoUri={localPhotoUri}
          initial={annotationData}
          onSave={(data) => setAnnotationData(data)}
          onClose={() => setAnnotatorVisible(false)}
        />
      )}
    </View>
  );
}
