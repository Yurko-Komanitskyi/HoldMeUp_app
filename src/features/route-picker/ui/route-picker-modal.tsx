import * as React from 'react';
import {
  Modal,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Search, X, Mountain, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { resolveRouteColor } from '@/shared/config/palette';
import type { Route } from '@/entities/route/model/route';

interface RoutePickerItemProps {
  route: Route;
  onPress: () => void;
  isDark: boolean;
}

function RoutePickerItem({ route, onPress, isDark }: RoutePickerItemProps) {
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

export interface RoutePickerModalProps {
  visible: boolean;
  routes: Route[];
  onClose: () => void;
  onSelect: (route: Route) => void;
}

export function RoutePickerModal({ visible, routes, onClose, onSelect }: RoutePickerModalProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return routes;
    return routes.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.grade?.toLowerCase().includes(q) ||
        r.sector?.name?.toLowerCase().includes(q)
    );
  }, [routes, search]);

  const handleClose = React.useCallback(() => {
    setSearch('');
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#f2f2f7' }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: isDark ? '#000' : '#f2f2f7' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 14,
              gap: 12,
            }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: isDark ? '#fff' : '#000' }}>
                {t('home.pickRoute')}
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(128,128,128,0.65)', marginTop: 2 }}>
                {t('home.routesInGym', { count: routes.length })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={12}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <X size={18} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginHorizontal: 16,
              marginBottom: 12,
              backgroundColor: isDark ? '#1c1c1e' : '#fff',
              borderRadius: 14,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}>
            <Search size={16} color="rgba(128,128,128,0.6)" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('home.searchRoute')}
              placeholderTextColor="rgba(128,128,128,0.4)"
              style={{ flex: 1, fontSize: 15, color: isDark ? '#fff' : '#000' }}
              autoFocus
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
                <X size={14} color="rgba(128,128,128,0.5)" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>

        <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <RoutePickerItem
              route={item}
              isDark={isDark}
              onPress={() => {
                setSearch('');
                onSelect(item);
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60, gap: 8 }}>
              <Mountain size={40} color="rgba(128,128,128,0.25)" />
              <Text style={{ fontSize: 15, color: 'rgba(128,128,128,0.5)', fontWeight: '600' }}>
                {t('home.noRoutesFound')}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 60 }}
          style={{
            backgroundColor: isDark ? '#1c1c1e' : '#fff',
            marginHorizontal: 16,
            borderRadius: 16,
          }}
        />
      </View>
    </Modal>
  );
}
