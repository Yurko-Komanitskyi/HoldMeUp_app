import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './text';

export function LoadingSpinner() {
  const { t } = useTranslation();
  return (
    <View>
      <Text>{t('common.loadingText')}</Text>
    </View>
  );
}
