import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { SectionLabel } from '@/shared/ui/section-label';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';
import { AscentType } from '@/entities/ascent/model/ascent';
import { ASCENT_TYPE_META, normalizeAscentTypeMetaKey } from '@/entities/ascent/lib/constants';

const ORDER: AscentType[] = [
  AscentType.FLASH,
  AscentType.ON_SIGHT,
  AscentType.REDPOINT,
  AscentType.TOP,
  AscentType.PROJECT,
];

function labelKey(type: AscentType): 'FLASH' | 'ONSIGHT' | 'REDPOINT' | 'TOP' | 'PROJECT' {
  if (type === AscentType.ON_SIGHT) return 'ONSIGHT';
  return type as 'FLASH' | 'REDPOINT' | 'TOP' | 'PROJECT';
}

interface Props {
  value: AscentType;
  cardBg: string;
  borderColor: string;
  onChange: (value: AscentType) => void;
}

export function EditAscentTypeSection({ value, cardBg, borderColor, onChange }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();

  return (
    <View
      style={{
        backgroundColor: cardBg,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor,
      }}>
      <SectionLabel>{t('logAscent.ascentType')}</SectionLabel>
      <View style={{ gap: 8 }}>
        {ORDER.map((type) => {
          const active = value === type;
          const metaKey = normalizeAscentTypeMetaKey(type);
          const meta = ASCENT_TYPE_META[metaKey];
          const lk = labelKey(type);
          return (
            <TouchableOpacity
              key={type}
              onPress={() => onChange(type)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: active ? meta.color : borderColor,
                backgroundColor: active ? meta.bg : 'transparent',
              }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: meta.color, flex: 1 }}>
                {t(`logAscent.ascentTypeLabel.${lk}`)}
              </Text>
              {active && <CheckCircle2 size={18} color={meta.color} />}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 8 }}>
        {t('ascentDetail.editTypeHint')}
      </Text>
    </View>
  );
}
