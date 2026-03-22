import * as React from 'react';
import {
  Modal,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Search, X, Mountain } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import type { Route } from '@/entities/route/model/route';
import { RoutePickerItem } from './route-picker-item';


export interface RoutePickerModalProps {
  visible: boolean;
  routes: Route[];
  onClose: () => void;
  onSelect: (route: Route) => void;
}

export function RoutePickerModal({ visible, routes, onClose, onSelect }: RoutePickerModalProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
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
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 14,
              gap: 12,
            }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '800',
                  color: colors.foreground,
                }}>
                {t('home.pickRoute')}
              </Text>
              <Text style={{ fontSize: 13, color: colors.mutedForeground, marginTop: 2 }}>
                {t('home.routesInGym', { count: routes.length })}
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              onPress={handleClose}
              hitSlop={12}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: colors.secondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <X size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginHorizontal: 16,
              marginBottom: 12,
              backgroundColor: colors.card,
              borderRadius: 14,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}>
            <Search size={16} color={colors.mutedForeground} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('home.searchRoute')}
              placeholderTextColor={colors.mutedForeground}
              style={{ flex: 1, fontSize: 15, color: colors.foreground }}
              autoFocus
            />
            {search.length > 0 && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('common.clear')}
                onPress={() => setSearch('')}
                hitSlop={8}>
                <X size={14} color={colors.mutedForeground} />
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
              onPress={() => {
                setSearch('');
                onSelect(item);
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60, gap: 8 }}>
              <Mountain size={40} color={colors.mutedForeground} />
              <Text style={{ fontSize: 15, color: colors.mutedForeground, fontWeight: '600' }}>
                {t('home.noRoutesFound')}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 60 }}
          style={{
            backgroundColor: colors.card,
            marginHorizontal: 16,
            borderRadius: 16,
          }}
        />
      </View>
    </Modal>
  );
}
