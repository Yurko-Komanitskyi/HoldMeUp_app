import * as React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { ServerErrorBanner } from '@/shared/ui/server-error-banner';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useToastStore } from '@/shared/ui/app-toast';
import type { Ascent } from '@/entities/ascent/model/ascent';
import { useEditAscentForm } from '@/widgets/ascent/model/useEditAscentForm';
import { EditAscentTypeSection } from '@/widgets/ascent/ui/edit-ascent-type-section';
import { EditAscentTimeSection } from '@/widgets/ascent/ui/edit-ascent-time-section';
import { ResultAttemptsSection } from '@/widgets/log-ascent/ui/sections/ResultAttemptsSection';
import { FeelingSection } from '@/widgets/log-ascent/ui/sections/FeelingSection';
import { GradePerceptionSection } from '@/widgets/log-ascent/ui/sections/GradePerceptionSection';
import { NotesSection } from '@/widgets/log-ascent/ui/sections/NotesSection';
import { VideoSection } from '@/widgets/log-ascent/ui/sections/VideoSection';
import { IsPublicSection } from '@/widgets/log-ascent/ui/sections/IsPublicSection';

interface EditAscentModalProps {
  visible: boolean;
  ascent: Ascent | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EditAscentModal({ visible, ascent, onClose, onSaved }: EditAscentModalProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const toast = useToastStore();

  const { state, actions, submit, isPending } = useEditAscentForm(ascent ?? undefined, visible);

  const cardBg = colors.card;
  const borderColor = colors.border;
  const inputBg = colors.input;
  const inputColor = colors.foreground;
  const placeholderColor = colors.mutedForeground;

  async function handleSave() {
    if (!state) return;
    try {
      await submit();
      toast.show('success', t('ascentDetail.saveSuccess'));
      onSaved();
      onClose();
    } catch (e) {
      if ((e as Error)?.message === 'validation') return;
    }
  }

  const errorBanner =
    state?.serverError === 'INVALID_TIME'
      ? t('ascentDetail.timeInvalid')
      : state?.serverError ?? null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: insets.top, borderBottomWidth: 1, borderBottomColor: borderColor }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor,
              }}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}>
              <X size={20} color={colors.foreground} />
            </Pressable>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.foreground }}>
              {t('ascentDetail.editTitle')}
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        {!ascent || !state ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 100,
              paddingTop: 16,
              gap: 16,
            }}
            showsVerticalScrollIndicator={false}>
            {errorBanner ? <ServerErrorBanner message={errorBanner} /> : null}

            {state.success && (
              <EditAscentTypeSection
                value={state.ascentType ?? undefined}
                cardBg={cardBg}
                borderColor={borderColor}
                onChange={actions.setAscentType}
              />
            )}

            <ResultAttemptsSection
              success={state.success}
              attemptNumber={state.attemptNumber}
              cardBg={cardBg}
              borderColor={borderColor}
              onChangeSuccess={actions.setSuccess}
            />

            <EditAscentTimeSection
              value={state.timeInput}
              onChange={actions.setTimeInput}
              cardBg={cardBg}
              borderColor={borderColor}
              inputBg={inputBg}
              inputColor={inputColor}
              placeholderColor={placeholderColor}
            />

            <FeelingSection
              feeling={state.feeling}
              cardBg={cardBg}
              borderColor={borderColor}
              onChange={actions.setFeeling}
            />

            <GradePerceptionSection
              gradePerception={state.gradePerception}
              cardBg={cardBg}
              borderColor={borderColor}
              onChange={actions.setGradePerception}
            />

            <NotesSection
              value={state.notes}
              onChange={actions.setNotes}
              cardBg={cardBg}
              borderColor={borderColor}
              inputBg={inputBg}
              inputColor={inputColor}
              placeholderColor={placeholderColor}
            />

            <VideoSection
              value={state.videoUrl}
              onChange={actions.setVideoUrl}
              cardBg={cardBg}
              borderColor={borderColor}
              inputBg={inputBg}
              inputColor={inputColor}
              placeholderColor={placeholderColor}
            />

            <IsPublicSection
              isPublic={state.isPublic}
              cardBg={cardBg}
              borderColor={borderColor}
              onChange={actions.setIsPublic}
            />

            <TouchableOpacity
              onPress={() => void handleSave()}
              disabled={isPending}
              activeOpacity={0.85}
              style={{
                marginTop: 8,
                backgroundColor: colors.primary,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isPending ? 0.65 : 1,
              }}>
              {isPending ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={{ color: colors.primaryForeground, fontSize: 16, fontWeight: '700' }}>
                  {t('common.save')}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}
