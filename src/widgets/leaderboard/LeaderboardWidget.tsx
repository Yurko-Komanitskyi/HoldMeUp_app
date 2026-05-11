import * as React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Users2 } from 'lucide-react-native';

import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Text } from '@/shared/ui/text';
import { useUserStore } from '@/entities/user/model/userStore';
import type { LeaderboardEntry, LeaderboardPeriod, LeaderboardScope } from '@/entities/leaderboard/model/types';
import {
  ALL_GYM_USER_IDS,
  buildMockLeaderboard,
  MOCK_FOLLOWING_IDS,
} from '@/entities/leaderboard/model/mock';
import { LeaderboardPodium } from './ui/LeaderboardPodium';
import { LeaderboardRow } from './ui/LeaderboardRow';
import { CustomPickerModal } from './ui/CustomPickerModal';

/* ─── sub-tab pill ─────────────────────────────────────────────── */

function ScopePill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColor();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: active ? ACCENT + '28' : 'transparent',
        alignItems: 'center',
      }}>
      <Text
        numberOfLines={1}
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: active ? ACCENT : colors.mutedForeground,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ─── period pill ──────────────────────────────────────────────── */

function PeriodPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColor();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: active ? ACCENT : colors.muted,
      }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: active ? '#fff' : colors.mutedForeground,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ─── score legend card ────────────────────────────────────────── */

function ScoreLegend() {
  const colors = useThemeColor();
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 14,
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 6,
      }}>
      <Text style={{ fontSize: 12, fontWeight: '800', color: colors.mutedForeground, marginBottom: 2 }}>
        ЯК РАХУЮТЬСЯ БАЛИ
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[
          { label: 'On-sight  ×1.5', color: '#a855f7' },
          { label: 'Flash  ×1.3',    color: ACCENT },
          { label: 'Redpoint  ×1.0', color: '#22c55e' },
          { label: 'Top  ×0.6',      color: '#f97316' },
        ].map((item) => (
          <View
            key={item.label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: item.color,
              }}
            />
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{item.label}</Text>
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}>
        Кожен маршрут рахується 1 раз (найкращий спуск). Бали за грейд: 6a=68, 7a=315, 8a=1200
      </Text>
    </View>
  );
}

/* ─── empty state ──────────────────────────────────────────────── */

function EmptyState({ scope, onPickCustom }: { scope: LeaderboardScope; onPickCustom: () => void }) {
  const colors = useThemeColor();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <Users2 size={48} color={colors.mutedForeground} style={{ marginBottom: 16 }} />
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: colors.foreground,
          textAlign: 'center',
          marginBottom: 8,
        }}>
        {scope === 'friends'
          ? 'Немає даних по друзях'
          : 'Оберіть суперників'}
      </Text>
      <Text
        style={{ fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginBottom: 20 }}>
        {scope === 'friends'
          ? 'Підпишись на когось у вкладці Пошук'
          : 'Натисни кнопку нижче щоб вибрати з ким змагатись'}
      </Text>
      {scope === 'custom' ? (
        <Pressable
          onPress={onPickCustom}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 14,
            backgroundColor: ACCENT,
          }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>
            Обрати суперників
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ─── main widget ──────────────────────────────────────────────── */

const SCOPES: { key: LeaderboardScope; label: string }[] = [
  { key: 'gym',     label: '🏟 Зал' },
  { key: 'friends', label: '👥 Друзі' },
  { key: 'custom',  label: '⚡ Свої' },
];

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'week',  label: 'Тиждень' },
  { key: 'month', label: 'Місяць' },
  { key: 'all',   label: 'Весь час' },
];

export function LeaderboardWidget() {
  const colors = useThemeColor();
  const currentUser = useUserStore((s) => s.currentUser);

  // Use a stable fallback mock ID when there's no real user (dev / mock mode)
  const currentUserId = currentUser?.id ?? 'mock-u1';

  const [scope, setScope] = React.useState<LeaderboardScope>('gym');
  const [period, setPeriod] = React.useState<LeaderboardPeriod>('month');
  const [customIds, setCustomIds] = React.useState<Set<string>>(new Set());
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const entries: LeaderboardEntry[] = React.useMemo(() => {
    let userIds: string[];
    if (scope === 'gym') {
      // Always include current user in gym scope
      userIds = ALL_GYM_USER_IDS.includes(currentUserId)
        ? ALL_GYM_USER_IDS
        : [currentUserId, ...ALL_GYM_USER_IDS];
    } else if (scope === 'friends') {
      const friendIds = [...MOCK_FOLLOWING_IDS];
      userIds = friendIds.includes(currentUserId) ? friendIds : [currentUserId, ...friendIds];
    } else {
      // custom
      userIds = customIds.size > 0
        ? (customIds.has(currentUserId)
            ? [...customIds]
            : [currentUserId, ...customIds])
        : [];
    }
    return buildMockLeaderboard(userIds, period, currentUserId);
  }, [scope, period, customIds, currentUserId]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const isEmpty = entries.length === 0;

  return (
    <View style={{ flex: 1 }}>
      {/* Scope tabs */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: 12,
          padding: 4,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
        {SCOPES.map(({ key, label }) => (
          <ScopePill
            key={key}
            label={label}
            active={scope === key}
            onPress={() => {
              setScope(key);
              if (key === 'custom' && customIds.size === 0) setPickerOpen(true);
            }}
          />
        ))}
      </View>

      {/* Period filter */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          marginBottom: 14,
          gap: 8,
        }}>
        {PERIODS.map(({ key, label }) => (
          <PeriodPill
            key={key}
            label={label}
            active={period === key}
            onPress={() => setPeriod(key)}
          />
        ))}

        {/* Custom edit button */}
        {scope === 'custom' && !isEmpty ? (
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={{
              marginLeft: 'auto',
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: ACCENT,
            }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: ACCENT }}>
              Змінити
            </Text>
          </Pressable>
        ) : null}
      </View>

      {isEmpty ? (
        <EmptyState scope={scope} onPickCustom={() => setPickerOpen(true)} />
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(e) => e.userId}
          renderItem={({ item }) => <LeaderboardRow entry={item} />}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListHeaderComponent={
            <>
              {top3.length >= 2 ? <LeaderboardPodium top3={top3} /> : null}
              <ScoreLegend />
              {/* Rows from #4 start below the legend */}
              {rest.length > 0 ? (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: colors.mutedForeground,
                    paddingHorizontal: 16,
                    paddingBottom: 4,
                    marginTop: 4,
                    letterSpacing: 0.8,
                  }}>
                  РЕШТА УЧАСНИКІВ
                </Text>
              ) : null}
            </>
          }
        />
      )}

      <CustomPickerModal
        visible={pickerOpen}
        selectedIds={customIds}
        currentUserId={currentUserId}
        onClose={() => setPickerOpen(false)}
        onConfirm={(ids) => {
          setCustomIds(ids);
          setPickerOpen(false);
        }}
      />
    </View>
  );
}
