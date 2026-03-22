import * as React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Timer, Play, Pause, RotateCcw, Pencil, ChevronUp, ChevronDown } from 'lucide-react-native';
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
  const cardBg = colors.card;
  const borderColor = colors.border;

  const timeColor = running ? colors.chart2 : saved ? ACCENT : colors.foreground;
  const onAccentIcon = colors.destructiveForeground;

  const [manualOpen, setManualOpen] = React.useState(false);
  const [manualMinutes, setManualMinutes] = React.useState(0);
  const [manualSeconds, setManualSeconds] = React.useState(0);

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

  return (
    <View
      style={{
        backgroundColor: cardBg,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          <Timer size={11} color={colors.mutedForeground} />
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 1.1,
              color: colors.mutedForeground,
            }}>
            {t('stopwatch.label')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{
              fontSize: 42,
              fontWeight: '200',
              letterSpacing: -1,
              color: timeColor,
              fontVariant: ['tabular-nums'],
              lineHeight: 50,
            }}>
            {formatStopwatch(seconds)}
          </Text>
        </View>
        {saved && seconds > 0 && (
          <Text style={{ fontSize: 11, color: colors.chart2, fontWeight: '600', marginTop: 2 }}>
            {t('stopwatch.saved')}
          </Text>
        )}
      </View>

      <View style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {!running ? (
            <TouchableOpacity
              onPress={start}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: colors.chart2,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Play size={22} color={onAccentIcon} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={pause}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: colors.chart5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Pause size={22} color={onAccentIcon} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={reset}
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              borderWidth: 1,
              borderColor,
              backgroundColor: colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <RotateCcw size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={openManual}
          hitSlop={8}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: colors.muted,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}>
          <Pencil size={12} color={colors.mutedForeground} />
          <Text
            style={{
              fontSize: 11,
              color: colors.mutedForeground,
              fontWeight: '600',
            }}>
            {t('stopwatch.setTime')}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={manualOpen} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              width: '80%',
              borderRadius: 18,
              padding: 18,
              backgroundColor: colors.card,
              gap: 14,
            }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4, color: colors.foreground }}>
              {t('stopwatch.modalTitle')}
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              {t('stopwatch.modalHint')}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 8,
                gap: 24,
              }}>
              {/* Minutes */}
              <View style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <TouchableOpacity
                  onPress={() => setManualMinutes((m) => Math.min(59, m + 1))}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.muted,
                  }}>
                  <ChevronUp size={18} color={colors.foreground} />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 28,
                    fontVariant: ['tabular-nums'],
                    color: colors.foreground,
                  }}>
                  {String(manualMinutes).padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  onPress={() => setManualMinutes((m) => Math.max(0, m - 1))}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.muted,
                  }}>
                  <ChevronDown size={18} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}>
                  {t('common.minuteAbbr')}
                </Text>
              </View>

              {/* Seconds */}
              <View style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <TouchableOpacity
                  onPress={() => setManualSeconds((s) => (s >= 59 ? 0 : s + 1))}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.muted,
                  }}>
                  <ChevronUp size={18} color={colors.foreground} />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 28,
                    fontVariant: ['tabular-nums'],
                    color: colors.foreground,
                  }}>
                  {String(manualSeconds).padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  onPress={() => setManualSeconds((s) => (s <= 0 ? 59 : s - 1))}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.muted,
                  }}>
                  <ChevronDown size={18} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}>
                  {t('common.secondAbbr')}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: 8,
                marginTop: 4,
              }}>
              <TouchableOpacity
                onPress={() => setManualOpen(false)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}>
                <Text style={{ fontSize: 13, color: colors.mutedForeground, fontWeight: '500' }}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyManual}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: ACCENT,
                }}>
                <Text style={{ fontSize: 13, color: colors.destructiveForeground, fontWeight: '600' }}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
