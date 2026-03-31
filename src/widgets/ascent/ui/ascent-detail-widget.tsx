import * as React from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import { Text } from '@/shared/ui/text';
import { useAscentDetailsQuery, useAscentMutations } from '@/entities/ascent/model/ascentHooks';
import { ascentKeys } from '@/entities/ascent/api/ascentApi';
import { AscentReactionsBar } from '@/entities/ascent/ui/ascent-reactions-bar';
import { useUserStore } from '@/entities/user/model/userStore';
import { useToastStore } from '@/shared/ui/app-toast';
import { ACCENT } from '@/shared/config/palette';
import { formatAscentDate, formatAscentDateWithWeekday } from '@/widgets/ascent/lib/ascent-detail-format';
import { AscentDetailError } from '@/widgets/ascent/ui/ascent-detail-error';
import { AscentDetailHeader } from '@/widgets/ascent/ui/ascent-detail-header';
import { AscentDetailLoading } from '@/widgets/ascent/ui/ascent-detail-loading';
import { EditAscentModal } from '@/widgets/ascent/ui/edit-ascent-modal';
import {
  AscentDetailFooterTip,
  AscentDetailMetaCard,
  AscentDetailNotesCard,
  AscentDetailQuickStats,
  AscentDetailRouteHero,
  AscentDetailVideoCard,
} from '@/widgets/ascent/ui/ascent-detail-sections';

export function AscentDetailWidget() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const toast = useToastStore();
  const myId = useUserStore((s) => s.currentUser?.id);
  const [editOpen, setEditOpen] = React.useState(false);

  const {
    data: ascent,
    isLoading,
    isError,
    error: ascentQueryError,
    refetch,
    isRefetching,
  } = useAscentDetailsQuery(id ?? '');
  const { deleteAscentMutation } = useAscentMutations();

  const formatDate = React.useCallback(
    (iso: string) => formatAscentDate(iso, i18n.language),
    [i18n.language]
  );

  const formatDateWithWeekday = React.useCallback(
    (iso: string) => formatAscentDateWithWeekday(iso, i18n.language),
    [i18n.language]
  );

  const confirmDelete = React.useCallback(() => {
    if (!ascent) return;
    Alert.alert(t('ascentDetail.deleteTitle'), t('ascentDetail.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('ascentDetail.delete'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteAscentMutation.mutateAsync(ascent.id);
              toast.show('success', t('ascentDetail.deleteSuccess'));
              router.back();
            } catch {
              toast.show('error', t('ascentDetail.deleteError'));
            }
          })();
        },
      },
    ]);
  }, [ascent, deleteAscentMutation, router, t, toast]);

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-muted-foreground">{t('ascentDetail.loadError')}</Text>
      </View>
    );
  }

  if (isLoading && !ascent) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }} className="bg-background">
        <AscentDetailLoading />
      </View>
    );
  }

  if (isError || !ascent) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }} className="bg-background">
        <AscentDetailError error={ascentQueryError} onRetry={() => void refetch()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }} className="bg-background">
      <AscentDetailHeader
        onBack={() => router.back()}
        onViewRoute={() => router.push(`/route/${ascent.routeId}` as never)}
        onEdit={() => setEditOpen(true)}
        onDelete={confirmDelete}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 pt-4 gap-4"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={() =>
              void (async () => {
                if (id) {
                  await queryClient.invalidateQueries({ queryKey: ascentKeys.detail(id) });
                  await queryClient.refetchQueries({ queryKey: ascentKeys.detail(id), type: 'active' });
                }
                await refetch();
              })()
            }
            tintColor={ACCENT}
          />
        }>
        <AscentDetailRouteHero ascent={ascent} dateLabel={formatDateWithWeekday(ascent.date)} />
        <AscentDetailQuickStats ascent={ascent} formatDate={formatDate} />
        <AscentDetailMetaCard ascent={ascent} formatDate={formatDate} />
        <AscentDetailNotesCard notes={ascent.notes} />
        {ascent.videoUrl ? <AscentDetailVideoCard url={ascent.videoUrl} /> : null}

        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">
            {t('ascentDetail.reactionsSection')}
          </Text>
          {(ascent.reactions?.length ?? 0) === 0 ? (
            <Text className="text-sm text-muted-foreground">{t('ascentDetail.reactionsEmpty')}</Text>
          ) : (
            <View style={{ gap: 10 }}>
              {(ascent.reactions ?? []).map((r) => (
                <View
                  key={r.id}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 20 }}>{r.emoji}</Text>
                  <Pressable
                    onPress={() => {
                      if (myId && r.userId === myId) {
                        router.push('/(tabs)/profile' as never);
                        return;
                      }
                      router.push(`/user/${r.userId}` as never);
                    }}
                    hitSlop={6}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: ACCENT }}>
                      {t('ascentDetail.reactionUserProfile')}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          <AscentReactionsBar
            ascentId={ascent.id}
            reactions={ascent.reactions ?? []}
            ascentOwnerId={ascent.userId}
            currentUserId={myId}
          />
        </View>

        <AscentDetailFooterTip />
      </ScrollView>

      <EditAscentModal
        visible={editOpen}
        ascent={ascent}
        onClose={() => setEditOpen(false)}
        onSaved={() => void refetch()}
      />
    </View>
  );
}
