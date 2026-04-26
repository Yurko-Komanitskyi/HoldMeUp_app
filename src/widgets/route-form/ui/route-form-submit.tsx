import { View, TouchableOpacity, ActivityIndicator } from 'react-native';

import { Text } from '@/shared/ui/text';
import { useThemeColor } from '@/shared/hooks/use-theme-color';

type Props = {
  isSubmitting: boolean;
  uploading: boolean;
  submitLabel: string;
  onSubmit: () => void;
};

export function RouteFormSubmitBar({
  isSubmitting,
  uploading,
  submitLabel,
  onSubmit,
}: Props) {
  const colors = useThemeColor();
  const btnBg = colors.foreground;
  const btnFg = colors.background;

  return (
    <View
      style={{
        marginTop: 8,
        paddingBottom: 16,
      }}>
      <TouchableOpacity
        onPress={onSubmit}
        disabled={isSubmitting || uploading}
        activeOpacity={0.82}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          paddingVertical: 15,
          backgroundColor: btnBg,
          opacity: isSubmitting || uploading ? 0.55 : 1,
        }}>
        {isSubmitting ? (
          <ActivityIndicator color={btnFg} />
        ) : (
          <Text
            style={{
              fontSize: 15,
              fontWeight: '800',
              color: btnFg,
              letterSpacing: -0.3,
            }}>
            {submitLabel}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
