import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import {
  AscentDetailFeelingCard,
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
  const [deleteOpen, setDeleteOpen] = React.useState(false);

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

  async function handleDeleteConfirm() {
    if (!ascent) return;
    try {
      await deleteAscentMutation.mutateAsync(ascent.id);
      setDeleteOpen(false);
      toast.show('success', t('ascentDetail.deleteSuccess'));
      router.back();
    } catch {
      setDeleteOpen(false);
      toast.show('error', t('ascentDetail.deleteError'));
    }
  }

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

  const canManageAscent = Boolean(myId && ascent.userId && myId === ascent.userId);

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }} className="bg-background">
      <ConfirmDialog
        visible={deleteOpen}
        title={t('ascentDetail.deleteTitle')}
        message={t('ascentDetail.deleteMessage')}
        confirmLabel={t('ascentDetail.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        loading={deleteAscentMutation.isPending}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteOpen(false)}
      />

      <AscentDetailHeader
        onBack={() => router.back()}
        onViewRoute={() => router.push(`/route/${ascent.routeId}` as never)}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
        canManage={canManageAscent}
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
        <Animated.View entering={FadeInDown.delay(0).duration(380).springify().damping(18)}>
          <AscentDetailRouteHero ascent={ascent} dateLabel={formatDateWithWeekday(ascent.date)} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(70).duration(380).springify().damping(18)}>
          <AscentDetailQuickStats ascent={ascent} formatDate={formatDate} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(130).duration(380).springify().damping(18)}>
          <AscentDetailFeelingCard ascent={ascent} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(180).duration(380).springify().damping(18)}>
          <AscentDetailMetaCard ascent={ascent} formatDate={formatDate} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(230).duration(380).springify().damping(18)}>
          <AscentDetailNotesCard notes={ascent.notes} />
          {ascent.videoUrl ? <AscentDetailVideoCard url={ascent.videoUrl} /> : null}
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(280).duration(380).springify().damping(18)}>
          <AscentReactionsBar
            ascentId={ascent.id}
            reactions={ascent.reactions ?? []}
            ascentOwnerId={ascent.userId}
            currentUserId={myId}
          />
          <AscentDetailFooterTip />
        </Animated.View>
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
