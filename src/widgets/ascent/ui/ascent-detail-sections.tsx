import * as React from 'react';
import { View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import type { Ascent } from '@/entities/ascent/model/ascent';
import { ASCENT_TYPES, normalizeAscentTypeMetaKey } from '@/entities/ascent/lib/constants';
import { AscentFeelingBlock } from '@/entities/ascent/ui/ascent-feeling-block';
import { AscentDetailInfoRow, AscentDetailRouteStrip } from '@/widgets/ascent/ui/ascent-detail-bits';
import { formatAscentDate, formatAscentDuration } from '@/widgets/ascent/lib/ascent-detail-format';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { resolveRouteColor } from '@/shared/config/palette';

export function AscentDetailRouteHero({
  ascent,
  dateLabel,
}: {
  ascent: Ascent;
  dateLabel: string;
}) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const band = resolveRouteColor((ascent.routeColor ?? 'grey').trim());
  const typeMeta =
    ASCENT_TYPES.find((x) => x.value === ascent.type) ?? ASCENT_TYPES[2];
  const labelKey = normalizeAscentTypeMetaKey(ascent.type);
  const IconComp = typeMeta.icon;

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-md shadow-black/10">
      <View style={{ height: 6, width: '100%', backgroundColor: band }} />
      <CardContent className="pb-5 pt-4">
        <View className="flex-row items-stretch justify-between gap-3">
          <AscentDetailRouteStrip color={band} />
          <View className="min-h-[88px] flex-1 gap-2">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="text-xl font-semibold text-foreground">
                {ascent.routeName ?? t('ascentDetail.noRouteName')}
              </Text>
              {ascent.routeGrade && (
                <Badge variant="secondary">
                  <Text className="text-sm font-medium">{ascent.routeGrade}</Text>
                </Badge>
              )}
            </View>
            <Text className="text-sm capitalize leading-5 text-muted-foreground">{dateLabel}</Text>
            <View style={{ gap: 8, marginTop: 2 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  padding: 14,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: typeMeta.color,
                  backgroundColor: typeMeta.bg,
                }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: typeMeta.color + '22',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <IconComp size={20} color={typeMeta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: typeMeta.color }}>
                    {t(`logAscent.ascentTypeLabel.${labelKey}`)}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                    {t(`logAscent.ascentTypeSublabel.${labelKey}`)}
                  </Text>
                </View>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: typeMeta.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <CheckCircle2 size={14} color={colors.destructiveForeground} />
                </View>
              </View>
              <View className="flex-row flex-wrap items-center gap-2">
                {ascent.success ? (
                  <Badge variant="outline" className="border-green-500/40">
                    <Text className="text-xs text-green-600 dark:text-green-400">
                      {t('ascentDetail.successBadge')}
                    </Text>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-destructive/40">
                    <Text className="text-xs text-destructive">{t('ascentDetail.failBadge')}</Text>
                  </Badge>
                )}
              </View>
            </View>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

export function AscentDetailQuickStats({
  ascent,
  formatDate,
}: {
  ascent: Ascent;
  formatDate: (iso: string) => string;
}) {
  const { t } = useTranslation();
  const dash = t('common.dash');
  const timeText =
    ascent.timeSeconds !== null ? formatAscentDuration(ascent.timeSeconds, t) : dash;
  const attemptText =
    ascent.attemptNumber !== null ? `#${ascent.attemptNumber}` : dash;

  return (
    <View className="flex-row gap-3">
      <Card className="min-h-[88px] flex-1 gap-0 py-0">
        <CardContent className="items-center justify-center pb-3 pt-3">
          <Text className="mb-1 text-xs text-muted-foreground">{t('ascentDetail.statTime')}</Text>
          <Text
            className={cn(
              'text-center text-lg font-semibold',
              ascent.timeSeconds !== null ? 'text-foreground' : 'text-muted-foreground'
            )}>
            {timeText}
          </Text>
        </CardContent>
      </Card>
      <Card className="min-h-[88px] flex-1 gap-0 py-0">
        <CardContent className="items-center justify-center pb-3 pt-3">
          <Text className="mb-1 text-xs text-muted-foreground">{t('ascentDetail.statAttempt')}</Text>
          <Text
            className={cn(
              'text-lg font-semibold',
              ascent.attemptNumber !== null ? 'text-foreground' : 'text-muted-foreground'
            )}>
            {attemptText}
          </Text>
        </CardContent>
      </Card>
      <Card className="min-h-[88px] flex-1 gap-0 py-0">
        <CardContent className="items-center justify-center pb-3 pt-3">
          <Text className="mb-1 text-xs text-muted-foreground">{t('ascentDetail.statDate')}</Text>
          <Text className="text-center text-sm font-medium leading-tight text-foreground">
            {formatDate(ascent.date)}
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}

export function AscentDetailMetaCard({
  ascent,
  formatDate,
}: {
  ascent: Ascent;
  formatDate: (iso: string) => string;
}) {
  const { t } = useTranslation();
  const gradePercLabel = ascent.gradePerception
    ? t(`ascentDetail.gradePerception.${ascent.gradePerception}`, {
        defaultValue: ascent.gradePerception,
      })
    : null;

  return (
    <Card className="gap-0 py-0 shadow-md shadow-black/10">
      <CardHeader className="px-4 pb-0 pt-4">
        <Text className="text-sm font-medium text-foreground">{t('ascentDetail.infoSection')}</Text>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        {ascent.gradePerception && (
          <>
            <AscentDetailInfoRow label={t('ascentDetail.gradeFeel')}>
              <Text className="text-sm text-foreground">{gradePercLabel}</Text>
            </AscentDetailInfoRow>
            <Separator />
          </>
        )}
        <AscentDetailInfoRow label={t('ascentDetail.created')}>
          <Text className="text-sm text-muted-foreground">{formatDate(ascent.createdAt)}</Text>
        </AscentDetailInfoRow>
        {ascent.updatedAt !== ascent.createdAt && (
          <>
            <Separator />
            <AscentDetailInfoRow label={t('ascentDetail.updated')}>
              <Text className="text-sm text-muted-foreground">{formatDate(ascent.updatedAt)}</Text>
            </AscentDetailInfoRow>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function AscentDetailFeelingCard({ ascent }: { ascent: Ascent }) {
  const colors = useThemeColor();
  if (ascent.feeling === null) return null;
  return (
    <AscentFeelingBlock
      mode="display"
      feeling={ascent.feeling}
      cardBg={colors.card}
      borderColor={colors.border}
    />
  );
}

export function AscentDetailNotesCard({ notes }: { notes: string | null | undefined }) {
  const { t } = useTranslation();
  const trimmed = notes?.trim();
  const empty = !trimmed;
  return (
    <Card className="min-h-[100px] gap-0 py-0 shadow-sm shadow-black/10">
      <CardHeader className="px-4 pb-0 pt-4">
        <Text className="text-sm font-medium text-foreground">{t('ascentDetail.notesSection')}</Text>
      </CardHeader>
      <CardContent className="px-4 pb-5 pt-2">
        {empty ? (
          <Text className="text-sm leading-relaxed text-muted-foreground">{t('ascentDetail.noNotes')}</Text>
        ) : (
          <Text className="text-sm leading-relaxed text-foreground">{trimmed}</Text>
        )}
      </CardContent>
    </Card>
  );
}

export function AscentDetailFooterTip() {
  const { t } = useTranslation();
  return (
    <View className="mt-1 rounded-2xl border border-border bg-muted/40 px-4 py-4">
      <Text className="text-center text-xs leading-5 text-muted-foreground">{t('ascentDetail.footerTip')}</Text>
    </View>
  );
}

export function AscentDetailVideoCard({ url }: { url: string }) {
  const { t } = useTranslation();
  return (
    <Card className="gap-0 py-0 shadow-sm shadow-black/10">
      <CardContent className="flex-row items-center gap-3 pb-4 pt-4">
        <View className="h-10 w-10 items-center justify-center rounded-md bg-muted">
          <Text className="text-lg">▶</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-medium text-foreground">{t('ascentDetail.videoSection')}</Text>
          <Text className="text-xs text-primary" numberOfLines={1} ellipsizeMode="tail">
            {url}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}
