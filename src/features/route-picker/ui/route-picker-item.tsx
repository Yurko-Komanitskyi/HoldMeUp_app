import { Route } from '@/entities/route/model/route';
import { resolveRouteColor } from '@/shared/config/palette';
import { Text } from '@/shared/ui/text';
import { ChevronRight } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

interface RoutePickerItemProps {
  route: Route;
  onPress: () => void;
  isDark: boolean;
}

export function RoutePickerItem({ route, onPress, isDark }: RoutePickerItemProps) {
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
        borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
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
          borderColor: '#e5e7eb',
        }}>
        <Text style={{ fontSize: 13, fontWeight: '900', color: isWhite ? '#374151' : '#fff' }}>
          {route.grade}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 15, fontWeight: '600', color: isDark ? '#fff' : '#000' }}
          numberOfLines={1}>
          {route.name}
        </Text>
        <Text style={{ fontSize: 12, color: 'rgba(128,128,128,0.65)', marginTop: 2 }}>
          {route.sector?.name ?? ''}
        </Text>
      </View>
      <ChevronRight size={18} color="rgba(128,128,128,0.4)" />
    </TouchableOpacity>
  );
}
