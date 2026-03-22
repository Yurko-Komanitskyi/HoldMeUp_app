import * as React from 'react';
import { View, Pressable } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { parseApiError } from '@/shared/lib/api-error';
import { useThemeColor } from '@/shared/hooks/use-theme-color';

type ApiLike = { status?: number };

function resolveMessage(error: unknown, t: (k: string) => string): string {
  const status = (error as ApiLike)?.status;
  if (status === 403) return t('errors.forbidden');
  if (status === 401) return t('errors.unauthorized');
  return parseApiError(error).message;
}

interface QueryErrorPanelProps {
  error: unknown;
  onRetry: () => void;
  variant?: 'default' | 'compact';
}

export function QueryErrorPanel({ error, onRetry, variant = 'default' }: QueryErrorPanelProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const message = resolveMessage(error, t);
  const compact = variant === 'compact';

  if (compact) {
    return (
      <View
        style={{
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          padding: 12,
          gap: 10,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          <AlertCircle size={20} color={colors.destructive} style={{ marginTop: 2 }} />
          <Text style={{ flex: 1, fontSize: 13, lineHeight: 18, color: colors.foreground }}>
            {message}
          </Text>
        </View>
        <Pressable onPress={onRetry} hitSlop={8}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 24,
        paddingVertical: 24,
      }}>
      <AlertCircle size={44} color={colors.destructive} />
      <Text
        style={{
          textAlign: 'center',
          fontSize: 15,
          fontWeight: '600',
          color: colors.foreground,
        }}>
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          paddingHorizontal: 22,
          paddingVertical: 12,
        }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>
          {t('common.retry')}
        </Text>
      </Pressable>
    </View>
  );
}
