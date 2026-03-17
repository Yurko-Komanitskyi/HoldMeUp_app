import * as React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import { Controller } from 'react-hook-form';
import { CheckCircle2, ImagePlus, X, Upload, ScanLine, Pencil } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { Input } from '@/shared/ui/input';
import { ServerErrorBanner } from '@/shared/ui/server-error-banner';
import { RouteAnnotator } from '@/features/route-annotation/ui/route-annotator';
import { ACCENT } from '@/shared/config/palette';
import { GRADES, HOLD_TYPES, ROUTE_COLORS } from '@/entities/route/lib/constants';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useSectorsQuery } from '@/entities/sector/model/useSectorsQuery';
import { useRouteForm } from '@/features/route/route-form/model/useRouteForm';

export type {
  RouteFormSubmitData,
  RouteFormInitialValues,
} from '@/features/route/route-form/model/useRouteForm';
import type {
  RouteFormInitialValues,
  RouteFormSubmitData,
} from '@/features/route/route-form/model/useRouteForm';

interface RouteFormWidgetProps {
  initialValues?: RouteFormInitialValues;
  title?: string;
  subtitle?: string;
  submitLabel: string;
  onSubmitForm: (data: RouteFormSubmitData) => Promise<void>;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </Text>
  );
}

function SelectChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderColor: selected ? ACCENT : 'rgba(128,128,128,0.3)',
        backgroundColor: selected ? ACCENT + '22' : 'transparent',
      }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: selected ? '700' : '400',
          color: selected ? ACCENT : 'rgba(128,128,128,0.8)',
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const currentGymId = useGymMemberStore((s) => s.currentGymId);
  const { data: sectors = [] } = useSectorsQuery(currentGymId);

  const inputBg = isDark ? '#1a1a2e' : '#f4f4f8';
  const inputColor = isDark ? '#ffffff' : '#000000';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  const iconColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

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
    errors,
    isSubmitting,
  } = state;
  const { setAnnotatorVisible, setAnnotationData, pickPhoto, removePhoto, toggleHoldType, submit } =
    actions;

  const bgColor = isDark ? '#000000' : '#ffffff';
  const borderTopColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: bgColor }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 110 }}>
          <View style={{ gap: 24, paddingHorizontal: 16, paddingTop: 20 }}>
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
              <SectionTitle>Назва маршруту</SectionTitle>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="напр. Стіна рапторів"
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
              <SectionTitle>Статус</SectionTitle>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {(['active', 'draft'] as const).map((s) => {
                  const isSelected = selectedStatus === s;
                  const accentColor = s === 'active' ? '#22c55e' : '#f59e0b';
                  const label = s === 'active' ? 'Активний' : 'Чернетка';
                  const sub = s === 'active' ? 'Відкритий для пролазів' : 'Ще не відкрито';
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
                        borderColor: isSelected
                          ? accentColor
                          : isDark
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(0,0,0,0.1)',
                        backgroundColor: isSelected
                          ? accentColor + '1a'
                          : isDark
                            ? 'rgba(255,255,255,0.03)'
                            : 'rgba(0,0,0,0.02)',
                      }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '700',
                          color: isSelected
                            ? accentColor
                            : isDark
                              ? 'rgba(255,255,255,0.55)'
                              : 'rgba(0,0,0,0.5)',
                        }}>
                        {label}
                      </Text>
                      <Text
                        style={{
                          marginTop: 3,
                          fontSize: 11,
                          color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)',
                        }}>
                        {sub}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Grade */}
            <View>
              <SectionTitle>{`Категорія${selectedGrade ? ` — ${selectedGrade}` : ''}`}</SectionTitle>
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
                          borderColor: isActive ? ACCENT : 'rgba(128,128,128,0.3)',
                          backgroundColor: isActive ? ACCENT + '22' : 'transparent',
                        }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: isActive ? ACCENT : 'rgba(128,128,128,0.8)',
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
              <SectionTitle>Колір зачіпок</SectionTitle>
              {errors.color && (
                <Text className="mb-2 text-xs text-destructive">{errors.color.message}</Text>
              )}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {ROUTE_COLORS.map((c) => {
                  const isSelected = selectedColor === c.value;
                  const isMulticolor = c.value === 'multicolor';
                  const isWhite = c.value === 'white';
                  const textOnSwatch = isWhite || isMulticolor ? '#374151' : '#fff';
                  return (
                    <Pressable
                      key={c.value}
                      onPress={() => setValue('color', c.value)}
                      style={{ width: 68, alignItems: 'center', gap: 6 }}>
                      <View
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 18,
                          overflow: 'hidden',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: isSelected ? 3 : isWhite ? 1 : 0,
                          borderColor: isSelected ? ACCENT : '#d1d5db',
                          shadowColor: c.hex ?? '#000',
                          shadowOpacity: isSelected ? 0.65 : 0.2,
                          shadowRadius: isSelected ? 9 : 3,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: isSelected ? 7 : 2,
                          transform: [{ scale: isSelected ? 1.1 : 1 }],
                        }}>
                        {isMulticolor ? (
                          <LinearGradient
                            colors={[
                              '#ef4444',
                              '#f97316',
                              '#eab308',
                              '#22c55e',
                              '#3b82f6',
                              '#a855f7',
                            ]}
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
                            {isSelected && <CheckCircle2 size={22} color={textOnSwatch} />}
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
                            {isSelected && <CheckCircle2 size={22} color={textOnSwatch} />}
                          </View>
                        )}
                      </View>
                      <Text
                        className="text-center text-xs"
                        style={{
                          color: isSelected
                            ? isMulticolor
                              ? '#f97316'
                              : (c.hex ?? ACCENT)
                            : isDark
                              ? 'rgba(255,255,255,0.5)'
                              : 'rgba(0,0,0,0.5)',
                          fontWeight: isSelected ? '700' : '400',
                        }}
                        numberOfLines={1}>
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Sector */}
            <View>
              <SectionTitle>Сектор</SectionTitle>
              {errors.sectorId && (
                <Text className="mb-2 text-xs text-destructive">{errors.sectorId.message}</Text>
              )}
              {sectors.length === 0 ? (
                <View
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                    paddingVertical: 24,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                    }}>
                    {currentGymId ? 'Секторів у залі немає' : 'Спершу оберіть зал'}
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {sectors.map((s) => (
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
              <SectionTitle>{"Типи тримок (необов'язково)"}</SectionTitle>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {HOLD_TYPES.map((h) => (
                  <SelectChip
                    key={h.value}
                    label={h.label}
                    selected={selectedHoldTypes.includes(h.value)}
                    onPress={() => toggleHoldType(h.value)}
                  />
                ))}
              </View>
            </View>

            {/* Tags */}
            <View>
              <SectionTitle>{"Теги (необов'язково)"}</SectionTitle>
              <Controller
                control={control}
                name="tags"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="напр. технічний, overhang, нависання"
                    placeholderTextColor={placeholderColor}
                    style={{
                      backgroundColor: inputBg,
                      color: inputColor,
                      fontSize: 14,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}
                    returnKeyType="next"
                  />
                )}
              />
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                }}>
                Через кому
              </Text>
            </View>

            {/* Height */}
            <View>
              <SectionTitle>{"Висота маршруту (необов'язково)"}</SectionTitle>
              <Controller
                control={control}
                name="height"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: inputBg,
                    }}>
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                      placeholder="напр. 5.5"
                      placeholderTextColor={placeholderColor}
                      style={{ flex: 1, color: inputColor, fontSize: 15 }}
                      returnKeyType="next"
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                      }}>
                      м
                    </Text>
                  </View>
                )}
              />
            </View>

            {/* Description */}
            <View>
              <SectionTitle>{"Опис (необов'язково)"}</SectionTitle>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                    placeholder="Особливості маршруту, поради..."
                    placeholderTextColor={placeholderColor}
                    style={{
                      backgroundColor: inputBg,
                      color: inputColor,
                      fontSize: 14,
                      borderRadius: 16,
                      padding: 16,
                      minHeight: 96,
                      textAlignVertical: 'top',
                    }}
                  />
                )}
              />
            </View>

            {/* Photo */}
            <View>
              <SectionTitle>{"Фото маршруту (необов'язково)"}</SectionTitle>
              {localPhotoUri ? (
                <View
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                  }}>
                  <View style={{ position: 'relative' }}>
                    {/* превʼю з анотаціями (локально) */}
                    {annotationData ? (
                      <View
                        style={{
                          width: '100%',
                          aspectRatio:
                            annotationData.canvasHeight > 0
                              ? annotationData.canvasWidth / annotationData.canvasHeight
                              : 4 / 3,
                        }}>
                        <Image
                          source={{ uri: localPhotoUri }}
                          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                          resizeMode="cover"
                        />
                        <Svg
                          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                          width="100%"
                          height="100%">
                          {annotationData.shapes.map((shape, idx) => {
                            if (shape.type === 'circle') {
                              const cx = (shape.cx / annotationData.canvasWidth) * 100;
                              const cy = (shape.cy / annotationData.canvasHeight) * 100;
                              const r =
                                (shape.r /
                                  Math.max(
                                    annotationData.canvasWidth,
                                    annotationData.canvasHeight
                                  )) *
                                100;
                              return (
                                <SvgCircle
                                  key={shape.id ?? `c-${idx}`}
                                  cx={`${cx}%`}
                                  cy={`${cy}%`}
                                  r={`${r}%`}
                                  stroke={shape.color}
                                  strokeWidth={2}
                                  fill={shape.color + '40'}
                                />
                              );
                            }
                            return null;
                          })}
                        </Svg>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: localPhotoUri }}
                        style={{ width: '100%', aspectRatio: 4 / 3 }}
                        resizeMode="cover"
                      />
                    )}
                    {annotationData && annotationData.shapes.length > 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          backgroundColor: '#3b82f6',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                        <ScanLine size={12} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                          {annotationData.shapes.length} позначок
                        </Text>
                      </View>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTopWidth: 1,
                      borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                    }}>
                    <View style={{ flex: 1 }}>
                      {uploading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <ActivityIndicator size="small" color={iconColor} />
                          <Text className="text-sm text-muted-foreground">Завантаження...</Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Upload size={13} color="#22c55e" />
                          <Text style={{ color: '#22c55e', fontSize: 13 }}>Фото завантажено</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      {!uploading && (
                        <TouchableOpacity
                          onPress={() => setAnnotatorVisible(true)}
                          hitSlop={8}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                            backgroundColor: ACCENT + '22',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 12,
                          }}>
                          <Pencil size={13} color={ACCENT} />
                          <Text style={{ color: ACCENT, fontSize: 12, fontWeight: '700' }}>
                            {annotationData ? 'Змінити' : 'Розмітити'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <Pressable onPress={removePhoto} hitSlop={8} style={{ padding: 4 }}>
                        <X size={16} color={iconColor} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={pickPhoto}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderStyle: 'dashed',
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    paddingVertical: 32,
                  }}>
                  <ImagePlus size={22} color={iconColor} />
                  <Text className="text-sm font-medium text-muted-foreground">
                    Вибрати з галереї
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Submit button — fixed at bottom */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderTopWidth: 1,
            borderTopColor,
            backgroundColor: bgColor,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 32 : 20,
          }}>
          <TouchableOpacity
            onPress={submit}
            disabled={isSubmitting || uploading}
            activeOpacity={0.82}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 16,
              paddingVertical: 15,
              backgroundColor: isDark ? '#ffffff' : '#000000',
              opacity: isSubmitting || uploading ? 0.55 : 1,
            }}>
            {isSubmitting ? (
              <ActivityIndicator color={isDark ? '#000' : '#fff'} />
            ) : (
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '800',
                  color: isDark ? '#000000' : '#ffffff',
                  letterSpacing: -0.3,
                }}>
                {submitLabel}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
