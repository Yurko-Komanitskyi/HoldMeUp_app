import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { CheckCircle2, XCircle, ChevronUp, ChevronDown } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { SectionLabel } from '@/shared/ui/section-label';

interface Props {
  success: boolean;
  attemptNumber: number;
  isDark: boolean;
  cardBg: string;
  borderColor: string;
  onChangeSuccess: (value: boolean) => void;
  onChangeAttempt: (updater: (n: number) => number) => void;
}

//todo: add auto increment for attempt number

export function ResultAttemptsSection({
  success,
  attemptNumber,
  isDark,
  cardBg,
  borderColor,
  onChangeSuccess,
  onChangeAttempt,
}: Props) {
  return (
    <View
      style={{
        backgroundColor: cardBg,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor,
        gap: 20,
      }}>
      <View>
        <SectionLabel>Результат</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { val: true, label: 'Пролаз', icon: CheckCircle2, color: '#22c55e' },
            { val: false, label: 'Впав', icon: XCircle, color: '#ef4444' },
          ].map(({ val, label, icon: BtnIcon, color }) => {
            const active = success === val;
            return (
              <TouchableOpacity
                key={label}
                onPress={() => onChangeSuccess(val)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? color : borderColor,
                  backgroundColor: active ? color + '1a' : 'transparent',
                }}>
                <BtnIcon size={20} color={active ? color : 'rgba(128,128,128,0.4)'} />
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 15,
                    color: active ? color : 'rgba(128,128,128,0.6)',
                  }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View>
        <SectionLabel>Номер спроби</SectionLabel>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity
            onPress={() => onChangeAttempt((n) => Math.max(1, n - 1))}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 1,
              borderColor,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            }}>
            <ChevronDown size={20} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 36,
                lineHeight: 42,
                fontWeight: '200',
                color: isDark ? '#fff' : '#000',
              }}>
              {attemptNumber}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(128,128,128,0.6)', marginTop: -4 }}>
              {attemptNumber === 1 ? 'перша спроба' : 'спроба'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onChangeAttempt((n) => n + 1)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 1,
              borderColor,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            }}>
            <ChevronUp size={20} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

