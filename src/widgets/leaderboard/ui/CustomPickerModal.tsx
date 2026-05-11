import * as React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check } from 'lucide-react-native';

import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Text } from '@/shared/ui/text';
import { MOCK_USERS_FOR_PICKER } from '@/entities/leaderboard/model/mock';

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

  React.useEffect(() => {
    if (visible) setDraft(new Set(selectedIds));
  }, [visible, selectedIds]);

  const toggle = (id: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pickable = MOCK_USERS_FOR_PICKER.filter((u) => u.userId !== currentUserId);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: insets.bottom + 16,
            maxHeight: '80%',
          }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}>
            <Text style={{ flex: 1, fontSize: 18, fontWeight: '800', color: colors.foreground }}>
              Обери суперників
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
            {pickable.map((u) => {
              const selected = draft.has(u.userId);
              const name =
                [u.firstName, u.lastName].filter(Boolean).join(' ') || u.userTag || '?';
              const initials =
                u.firstName && u.lastName
                  ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase()
                  : (u.userTag ?? '?').slice(0, 2).toUpperCase();

              return (
                <Pressable
                  key={u.userId}
                  onPress={() => toggle(u.userId)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    gap: 12,
                    backgroundColor: selected ? ACCENT + '10' : 'transparent',
                  }}>
                  {/* Avatar */}
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: selected ? ACCENT + '22' : colors.muted,
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? ACCENT : colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '800',
                        color: selected ? ACCENT : colors.mutedForeground,
                      }}>
                      {initials}
                    </Text>
                  </View>

                  {/* Name */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: selected ? ACCENT : colors.foreground,
                      }}>
                      {name}
                    </Text>
                    {u.userTag ? (
                      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                        @{u.userTag}
                      </Text>
                    ) : null}
                  </View>

                  {/* Checkmark */}
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: selected ? ACCENT : 'transparent',
                      borderWidth: selected ? 0 : 2,
                      borderColor: colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    {selected ? <Check size={14} color="#fff" /> : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Confirm */}
          <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            <Pressable
              onPress={() => onConfirm(draft)}
              style={{
                backgroundColor: ACCENT,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
              }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>
                Порівняти ({draft.size} обрано)
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
