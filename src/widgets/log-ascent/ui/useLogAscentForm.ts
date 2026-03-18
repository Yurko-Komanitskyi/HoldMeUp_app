import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { parseApiError } from '@/shared/lib/api-error';
import { createAscent, ascentKeys } from '@/entities/ascent/api/ascentApi';
import type { CreateAscentInput } from '@/entities/ascent/api/types';

type Feeling = string | null;

interface LogAscentState {
  ascentType: string;
  success: boolean;
  attemptNumber: number;
  feeling: Feeling;
  gradePerception: string | null;
  notes: string;
  videoUrl: string;
  serverError: string | null;
}

interface UseLogAscentFormResult {
  state: LogAscentState;
  actions: {
    setAscentType: (v: string) => void;
    setSuccess: (v: boolean) => void;
    setAttemptNumber: (updater: (n: number) => number) => void;
    setFeeling: (v: Feeling) => void;
    setGradePerception: (v: string | null) => void;
    setNotes: (v: string) => void;
    setVideoUrl: (v: string) => void;
    clearServerError: () => void;
  };
  submit: () => Promise<void>;
  isPending: boolean;
  reset: () => void;
}

export function useLogAscentForm(
  userId: string | undefined,
  routeId: string | undefined,
  timeSeconds: number | null
): UseLogAscentFormResult {
  const queryClient = useQueryClient();
  const initialState = React.useRef<LogAscentState>({
    ascentType: 'SEND',
    success: true,
    attemptNumber: 1,
    feeling: null,
    gradePerception: null,
    notes: '',
    videoUrl: '',
    serverError: null,
  }).current;

  const [state, setState] = React.useState<LogAscentState>(initialState);

  const setField = <K extends keyof LogAscentState>(key: K, value: LogAscentState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const mutation = useMutation({
    mutationFn: async (input: CreateAscentInput) => createAscent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ascentKeys.all });
    },
  });

  async function submit() {
    if (!userId || !routeId) return;
    setField('serverError', null);

    try {
      const payload: CreateAscentInput = {
        routeId,
        userId,
        type: state.ascentType,
        date: new Date().toISOString(),
        success: state.success,
        attemptNumber: state.attemptNumber,
        timeSeconds: timeSeconds ?? null,
        feeling: state.feeling ? Number(state.feeling) : null,
        gradePerception: state.gradePerception ?? null,
        notes: state.notes.trim() || null,
        videoUrl: state.videoUrl.trim() || null,
      };

      await mutation.mutateAsync(payload);
    } catch (error) {
      const { message } = parseApiError(error);
      setField('serverError', message);
      throw error;
    }
  }

  return {
    state,
    actions: {
      setAscentType: (v) => setField('ascentType', v),
      setSuccess: (v) => setField('success', v),
      setAttemptNumber: (updater) =>
        setState((prev) => ({ ...prev, attemptNumber: updater(prev.attemptNumber) })),
      setFeeling: (v) => setField('feeling', v),
      setGradePerception: (v) => setField('gradePerception', v),
      setNotes: (v) => setField('notes', v),
      setVideoUrl: (v) => setField('videoUrl', v),
      clearServerError: () => setField('serverError', null),
    },
    submit,
    isPending: mutation.isPending,
    reset: () => setState(initialState),
  };
}

