import * as React from 'react';
import { Modal, View, Pressable, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Text } from '@/shared/ui/text';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Скасувати',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cardBg = isDark ? '#1c1c1e' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const titleColor = isDark ? '#f2f2f7' : '#1c1c1e';
  const messageColor = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  const cancelBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const cancelBgActive = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const cancelColor = isDark ? '#ebebf5' : '#3c3c43';

  const confirmBg = destructive
    ? isDark ? 'rgba(255,59,48,0.18)' : 'rgba(255,59,48,0.1)'
    : isDark ? 'rgba(10,132,255,0.18)' : 'rgba(0,122,255,0.1)';
  const confirmBgActive = destructive
    ? isDark ? 'rgba(255,59,48,0.28)' : 'rgba(255,59,48,0.18)'
    : isDark ? 'rgba(10,132,255,0.28)' : 'rgba(0,122,255,0.18)';
  const confirmColor = destructive
    ? isDark ? '#ff6961' : '#ff3b30'
    : isDark ? '#4da6ff' : '#007aff';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
        }}
        onPress={loading ? undefined : onCancel}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            backgroundColor: cardBg,
            borderRadius: 20,
            borderWidth: 1,
            borderColor,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 8 },
            elevation: 12,
          }}>
          {/* Text content */}
          <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20, gap: 6 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                color: titleColor,
                textAlign: 'center',
                letterSpacing: -0.3,
              }}>
              {title}
            </Text>
            {message ? (
              <Text
                style={{
                  fontSize: 14,
                  color: messageColor,
                  textAlign: 'center',
                  lineHeight: 20,
                }}>
                {message}
              </Text>
            ) : null}
          </View>

          {/* Buttons */}
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              paddingHorizontal: 14,
              paddingTop: 12,
              paddingBottom: 14,
            }}>
            <Pressable
              onPress={loading ? undefined : onCancel}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 48,
                paddingHorizontal: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? cancelBgActive : cancelBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: dividerColor,
              })}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: cancelColor,
                  textAlign: 'center',
                }}>
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              onPress={loading ? undefined : onConfirm}
              disabled={loading}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 48,
                paddingHorizontal: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? confirmBgActive : confirmBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: destructive
                  ? isDark
                    ? 'rgba(255,59,48,0.45)'
                    : 'rgba(255,59,48,0.3)'
                  : isDark
                    ? 'rgba(10,132,255,0.45)'
                    : 'rgba(0,122,255,0.3)',
                opacity: loading ? 0.65 : 1,
              })}>
              {loading ? (
                <ActivityIndicator size="small" color={confirmColor} />
              ) : (
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: confirmColor,
                    textAlign: 'center',
                  }}>
                  {confirmLabel}
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
