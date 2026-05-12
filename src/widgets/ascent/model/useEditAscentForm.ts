import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { parseApiError } from '@/shared/lib/api-error';
import { updateAscent, ascentKeys } from '@/entities/ascent/api/ascentApi';
import type { UpdateAscentInput } from '@/entities/ascent/api/types';
import { statsKeys } from '@/entities/stats/api/statsApi';
import { AscentType, type Ascent } from '@/entities/ascent/model/ascent';

export interface EditAscentFormState {
  ascentType: AscentType | null;
  success: boolean;
  attemptNumber: number;
  feeling: string | null;
  gradePerception: string | null;
  notes: string;
  videoUrl: string;
  timeInput: string;
  isPublic: boolean;
  serverError: string | null;
}

function ascentToState(ascent: Ascent): EditAscentFormState {
  return {
    ascentType: ascent.success ? (ascent.type ?? null) : null,
    success: ascent.success,
    attemptNumber: ascent.attemptNumber ?? 1,
    feeling: ascent.feeling != null ? String(ascent.feeling) : null,
    gradePerception: ascent.gradePerception,
    notes: ascent.notes ?? '',
    videoUrl: ascent.videoUrl ?? '',
    timeInput: ascent.timeSeconds != null ? String(ascent.timeSeconds) : '',
    isPublic: ascent.isPublic ?? true,
    serverError: null,
  };
}

export function useEditAscentForm(ascent: Ascent | undefined, visible: boolean) {
  const queryClient = useQueryClient();
  const [state, setState] = React.useState<EditAscentFormState | null>(null);

  React.useEffect(() => {
    if (!ascent) {
      setState(null);
      return;
    }
    if (visible) {
      setState(ascentToState(ascent));
    }
  }, [ascent?.id, ascent?.updatedAt, visible]);

  const mutation = useMutation({
    mutationFn: (input: UpdateAscentInput) => updateAscent(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ascentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ascentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: statsKeys.all });
    },
  });

  const setField = <K extends keyof EditAscentFormState>(key: K, value: EditAscentFormState[K]) => {
    setState((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const actions = {
    setAscentType: (v: AscentType) => setField('ascentType', v),
    setSuccess: (v: boolean) => {
      setState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          success: v,
          ascentType: v ? (prev.ascentType ?? AscentType.REDPOINT) : null,
        };
      });
    },
    setAttemptNumber: (updater: (n: number) => number) =>
      setState((prev) => (prev ? { ...prev, attemptNumber: updater(prev.attemptNumber) } : prev)),
    setFeeling: (v: string | null) => setField('feeling', v),
    setGradePerception: (v: string | null) => setField('gradePerception', v),
    setNotes: (v: string) => setField('notes', v),
    setVideoUrl: (v: string) => setField('videoUrl', v),
    setTimeInput: (v: string) => setField('timeInput', v),
    setIsPublic: (v: boolean) => setField('isPublic', v),
    clearServerError: () => setField('serverError', null),
    resetFromAscent: () => {
      if (ascent) setState(ascentToState(ascent));
    },
  };

  async function submit() {
    if (!ascent || !state) {
      throw new Error('no-ascent');
    }
    setField('serverError', null);
    const raw = state.timeInput.trim();
    let timeSeconds: number | null = null;
    if (raw !== '') {
      const n = Number(raw);
      if (Number.isNaN(n) || n < 0) {
        setField('serverError', 'INVALID_TIME');
        throw new Error('validation');
      }
      timeSeconds = Math.round(n);
    }

    const payload: UpdateAscentInput = {
      id: ascent.id,
      type: state.success ? state.ascentType : null,
      success: state.success,
      attemptNumber: state.attemptNumber,
      timeSeconds,
      feeling: state.feeling ? Number(state.feeling) : null,
      gradePerception: state.gradePerception,
      notes: state.notes.trim() || null,
      videoUrl: state.videoUrl.trim() || null,
      isPublic: state.isPublic,
    };

    try {
      await mutation.mutateAsync(payload);
    } catch (error) {
      const { message } = parseApiError(error);
      setField('serverError', message);
      throw error;
    }
  }

  return {
    state,
    actions,
    submit,
    isPending: mutation.isPending,
  };
}
