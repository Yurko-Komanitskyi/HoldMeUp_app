import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/shared/ui/text';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { ACCENT } from '@/shared/config/palette';
import type { AscentReaction } from '@/entities/ascent/model/ascent';
import { useAscentReactionMutations } from '@/entities/ascent/model/ascentHooks';

const QUICK_EMOJIS = ['🔥', '💪', '⚡', '🙌', '👏', '🎯'] as const;

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
  /** Якщо true — лише перегляд (власний пролаз без можливості ставити реакцію самому собі) */
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
  const colors = useThemeColor();
  const { addReactionMutation, deleteReactionMutation } = useAscentReactionMutations();

  const isOwner = !!(currentUserId && currentUserId === ascentOwnerId);
  const readOnly = readOnlyProp ?? isOwner;

  // Optimistic local state — синхронізується з сервером після мутації
  const [localReactions, setLocalReactions] = React.useState<AscentReaction[]>(reactions);
  const isPressing = React.useRef(false);

  // Синхронізація з сервером (після успішного invalidate + refetch)
  React.useEffect(() => {
    if (!isPressing.current) {
      setLocalReactions(reactions);
    }
  }, [reactions]);

  const localMyReaction = React.useMemo(() => {
    if (!currentUserId) return undefined;
    const mine = localReactions.filter((r) => r.userId === currentUserId);
    if (mine.length === 0) return undefined;
    return mine.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
  }, [localReactions, currentUserId]);

  const byEmoji = React.useMemo(() => aggregateByEmoji(localReactions), [localReactions]);

  const onEmojiPress = React.useCallback(
    async (emoji: string) => {
      if (readOnly || !currentUserId || isPressing.current) return;
      isPressing.current = true;

      const serverSnapshot = reactions;
      const withoutMine = localReactions.filter((r) => r.userId !== currentUserId);
      const isSameEmoji = localMyReaction?.emoji === emoji;

      // Optimistic update — одразу показуємо результат
      if (isSameEmoji) {
        setLocalReactions(withoutMine);
      } else {
        const optimistic: AscentReaction = {
          id: 'optimistic',
          userId: currentUserId,
          emoji,
          createdAt: new Date().toISOString(),
        };
        setLocalReactions([...withoutMine, optimistic]);
      }

      try {
        if (isSameEmoji) {
          await deleteReactionMutation.mutateAsync(ascentId);
        } else {
          if (localMyReaction) {
            await deleteReactionMutation.mutateAsync(ascentId);
          }
          await addReactionMutation.mutateAsync({ ascentId, emoji });
        }
      } catch {
        // Відкат при помилці
        setLocalReactions(serverSnapshot);
      } finally {
        isPressing.current = false;
      }
    },
    [
      readOnly,
      currentUserId,
      reactions,
      localReactions,
      localMyReaction,
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
      }}>
      {showEmojis.map((emoji) => {
        const count = byEmoji.get(emoji) ?? 0;
        const active = localMyReaction?.emoji === emoji;
        const showCount = count > 0;

        if (!showCount && readOnly) return null;

        return (
          <Pressable
            key={emoji}
            disabled={readOnly && !showCount}
            onPress={() => void onEmojiPress(emoji)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: showCount ? 10 : 9,
              paddingVertical: 5,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: active ? ACCENT : colors.border,
              backgroundColor: active
                ? ACCENT + '28'
                : pressed
                  ? colors.border + '60'
                  : colors.card,
              opacity: readOnly && !showCount ? 0.35 : 1,
              transform: [{ scale: pressed && !readOnly ? 0.92 : 1 }],
            })}>
            <Text style={{ fontSize: compact ? 16 : 17 }}>{emoji}</Text>
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
    </View>
  );
}
