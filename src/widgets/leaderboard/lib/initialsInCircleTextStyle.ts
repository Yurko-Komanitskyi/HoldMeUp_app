import { Platform, type TextStyle } from 'react-native';

/** Centers initials in a circle; Android strips extra font padding. */
export function initialsInCircleTextStyle(
  fontSize: number,
  color: string,
  fontWeight: '800' | '900' = '800',
): TextStyle {
  return {
    fontSize,
    lineHeight: fontSize,
    fontWeight,
    color,
    textAlign: 'center',
    ...(Platform.OS === 'android'
      ? { includeFontPadding: false, textAlignVertical: 'center' as const }
      : {}),
  };
}
