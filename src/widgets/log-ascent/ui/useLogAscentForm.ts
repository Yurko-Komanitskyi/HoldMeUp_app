import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { parseApiError } from '@/shared/lib/api-error';
import { createAscent, ascentKeys, fetchAscents } from '@/entities/ascent/api/ascentApi';
import type { CreateAscentInput } from '@/entities/ascent/api/types';
import { statsKeys } from '@/entities/stats/api/statsApi';

type Feeling = string | null;

const NOTES_MAX_LEN = 2000;
const VIDEO_URL_MAX_LEN = 2000;
const ATTEMPT_MAX = 9999;

const LOG_ASCENT_VALIDATION_FIELD_ORDER = ['ascentType', 'attemptNumber', 'notes', 'videoUrl'] as const;

export type LogAscentSubmitOutcome =
  | { outcome: 'success' }
  | {
      outcome: 'validation';
      firstField: 'ascentType' | 'attemptNumber' | 'notes' | 'videoUrl';
    }
  | { outcome: 'server' }
  | { outcome: 'skipped' };

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

interface LogAscentValidationErrors {
  ascentType?: string;
  attemptNumber?: string;
  notes?: string;
  videoUrl?: string;
}

function firstLogAscentValidationField(errors: LogAscentValidationErrors) {
  for (const key of LOG_ASCENT_VALIDATION_FIELD_ORDER) {
    if (errors[key]) return key;
  }
  return 'ascentType';
}

interface UseLogAscentFormResult {
  state: LogAscentState;
  previousAttempts: number;
  validationErrors: LogAscentValidationErrors;
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
  submit: () => Promise<LogAscentSubmitOutcome>;
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
    ascentType: 'FLASH',
    success: true,
    attemptNumber: 1,
    feeling: null,
    gradePerception: null,
    notes: '',
    videoUrl: '',
    serverError: null,
  }).current;

  const [state, setState] = React.useState<LogAscentState>(initialState);
  const [validationErrors, setValidationErrors] = React.useState<LogAscentValidationErrors>({});

  const historyQuery = useQuery({
    queryKey: [...ascentKeys.list(), 'attempt-history', { userId: userId ?? '', routeId: routeId ?? '' }],
    queryFn: () =>
      fetchAscents({
        userId: userId as string,
        routeId: routeId as string,
        page: 1,
        limit: 200,
      }),
    enabled: !!userId && !!routeId,
  });

  const previousAttempts = React.useMemo(() => historyQuery.data?.data.length ?? 0, [historyQuery.data?.data.length]);

  React.useEffect(() => {
    if (!userId || !routeId) return;
    const nextAttempt = Math.max(1, previousAttempts + 1);
    setState((prev) => {
      const nextType = previousAttempts > 0 && prev.ascentType === 'FLASH' ? 'REDPOINT' : prev.ascentType;
      if (prev.attemptNumber === nextAttempt && prev.ascentType === nextType) return prev;
      return { ...prev, attemptNumber: nextAttempt, ascentType: nextType };
    });
  }, [previousAttempts, userId, routeId]);

  const setField = <K extends keyof LogAscentState>(key: K, value: LogAscentState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    if (key === 'ascentType' || key === 'attemptNumber' || key === 'videoUrl' || key === 'notes') {
      setValidationErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const mutation = useMutation({
    mutationFn: async (input: CreateAscentInput) => createAscent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ascentKeys.all });
      queryClient.invalidateQueries({ queryKey: statsKeys.all });
    },
  });

  async function submit(): Promise<LogAscentSubmitOutcome> {
    if (!userId || !routeId) return { outcome: 'skipped' };
    setField('serverError', null);
    const nextErrors: LogAscentValidationErrors = {};
    if (!state.ascentType?.trim()) {
      nextErrors.ascentType = 'logAscent.validationTypeRequired';
    }
    if (!Number.isFinite(state.attemptNumber) || state.attemptNumber < 1) {
      nextErrors.attemptNumber = 'logAscent.validationAttemptPositive';
    } else if (state.attemptNumber > ATTEMPT_MAX) {
      nextErrors.attemptNumber = 'logAscent.validationAttemptMax';
    }
    const notesLen = state.notes.length;
    if (notesLen > NOTES_MAX_LEN) {
      nextErrors.notes = 'logAscent.validationNotesMax';
    }
    const video = state.videoUrl.trim();
    if (video.length > VIDEO_URL_MAX_LEN) {
      nextErrors.videoUrl = 'logAscent.validationVideoUrlLength';
    } else if (video.length > 0 && !/^https?:\/\/.+/i.test(video)) {
      nextErrors.videoUrl = 'logAscent.validationVideoUrl';
    }
    setValidationErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return { outcome: 'validation', firstField: firstLogAscentValidationField(nextErrors) };
    }

    try {
      const payload: CreateAscentInput = {
        routeId,
        userId,
        type: previousAttempts > 0 && state.ascentType === 'FLASH' ? 'REDPOINT' : state.ascentType,
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
      return { outcome: 'success' };
    } catch (error) {
      const { message } = parseApiError(error);
      setField('serverError', message);
      return { outcome: 'server' };
    }
  }

  const resetForm = React.useCallback(() => {
    setState(initialState);
    setValidationErrors({});
  }, [initialState]);

  return {
    state,
    previousAttempts,
    validationErrors,
    actions: {
      setAscentType: (v) => setField('ascentType', v),
      setSuccess: (v) => setField('success', v),
      setAttemptNumber: (updater) => {
        setState((prev) => ({ ...prev, attemptNumber: updater(prev.attemptNumber) }));
        setValidationErrors((prev) => ({ ...prev, attemptNumber: undefined }));
      },
      setFeeling: (v) => setField('feeling', v),
      setGradePerception: (v) => setField('gradePerception', v),
      setNotes: (v) => setField('notes', v),
      setVideoUrl: (v) => setField('videoUrl', v),
      clearServerError: () => setField('serverError', null),
    },
    submit,
    isPending: mutation.isPending,
    reset: resetForm,
  };
}

