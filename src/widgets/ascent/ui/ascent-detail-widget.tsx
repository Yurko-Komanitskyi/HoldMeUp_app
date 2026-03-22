import * as React from 'react';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { useAscentDetailsQuery, useAscentMutations } from '@/entities/ascent/model/ascentHooks';
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
  const toast = useToastStore();
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
            onRefresh={() => void refetch()}
            tintColor={ACCENT}
          />
        }>
        <AscentDetailRouteHero ascent={ascent} dateLabel={formatDateWithWeekday(ascent.date)} />
        <AscentDetailQuickStats ascent={ascent} formatDate={formatDate} />
        <AscentDetailMetaCard ascent={ascent} formatDate={formatDate} />
        <AscentDetailNotesCard notes={ascent.notes} />
        {ascent.videoUrl ? <AscentDetailVideoCard url={ascent.videoUrl} /> : null}
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
