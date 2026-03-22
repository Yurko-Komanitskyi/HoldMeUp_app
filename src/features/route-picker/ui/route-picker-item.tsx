import { Route } from '@/entities/route/model/route';
import { resolveRouteColor } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Text } from '@/shared/ui/text';
import { ChevronRight } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

interface RoutePickerItemProps {
  route: Route;
  onPress: () => void;
}

export function RoutePickerItem({ route, onPress }: RoutePickerItemProps) {
  const colors = useThemeColor();
  const hex = resolveRouteColor(route.color);
  const isWhite = route.color?.toLowerCase() === 'white';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
      activeOpacity={0.7}>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          backgroundColor: hex,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: isWhite ? 1 : 0,
          borderColor: colors.border,
        }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '900',
            color: isWhite ? colors.foreground : colors.destructiveForeground,
          }}>
          {route.grade}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}
          numberOfLines={1}>
          {route.name}
        </Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
          {route.sector?.name ?? ''}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}
