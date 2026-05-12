import * as React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Search, X } from 'lucide-react-native';

import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Text } from '@/shared/ui/text';
import { initialsInCircleTextStyle } from '../lib/initialsInCircleTextStyle';
import {
  useFollowSearchQuery,
  useFollowersByFollowerIdQuery,
} from '@/entities/follow/model/followHooks';

interface Props {
  visible: boolean;
  selectedIds: Set<string>;
  currentUserId: string;
  onClose: () => void;
  onConfirm: (ids: Set<string>) => void;
}

export function CustomPickerModal({
  visible,
  selectedIds,
  currentUserId,
  onClose,
  onConfirm,
}: Props) {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = React.useState<Set<string>>(new Set(selectedIds));
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (visible) {
      setDraft(new Set(selectedIds));
      setSearch('');
    }
  }, [visible, selectedIds]);

  const searchQuery = useFollowSearchQuery(search);
  const followingQuery = useFollowersByFollowerIdQuery(
    search.trim().length === 0 ? currentUserId : '',
  );

  const isSearching = search.trim().length > 0;
  const isLoading = isSearching ? searchQuery.isLoading : followingQuery.isLoading;

  const users = isSearching
    ? searchQuery.items
    : followingQuery.items.map((f) => f.following);

  const pickable = users.filter((u) => u.id !== currentUserId);

  const toggle = (id: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmLabel =
    draft.size === 0
      ? 'Оберіть хоча б одного'
      : draft.size === 1
      ? 'Порівняти з 1 суперником'
      : `Порівняти з ${draft.size} суперниками`;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000055' }}>
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '88%',
            paddingBottom: Math.max(insets.bottom, 16),
          }}>

          {/* Handle */}
          <View style={{ alignItems: 'center', paddingTop: 12 }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
              }}
            />
          </View>

          {/* Header row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: 14,
            }}>
            <Text
              style={{
                flex: 1,
                fontSize: 18,
                fontWeight: '800',
                color: colors.foreground,
              }}>
              Обери суперників
            </Text>
            {draft.size > 0 && (
              <View
                style={{
                  backgroundColor: ACCENT + '20',
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  marginRight: 10,
                }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: ACCENT }}>
                  {draft.size}
                </Text>
              </View>
            )}
            <Pressable onPress={onClose} hitSlop={12}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: colors.muted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <X size={15} color={colors.mutedForeground} />
              </View>
            </Pressable>
          </View>

          {/* Search */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 16,
              marginBottom: 6,
              paddingHorizontal: 12,
              paddingVertical: 2,
              borderRadius: 12,
              backgroundColor: colors.muted,
              gap: 8,
            }}>
            <Search size={16} color={colors.mutedForeground} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Пошук..."
              placeholderTextColor={colors.mutedForeground}
              style={{
                flex: 1,
                paddingVertical: 11,
                fontSize: 14,
                color: colors.foreground,
              }}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} hitSlop={10}>
                <X size={14} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>

          {/* List */}
          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingVertical: 4 }}
            showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator color={ACCENT} />
              </View>
            ) : pickable.length === 0 ? (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: 40,
                  paddingHorizontal: 32,
                  gap: 8,
                }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: colors.foreground,
                    textAlign: 'center',
                  }}>
                  {isSearching ? 'Нікого не знайдено' : 'Ти ще нікого не фолловиш'}
                </Text>
                {!isSearching && (
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.mutedForeground,
                      textAlign: 'center',
                      lineHeight: 20,
                    }}>
                    Підпишись на людей зі свого залу у вкладці Пошук
                  </Text>
                )}
              </View>
            ) : (
              pickable.map((u) => {
                const selected = draft.has(u.id);
                const name =
                  [u.firstName, u.lastName].filter(Boolean).join(' ') || u.userTag || '?';
                const initials =
                  u.firstName && u.lastName
                    ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase()
                    : (u.userTag ?? '?').slice(0, 2).toUpperCase();

                return (
                  <Pressable
                    key={u.id}
                    onPress={() => toggle(u.id)}
                    style={({ pressed }) => ({
                      width: '100%',
                      alignSelf: 'stretch',
                      opacity: pressed ? 0.72 : 1,
                      backgroundColor: selected ? ACCENT + '0C' : 'transparent',
                    })}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'nowrap',
                        alignItems: 'center',
                        width: '100%',
                        paddingVertical: 11,
                        paddingHorizontal: 16,
                        gap: 12,
                      }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: selected ? ACCENT + '1A' : colors.muted,
                          borderWidth: 2,
                          borderColor: selected ? ACCENT : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                        <Text
                          style={initialsInCircleTextStyle(
                            14,
                            selected ? ACCENT : colors.mutedForeground,
                            '800',
                          )}
                        >
                          {initials}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexGrow: 1,
                          flexShrink: 1,
                          flexBasis: 0,
                          minWidth: 0,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 15,
                            fontWeight: selected ? '700' : '500',
                            color: selected ? ACCENT : colors.foreground,
                          }}
                        >
                          {name}
                        </Text>
                        {u.userTag ? (
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.mutedForeground,
                              marginTop: 1,
                            }}
                          >
                            @{u.userTag}
                          </Text>
                        ) : null}
                      </View>

                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          backgroundColor: selected ? ACCENT : 'transparent',
                          borderWidth: selected ? 0 : 1.5,
                          borderColor: colors.border,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {selected && <Check size={14} color="#fff" strokeWidth={3} />}
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {/* Confirm */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}>
            <Pressable
              onPress={() => onConfirm(draft)}
              disabled={draft.size === 0}
              style={({ pressed }) => ({
                backgroundColor: draft.size > 0 ? ACCENT : colors.muted,
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              })}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '800',
                  color: draft.size > 0 ? '#fff' : colors.mutedForeground,
                }}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
