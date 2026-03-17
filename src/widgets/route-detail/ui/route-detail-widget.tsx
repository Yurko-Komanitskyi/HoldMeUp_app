import * as React from 'react';
import { View, ScrollView, Pressable, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Mountain,
  TrendingUp,
  Zap,
  User,
  Calendar,
  Ruler,
  Tag,
  Info,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ScanLine,
  Pencil,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/shared/ui/text';
import { Skeleton } from '@/shared/ui/skeleton';
import { ZoomableImage } from '@/features/route-annotation/ui/zoomable-image';
import { resolveRouteColor } from '@/shared/config/palette';
import { HOLD_TYPE_LABELS } from '@/entities/route/lib/constants';
import { AnnotatedPhoto } from '@/features/route-annotation';
import { StatCard } from '@/shared/ui/stat-card';
import { InfoRow } from '@/shared/ui/info-row';
import { HoldChip } from '@/entities/route/ui/hold-chip';
import { useRouteDetail } from '@/features/route-detail/model/useRouteDetail';

function LoadingState() {
  return (
    <View style={{ flex: 1 }} className="bg-background">
      <Skeleton style={{ height: 260, width: '100%' }} />
      <View style={{ gap: 16, paddingHorizontal: 16, paddingTop: 20 }}>
        <Skeleton style={{ height: 9, width: '40%', borderRadius: 8 }} />
        <Skeleton style={{ height: 32, width: '70%', borderRadius: 10 }} />
        <View style={{ flexDirection: 'row', gap: 12, paddingTop: 4 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} style={{ height: 72, flex: 1, borderRadius: 18 }} />
          ))}
        </View>
        <Skeleton style={{ marginTop: 8, height: 120, borderRadius: 18 }} />
      </View>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 32,
      }}
      className="bg-background">
      <AlertCircle size={48} color="#ef4444" />
      <Text className="text-center text-base font-semibold text-foreground">
        Не вдалося завантажити маршрут
      </Text>
      <Pressable
        onPress={onRetry}
        style={{ borderRadius: 14, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 12 }}
        className="border-border bg-card">
        <Text className="text-sm font-medium text-foreground">Спробувати знову</Text>
      </Pressable>
    </View>
  );
}

export function RouteDetailWidget() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions();

  const {
    route,
    isLoading,
    isError,
    refetch,
    canManageRoute,
    status,
    styleLabel,
    setterName,
    flashRate,
    rating,
    addedDate,
    parsedAnnotation,
    mergedImageUrl,
  } = useRouteDetail(id ?? '');

  if (isLoading) return <LoadingState />;
  if (isError || !route) return <ErrorState onRetry={refetch} />;

  const routeColor = resolveRouteColor(route.color);
  const isWhiteRoute = route.color?.toLowerCase() === 'white';
  const heroText = isWhiteRoute ? '#1a1a2a' : '#ffffff';

  const ctaBg = routeColor;
  const ctaText = heroText;

  const sectionTitleColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={{ flex: 1 }} className="bg-background">
      {/* ── Hero header ── */}
      <View style={{ backgroundColor: routeColor }}>
        <LinearGradient
          colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.25)']}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <SafeAreaView edges={['top']}>
          {/* Nav bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingTop: 4,
              paddingBottom: 12,
            }}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={8}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: 'rgba(0,0,0,0.22)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ArrowLeft size={19} color={heroText} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 10,
                  backgroundColor: 'rgba(0,0,0,0.22)',
                }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: heroText, opacity: 0.9 }}>
                  {route.sector?.name ?? 'Без сектора'}
                </Text>
              </View>
              {canManageRoute && (
                <TouchableOpacity
                  onPress={() => router.push(`/route/edit/${route.id}` as never)}
                  hitSlop={8}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    backgroundColor: 'rgba(0,0,0,0.22)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Pencil size={16} color={heroText} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Grade + badges + name */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 28, gap: 10 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
              {/* Grade */}
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 14,
                  backgroundColor: 'rgba(0,0,0,0.28)',
                }}>
                <Text
                  style={{ fontSize: 22, fontWeight: '900', color: heroText, letterSpacing: -0.5 }}>
                  {route.grade}
                </Text>
              </View>
              {/* Style */}
              {styleLabel && (
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 12,
                    backgroundColor: 'rgba(0,0,0,0.22)',
                  }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: heroText, opacity: 0.9 }}>
                    {styleLabel}
                  </Text>
                </View>
              )}
              {/* Status (only for managers) */}
              {canManageRoute && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: 'rgba(0,0,0,0.28)',
                  }}>
                  <View
                    style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: status.color }}
                  />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
                    {status.label}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '900',
                color: heroText,
                letterSpacing: -1,
                lineHeight: 36,
              }}>
              {route.name}
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ── Stats row ── */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 20 }}>
          <StatCard value={route.ascentCount ?? 0} label="Пролазів" color="#7badcf" />
          {flashRate !== null ? (
            <StatCard value={`${flashRate}%`} label="Флеш" color="#f59e0b" />
          ) : (
            <StatCard value={route.flashCount ?? 0} label="Флеш" color="#f59e0b" />
          )}
          {rating !== null ? (
            <StatCard value={`★ ${rating}`} label="Рейтинг" color="#a78bfa" />
          ) : (
            <StatCard
              value="—"
              label="Рейтинг"
              color={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}
            />
          )}
        </View>

        {/* ── Info card ── */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
            overflow: 'hidden',
          }}>
          <View style={{ paddingHorizontal: 16 }}>
            {route.sector?.name && (
              <>
                <InfoRow
                  icon={Mountain}
                  label="Сектор"
                  value={route.sector.name}
                  iconColor="#7badcf"
                />
                <View style={{ height: 1, backgroundColor: dividerColor }} />
              </>
            )}
            {styleLabel && (
              <>
                <InfoRow icon={TrendingUp} label="Стиль" value={styleLabel} iconColor="#a78bfa" />
                <View style={{ height: 1, backgroundColor: dividerColor }} />
              </>
            )}
            {route.height ? (
              <>
                <InfoRow
                  icon={Ruler}
                  label="Висота"
                  value={`${route.height} м`}
                  iconColor="#f59e0b"
                />
                <View style={{ height: 1, backgroundColor: dividerColor }} />
              </>
            ) : null}
            <InfoRow icon={User} label="Setter" value={setterName} iconColor="#7badcf" />
            {addedDate && (
              <>
                <View style={{ height: 1, backgroundColor: dividerColor }} />
                <InfoRow
                  icon={Calendar}
                  label="Додано"
                  value={addedDate}
                  iconColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                />
              </>
            )}
          </View>
        </View>

        {/* ── Hold types ── */}
        {route.holdTypes && route.holdTypes.length > 0 && (
          <View style={{ marginHorizontal: 16, marginTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Tag size={13} color={sectionTitleColor} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: sectionTitleColor,
                  textTransform: 'uppercase',
                  letterSpacing: 0.7,
                }}>
                Типи тримок
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {route.holdTypes.map((hold) => (
                <HoldChip
                  key={String(hold)}
                  label={HOLD_TYPE_LABELS[hold as string] ?? String(hold)}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Photo ── */}
        {route.photoUrl && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 16,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
              overflow: 'hidden',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ImageIcon size={14} color={sectionTitleColor} />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: isDark ? '#e0e0e8' : '#1a1a2a',
                  }}>
                  Фото маршруту
                </Text>
              </View>
              {parsedAnnotation && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: '#3b82f622',
                    paddingHorizontal: 9,
                    paddingVertical: 3,
                    borderRadius: 8,
                  }}>
                  <ScanLine size={11} color="#3b82f6" />
                  <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: '600' }}>
                    {parsedAnnotation.shapes.length} позначок
                  </Text>
                </View>
              )}
            </View>
            {mergedImageUrl ? (
              <ZoomableImage
                uri={mergedImageUrl}
                width={screenWidth - 32}
                height={(screenWidth - 32) * 0.65}
              />
            ) : parsedAnnotation ? (
              <AnnotatedPhoto
                photoUrl={route.photoUrl}
                annotationData={parsedAnnotation}
                displayWidth={screenWidth - 32}
              />
            ) : (
              <ZoomableImage
                uri={route.photoUrl}
                width={screenWidth - 32}
                height={(screenWidth - 32) * 0.65}
              />
            )}
          </View>
        )}

        {/* ── Tags ── */}
        {route.tags && route.tags.length > 0 && (
          <View style={{ marginHorizontal: 16, marginTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Info size={13} color={sectionTitleColor} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: sectionTitleColor,
                  textTransform: 'uppercase',
                  letterSpacing: 0.7,
                }}>
                Теги
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              {route.tags.map((tag) => (
                <HoldChip key={tag} label={`# ${tag}`} />
              ))}
            </View>
          </View>
        )}

        {/* ── Description ── */}
        {route.description && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 16,
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Info size={14} color={sectionTitleColor} />
              <Text
                style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#e0e0e8' : '#1a1a2a' }}>
                Опис
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 22,
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              }}>
              {route.description}
            </Text>
          </View>
        )}

        {/* ── Tip ── */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            flexDirection: 'row',
            gap: 14,
            borderRadius: 20,
            padding: 16,
            backgroundColor: isDark ? 'rgba(123,173,207,0.08)' : 'rgba(123,173,207,0.12)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(123,173,207,0.18)' : 'rgba(123,173,207,0.25)',
          }}>
          <Zap size={18} color="#7badcf" />
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#c8ddf0' : '#2a5f80' }}>
              Порада
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontSize: 13,
                lineHeight: 20,
                color: isDark ? 'rgba(200,221,240,0.7)' : 'rgba(42,95,128,0.75)',
              }}>
              Зафіксуй свій пролаз одразу після спроби — так точніше відображається прогрес.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── CTA button ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingBottom: 28,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
          backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.92)',
        }}>
        <TouchableOpacity
          onPress={() => router.push(`/ascent/${route.id}` as never)}
          activeOpacity={0.85}
          style={{
            backgroundColor: ctaBg,
            borderRadius: 18,
            paddingVertical: 15,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 10,
          }}>
          <CheckCircle2 size={20} color={ctaText} />
          <Text style={{ fontSize: 16, fontWeight: '800', color: ctaText, letterSpacing: -0.3 }}>
            Записати пролаз
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
