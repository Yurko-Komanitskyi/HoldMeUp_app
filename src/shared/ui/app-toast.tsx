import * as React from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import { create } from 'zustand';

import { Text } from '@/shared/ui/text';

type ToastType = 'success' | 'error';

type ToastTimeout = ReturnType<typeof setTimeout> | null;

interface ToastState {
  visible: boolean;
  type: ToastType;
  message: string;
  timeoutId?: ToastTimeout;
  show: (type: ToastType, message: string, duration?: number) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  visible: false,
  type: 'success',
  message: '',
  timeoutId: null,
  show: (type, message, duration = 2200) => {
    const { timeoutId } = get();
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => {
      set({ visible: false, timeoutId: null });
    }, duration);
    set({ visible: true, type, message, timeoutId: id });
  },
  hide: () => {
    const { timeoutId } = get();
    if (timeoutId) clearTimeout(timeoutId);
    set({ visible: false, timeoutId: null });
  },
}));

export function AppToastOverlay() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { visible, type, message } = useToastStore();

  if (!visible) return null;

  const isSuccess = type === 'success';
  const bg = isSuccess
    ? isDark
      ? 'rgba(22,163,74,0.95)'
      : 'rgba(22,163,74,0.96)'
    : isDark
      ? 'rgba(220,38,38,0.96)'
      : 'rgba(239,68,68,0.96)';

  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 120,
        left: 0,
        right: 0,
        alignItems: 'center',
      }}>
      <View
        style={{
          maxWidth: '90%',
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: bg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}>
        <Icon size={18} color="#ecfdf5" />
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: '#ecfdf5',
          }}>
          {message}
        </Text>
      </View>
    </View>
  );
}

