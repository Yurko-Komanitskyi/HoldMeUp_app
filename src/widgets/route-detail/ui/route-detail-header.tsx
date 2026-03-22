import * as React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { useTranslation } from 'react-i18next';

type Props = {
  routeId: string;
  routeName: string;
  grade: string;
  sectorName?: string | null;
  styleLabel?: string | null;
  canManageRoute: boolean;
  status?: {
    label: string;
    color: string;
  } | null;
  routeColor: string;
  heroTextColor: string;
  onDeletePress?: () => void;
  isDeleting?: boolean;
};

export function RouteDetailHeader({
  routeId,
  routeName,
  grade,
  sectorName,
  styleLabel,
  canManageRoute,
  status,
  routeColor,
  heroTextColor,
  onDeletePress,
  isDeleting,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
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
            <ArrowLeft size={19} color={heroTextColor} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 10,
                backgroundColor: 'rgba(0,0,0,0.22)',
              }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: heroTextColor, opacity: 0.9 }}>
                {sectorName ?? t('routeDetail.noSector')}
              </Text>
            </View>
            {canManageRoute && (
              <TouchableOpacity
                onPress={() => router.push(`/route/edit/${routeId}` as never)}
                hitSlop={8}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: 'rgba(0,0,0,0.22)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Pencil size={16} color={heroTextColor} />
              </TouchableOpacity>
            )}
            {canManageRoute && onDeletePress && (
              <TouchableOpacity
                onPress={onDeletePress}
                disabled={isDeleting}
                hitSlop={8}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: 'rgba(0,0,0,0.22)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isDeleting ? 0.65 : 1,
                }}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color={heroTextColor} />
                ) : (
                  <Trash2 size={16} color={heroTextColor} />
                )}
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
                style={{ fontSize: 22, fontWeight: '900', color: heroTextColor, letterSpacing: -0.5 }}>
                {grade}
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
                <Text
                  style={{ fontSize: 13, fontWeight: '600', color: heroTextColor, opacity: 0.9 }}>
                  {styleLabel}
                </Text>
              </View>
            )}
            {status && (
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
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{status.label}</Text>
              </View>
            )}
          </View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: '900',
              color: heroTextColor,
              letterSpacing: -1,
              lineHeight: 36,
            }}>
            {routeName}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

