import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Pencil, Route, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { useThemeColor } from '@/shared/hooks/use-theme-color';

interface AscentDetailHeaderProps {
  onBack: () => void;
  onViewRoute: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AscentDetailHeader({
  onBack,
  onViewRoute,
  onEdit,
  onDelete,
}: AscentDetailHeaderProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();

  const iconBtn = (child: React.ReactNode, onPress: () => void, label: string, destructive?: boolean) => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={10}
      style={{
        width: 36,
        height: 36,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: destructive ? colors.destructive + '55' : colors.border,
      }}>
      {child}
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        paddingTop: insets.top,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 8,
        }}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
          <ArrowLeft size={20} color={colors.foreground} />
        </TouchableOpacity>

        <Text
          style={{ flex: 1, textAlign: 'center', minWidth: 0 }}
          className="text-base font-semibold text-foreground"
          numberOfLines={1}>
          {t('ascentDetail.title')}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {iconBtn(
            <Route size={17} color={colors.primary} />,
            onViewRoute,
            t('ascentDetail.viewRoute')
          )}
          {iconBtn(
            <Pencil size={17} color={colors.foreground} />,
            onEdit,
            t('ascentDetail.edit')
          )}
          {iconBtn(
            <Trash2 size={17} color={colors.destructive} />,
            onDelete,
            t('ascentDetail.delete'),
            true
          )}
        </View>
      </View>
    </View>
  );
}
