import * as React from 'react';
import { View, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Timer, RotateCcw, Pencil, ChevronUp, ChevronDown, X, Expand } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { type StopwatchState, type StopwatchActions, formatStopwatch } from '@/features/stopwatch/model/useStopwatch';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

type StopwatchCardProps = StopwatchState & StopwatchActions;

export function StopwatchCard({
  seconds,
  running,
  saved,
  start,
  pause,
  reset,
  setSeconds,
}: StopwatchCardProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const isDark = colors.isDark;

  const [manualOpen, setManualOpen] = React.useState(false);
  const [fullScreenOpen, setFullScreenOpen] = React.useState(false);
  const [manualMinutes, setManualMinutes] = React.useState(0);
  const [manualSeconds, setManualSeconds] = React.useState(0);

  const timeColor = running
    ? colors.chart2
    : saved && seconds > 0
      ? ACCENT
      : colors.foreground;

  const openManual = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    setManualMinutes(m);
    setManualSeconds(s);
    setManualOpen(true);
  };

  const applyManual = () => {
    const total = Math.max(0, manualMinutes * 60 + manualSeconds);
    setSeconds(total);
    setManualOpen(false);
  };

  const mainBtnBg = running ? colors.chart5 : colors.chart2;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}>
      <TouchableOpacity
        onPress={() => setFullScreenOpen(true)}
        hitSlop={10}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 34,
          height: 34,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}>
        <Expand size={16} color={colors.mutedForeground} />
      </TouchableOpacity>

      {/* Label row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          paddingTop: 16,
          paddingBottom: 4,
        }}>
        <Timer size={12} color={colors.mutedForeground} />
        <Text
          style={{
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: colors.mutedForeground,
          }}>
          {t('stopwatch.label')}
        </Text>
      </View>

      {/* Big time display */}
      <TouchableOpacity
        onPress={() => setFullScreenOpen(true)}
        activeOpacity={0.85}
        style={{ alignItems: 'center', paddingVertical: 10 }}>
        <Text
          style={{
            fontSize: 72,
            fontWeight: '200',
            letterSpacing: -2,
            color: timeColor,
            fontVariant: ['tabular-nums'],
            lineHeight: 82,
          }}>
          {formatStopwatch(seconds)}
        </Text>
        {saved && seconds > 0 ? (
          <Text
            style={{
              fontSize: 12,
              color: ACCENT,
              fontWeight: '600',
              marginTop: 2,
            }}>
            {t('stopwatch.saved')}
          </Text>
        ) : null}
      </TouchableOpacity>

      {/* Big Start/Stop button */}
      <TouchableOpacity
        onPress={running ? pause : start}
        activeOpacity={0.82}
        style={{
          marginHorizontal: 16,
          marginBottom: 12,
          paddingVertical: 16,
          borderRadius: 18,
          backgroundColor: mainBtnBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '700',
            color: '#fff',
            letterSpacing: 0.2,
          }}>
          {running ? t('stopwatch.stop') : seconds > 0 ? t('stopwatch.resume') : t('stopwatch.start')}
        </Text>
      </TouchableOpacity>

      {/* Secondary actions */}
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}>
        <TouchableOpacity
          onPress={reset}
          style={{
            flex: 1,
            paddingVertical: 11,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.muted,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 6,
          }}>
          <RotateCcw size={14} color={colors.mutedForeground} />
          <Text style={{ fontSize: 13, color: colors.mutedForeground, fontWeight: '500' }}>
            {t('stopwatch.reset')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openManual}
          style={{
            flex: 1,
            paddingVertical: 11,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.muted,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 6,
          }}>
          <Pencil size={14} color={colors.mutedForeground} />
          <Text style={{ fontSize: 13, color: colors.mutedForeground, fontWeight: '500' }}>
            {t('stopwatch.setTime')}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={fullScreenOpen} animationType="fade" statusBarTranslucent>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            paddingHorizontal: 20,
            justifyContent: 'space-between',
            paddingTop: 56,
            paddingBottom: 36,
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity
              onPress={() => setFullScreenOpen(false)}
              hitSlop={12}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: colors.muted,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <X size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', gap: 14 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: colors.mutedForeground,
              }}>
              {t('stopwatch.label')}
            </Text>
            <Text
              style={{
                fontSize: 96,
                fontWeight: '200',
                letterSpacing: -2,
                color: timeColor,
                fontVariant: ['tabular-nums'],
                lineHeight: 110,
              }}>
              {formatStopwatch(seconds)}
            </Text>
            {saved && seconds > 0 ? (
              <Text style={{ fontSize: 14, color: ACCENT, fontWeight: '700' }}>
                {t('stopwatch.saved')}
              </Text>
            ) : null}
          </View>

          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={running ? pause : start}
              activeOpacity={0.85}
              style={{
                paddingVertical: 22,
                borderRadius: 22,
                backgroundColor: mainBtnBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: '#fff',
                  letterSpacing: 0.3,
                }}>
                {running ? t('stopwatch.stop') : seconds > 0 ? t('stopwatch.resume') : t('stopwatch.start')}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={reset}
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.muted,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                }}>
                <RotateCcw size={16} color={colors.mutedForeground} />
                <Text style={{ fontSize: 15, color: colors.mutedForeground, fontWeight: '600' }}>
                  {t('stopwatch.reset')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openManual}
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.muted,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                }}>
                <Pencil size={16} color={colors.mutedForeground} />
                <Text style={{ fontSize: 15, color: colors.mutedForeground, fontWeight: '600' }}>
                  {t('stopwatch.setTime')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manual input modal */}
      <Modal visible={manualOpen} transparent animationType="fade" statusBarTranslucent>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}
          onPress={() => setManualOpen(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              borderRadius: 20,
              padding: 24,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 18,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 10,
            }}>
            <Text
              style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, textAlign: 'center' }}>
              {t('stopwatch.modalTitle')}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 32 }}>
              {/* Minutes */}
              <View style={{ alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setManualMinutes((m) => Math.min(59, m + 1))}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.muted,
                  }}>
                  <ChevronUp size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 40,
                    fontWeight: '300',
                    fontVariant: ['tabular-nums'],
                    color: colors.foreground,
                    lineHeight: 48,
                  }}>
                  {String(manualMinutes).padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  onPress={() => setManualMinutes((m) => Math.max(0, m - 1))}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.muted,
                  }}>
                  <ChevronDown size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={{ fontSize: 12, color: colors.mutedForeground, fontWeight: '500' }}>
                  {t('common.minuteAbbr')}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 40,
                  fontWeight: '300',
                  color: colors.mutedForeground,
                  alignSelf: 'center',
                  lineHeight: 48,
                  marginTop: -8,
                }}>
                :
              </Text>

              {/* Seconds */}
              <View style={{ alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setManualSeconds((s) => (s >= 59 ? 0 : s + 1))}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.muted,
                  }}>
                  <ChevronUp size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 40,
                    fontWeight: '300',
                    fontVariant: ['tabular-nums'],
                    color: colors.foreground,
                    lineHeight: 48,
                  }}>
                  {String(manualSeconds).padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  onPress={() => setManualSeconds((s) => (s <= 0 ? 59 : s - 1))}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.muted,
                  }}>
                  <ChevronDown size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={{ fontSize: 12, color: colors.mutedForeground, fontWeight: '500' }}>
                  {t('common.secondAbbr')}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setManualOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.muted,
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 14, color: colors.mutedForeground, fontWeight: '600' }}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyManual}
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 14,
                  backgroundColor: ACCENT,
                  alignItems: 'center',
                }}>
                <Text
                  style={{ fontSize: 14, color: '#fff', fontWeight: '700' }}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
