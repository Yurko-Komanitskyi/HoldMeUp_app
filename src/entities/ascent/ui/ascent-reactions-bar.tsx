import * as React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { ACCENT } from '@/shared/config/palette';
import type { AscentReaction } from '@/entities/ascent/model/ascent';
import { useAscentReactionMutations } from '@/entities/ascent/model/ascentHooks';

const QUICK_EMOJIS = ['👍', '🔥', '💪', '❤️'] as const;

function aggregateByEmoji(reactions: AscentReaction[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of reactions) {
    m.set(r.emoji, (m.get(r.emoji) ?? 0) + 1);
  }
  return m;
}

export interface AscentReactionsBarProps {
  ascentId: string;
  reactions: AscentReaction[];
  ascentOwnerId: string;
  currentUserId?: string | null;
  /** Якщо true — лише перегляд (наприклад, власний пролаз без можливості ставити реакцію самому собі) */
  readOnly?: boolean;
  compact?: boolean;
}

export function AscentReactionsBar({
  ascentId,
  reactions,
  ascentOwnerId,
  currentUserId,
  readOnly: readOnlyProp,
  compact,
}: AscentReactionsBarProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { addReactionMutation, deleteReactionMutation } = useAscentReactionMutations();

  const isOwner = !!(currentUserId && currentUserId === ascentOwnerId);
  const readOnly = readOnlyProp ?? isOwner;
  const myReaction = React.useMemo(
    () => (currentUserId ? reactions.find((r) => r.userId === currentUserId) : undefined),
    [reactions, currentUserId]
  );

  const byEmoji = React.useMemo(() => aggregateByEmoji(reactions), [reactions]);
  const busy =
    (addReactionMutation.isPending && addReactionMutation.variables?.ascentId === ascentId) ||
    (deleteReactionMutation.isPending && deleteReactionMutation.variables === ascentId);

  const onEmojiPress = React.useCallback(
    (emoji: string) => {
      if (readOnly || !currentUserId) return;
      if (myReaction?.emoji === emoji) {
        deleteReactionMutation.mutate(ascentId);
        return;
      }
      addReactionMutation.mutate({ ascentId, emoji });
    },
    [
      readOnly,
      currentUserId,
      myReaction?.emoji,
      ascentId,
      addReactionMutation,
      deleteReactionMutation,
    ]
  );

  const showEmojis = React.useMemo(() => {
    if (!readOnly && currentUserId) return [...QUICK_EMOJIS];
    const set = new Set<string>(QUICK_EMOJIS as unknown as string[]);
    for (const r of reactions) set.add(r.emoji);
    return Array.from(set);
  }, [reactions, readOnly, currentUserId]);

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: compact ? 6 : 8,
        paddingTop: compact ? 6 : 8,
      }}>
      {busy ? <ActivityIndicator size="small" color={ACCENT} style={{ marginRight: 4 }} /> : null}
      {showEmojis.map((emoji) => {
        const count = byEmoji.get(emoji) ?? 0;
        const active = myReaction?.emoji === emoji;
        const showCount = count > 0;
        if (!showCount && readOnly) return null;

        return (
          <Pressable
            key={emoji}
            disabled={readOnly && !showCount}
            onPress={() => onEmojiPress(emoji)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active ? ACCENT : colors.border,
              backgroundColor: active ? ACCENT + '22' : colors.card,
              opacity: readOnly && !showCount ? 0.4 : 1,
            }}>
            <Text style={{ fontSize: compact ? 15 : 16 }}>{emoji}</Text>
            {showCount ? (
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 12,
                  fontWeight: '700',
                  color: active ? ACCENT : colors.mutedForeground,
                }}>
                {count}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
      {reactions.length > 0 && readOnly ? (
        <Text style={{ fontSize: 11, color: colors.mutedForeground, marginLeft: 4 }}>
          {t('ascent.reactionsTotal', { count: reactions.length })}
        </Text>
      ) : null}
    </View>
  );
}
