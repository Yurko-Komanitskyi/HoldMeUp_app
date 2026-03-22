import { RoutePickerModal } from '@/features/route-picker/ui/route-picker-modal';
import { Text } from '@/shared/ui/text';
import { TouchableOpacity, View } from 'react-native';
import { AscentsStats } from './ascents-stats';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { useRoutesQuery } from '@/entities/route/model/routeHooks';
import { Route } from '@/entities/route/model/route';
import { ACCENT } from '@/shared/config/palette';
import { Plus } from 'lucide-react-native';
import { AscentFilters } from '@/entities/ascent/model/ascentHooks';
import type { AscentStatsResponse } from '@/entities/stats/api/types';
import { AscentFilter } from './ascent-filter';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

interface AscentHeaderProps {
  setFilters: (filters: AscentFilters) => void;
  statsResponse: AscentStatsResponse | undefined;
  statsLoading?: boolean;
  statsQueryError?: unknown;
  onRetryStats?: () => void;
}

export function AscentHeader({
  setFilters,
  statsResponse,
  statsLoading,
  statsQueryError,
  onRetryStats,
}: AscentHeaderProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [pickerVisible, setPickerVisible] = React.useState(false);

  const router = useRouter();

  const currentGymId = useGymMemberStore((s) => s.currentGymId);

  const {
    items: routes = [],
    isError: routesPickerError,
    error: routesPickerQueryError,
    refetch: refetchRoutesForPicker,
  } = useRoutesQuery({
    gymId: currentGymId ?? undefined,
    status: ['ACTIVE'],
  });
  const handleRouteSelect = React.useCallback(
    (route: Route) => {
      setPickerVisible(false);
      router.push(`/ascent/${route.id}` as never);
    },
    [router]
  );
  return (
    <View style={{ paddingBottom: 16 }}>
      <RoutePickerModal
        visible={pickerVisible}
        routes={routes}
        onClose={() => setPickerVisible(false)}
        onSelect={handleRouteSelect}
      />

      <View style={{ gap: 16, paddingTop: 20 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View>
            <Text
              style={{
                fontSize: 28,
                lineHeight: 36,
                fontWeight: '700',
                color: isDark ? '#fff' : '#000',
              }}>
              {t('ascents.title')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setPickerVisible(true)}
            style={{
              backgroundColor: ACCENT,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 9,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}>
            <Plus size={16} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>
              {t('ascents.addAscent')}
            </Text>
          </TouchableOpacity>
        </View>

        {routesPickerError ? (
          <QueryErrorPanel
            variant="compact"
            error={routesPickerQueryError ?? new Error('')}
            onRetry={() => void refetchRoutesForPicker()}
          />
        ) : null}

        <AscentsStats
          statsResponse={statsResponse}
          isLoading={statsLoading}
          statsQueryError={statsQueryError}
          onRetryStats={onRetryStats}
        />
        {/* Period filter */}
        <AscentFilter setFilters={setFilters} />
      </View>
    </View>
  );
}
