import * as React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import {
  ArrowLeft, Zap, Eye, Circle, RefreshCw,
  CheckCircle2, XCircle, ChevronUp, ChevronDown,
  Frown, Meh, Smile, Laugh, Flame,
} from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { ServerErrorBanner } from '@/shared/ui/server-error-banner';
import { StopwatchCard } from '@/features/stopwatch/ui/stopwatch-card';
import { useStopwatch } from '@/features/stopwatch/model/useStopwatch';
import { resolveRouteColor, ACCENT } from '@/shared/config/palette';
import { GRADES } from '@/entities/route/lib/constants';
import { useUserStore } from '@/entities/user/model/userStore';
import { useRouteQuery } from '@/entities/route/model/useRouteQuery';
import { createAscent, ascentKeys } from '@/entities/ascent/api/ascentApi';

const ASCENT_TYPES = [
  { value: 'FLASH',    label: 'Flash',    sublabel: 'Першого разу з підказками',  icon: Zap,       color: '#eab308', bg: 'rgba(234,179,8,0.12)'    },
  { value: 'ONSIGHT',  label: 'Onsight',  sublabel: 'Першого разу без підказок',  icon: Eye,       color: ACCENT,    bg: 'rgba(123,173,207,0.12)'  },
  { value: 'REDPOINT', label: 'Redpoint', sublabel: 'Після спроб — чисто',         icon: Circle,    color: '#ef4444', bg: 'rgba(239,68,68,0.12)'    },
  { value: 'REPEAT',   label: 'Repeat',   sublabel: 'Повторний пролаз',            icon: RefreshCw, color: '#6b7280', bg: 'rgba(107,114,128,0.12)'  },
] as const;

const FEELINGS = [
  { value: 1, icon: Frown, color: '#ef4444', label: 'Жахливо' },
  { value: 2, icon: Frown, color: '#f97316', label: 'Погано'  },
  { value: 3, icon: Meh,   color: '#6b7280', label: 'Нормально' },
  { value: 4, icon: Smile, color: '#84cc16', label: 'Добре'   },
  { value: 5, icon: Flame, color: '#22c55e', label: 'Супер'   },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(128,128,128,0.7)', marginBottom: 12 }}>
      {children}
    </Text>
  );
}

function extractServerError(err: unknown): string {
  const anyErr = err as { response?: { data?: { message?: string | string[] } }; message?: string };
  const raw = anyErr?.response?.data?.message;
  if (Array.isArray(raw)) return raw.join('\n');
  if (typeof raw === 'string') return raw;
  return anyErr?.message ?? 'Щось пішло не так';
}

export function LogAscentWidget() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const queryClient = useQueryClient();
  const user = useUserStore((s) => s.currentUser);
  const { data: route } = useRouteQuery(routeId ?? '');

  const stopwatch = useStopwatch();

  const [ascentType,      setAscentType]      = React.useState<string>('REDPOINT');
  const [success,         setSuccess]         = React.useState(true);
  const [attemptNumber,   setAttemptNumber]   = React.useState(1);
  const [feeling,         setFeeling]         = React.useState<number | null>(null);
  const [gradePerception, setGradePerception] = React.useState<string | null>(null);
  const [notes,           setNotes]           = React.useState('');
  const [videoUrl,        setVideoUrl]        = React.useState('');
  const [serverError,     setServerError]     = React.useState<string | null>(null);

  const cardBg      = isDark ? '#1c1c1e' : '#fff';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const inputBg     = isDark ? '#1c1c1e' : '#f2f2f7';
  const inputColor  = isDark ? '#fff' : '#000';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

  const routeColor = route ? resolveRouteColor(route.color) : '#6b7280';
  const isWhite    = route?.color?.toLowerCase() === 'white';
  const colorText  = isWhite ? '#374151' : '#ffffff';

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createAscent,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ascentKeys.all }); router.back(); },
  });

  async function handleSave() {
    if (!user || !routeId) return;
    setServerError(null);
    try {
      await mutateAsync({
        userId: user.id,
        routeId,
        type: ascentType,
        date: new Date().toISOString().split('T')[0],
        timeSeconds: stopwatch.saved && stopwatch.seconds > 0 ? stopwatch.seconds : null,
        attemptNumber: attemptNumber > 0 ? attemptNumber : null,
        success,
        gradePerception,
        feeling,
        notes: notes.trim() || null,
        videoUrl: videoUrl.trim() || null,
      });
    } catch (err) {
      setServerError(extractServerError(err));
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#f2f2f7' }}>
      <SafeAreaView edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={18} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: isDark ? '#fff' : '#000' }}>Записати пролаз</Text>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 120, gap: 12, paddingHorizontal: 16 }}>

          {/* Route preview */}
          {route && (
            <View style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: routeColor }}>
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '900', color: colorText }}>{route.grade}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: colorText }} numberOfLines={1}>{route.name}</Text>
                  {route.sector?.name && (
                    <Text style={{ fontSize: 13, color: colorText, opacity: 0.75, marginTop: 2 }}>{route.sector.name}</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          <ServerErrorBanner message={serverError} />

          {/* Stopwatch */}
          <StopwatchCard {...stopwatch} />

          {/* Ascent Type */}
          <View style={{ backgroundColor: cardBg, borderRadius: 20, padding: 16, borderWidth: 1, borderColor }}>
            <SectionLabel>Тип пролазу</SectionLabel>
            <View style={{ gap: 8 }}>
              {ASCENT_TYPES.map((type) => {
                const isActive = ascentType === type.value;
                const IconComp = type.icon;
                return (
                  <TouchableOpacity key={type.value} onPress={() => setAscentType(type.value)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, borderWidth: isActive ? 2 : 1, borderColor: isActive ? type.color : borderColor, backgroundColor: isActive ? type.bg : 'transparent' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isActive ? type.color + '22' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'), alignItems: 'center', justifyContent: 'center' }}>
                      <IconComp size={20} color={isActive ? type.color : 'rgba(128,128,128,0.6)'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: isActive ? type.color : (isDark ? '#fff' : '#000') }}>{type.label}</Text>
                      <Text style={{ fontSize: 12, color: 'rgba(128,128,128,0.7)', marginTop: 2 }}>{type.sublabel}</Text>
                    </View>
                    {isActive && (
                      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: type.color, alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={14} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Result & Attempts */}
          <View style={{ backgroundColor: cardBg, borderRadius: 20, padding: 16, borderWidth: 1, borderColor, gap: 20 }}>
            <View>
              <SectionLabel>Результат</SectionLabel>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {[
                  { val: true,  label: 'Пролаз', icon: CheckCircle2, color: '#22c55e' },
                  { val: false, label: 'Впав',   icon: XCircle,      color: '#ef4444' },
                ].map(({ val, label, icon: BtnIcon, color }) => {
                  const active = success === val;
                  return (
                    <TouchableOpacity key={label} onPress={() => setSuccess(val)}
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: active ? 2 : 1, borderColor: active ? color : borderColor, backgroundColor: active ? color + '1a' : 'transparent' }}>
                      <BtnIcon size={20} color={active ? color : 'rgba(128,128,128,0.4)'} />
                      <Text style={{ fontWeight: '700', fontSize: 15, color: active ? color : 'rgba(128,128,128,0.6)' }}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View>
              <SectionLabel>Номер спроби</SectionLabel>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity onPress={() => setAttemptNumber((n) => Math.max(1, n - 1))}
                  style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                  <ChevronDown size={20} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 36, fontWeight: '200', color: isDark ? '#fff' : '#000' }}>{attemptNumber}</Text>
                  <Text style={{ fontSize: 12, color: 'rgba(128,128,128,0.6)', marginTop: -4 }}>{attemptNumber === 1 ? 'перша спроба' : 'спроба'}</Text>
                </View>
                <TouchableOpacity onPress={() => setAttemptNumber((n) => n + 1)}
                  style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                  <ChevronUp size={20} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Feeling */}
          <View style={{ backgroundColor: cardBg, borderRadius: 20, padding: 16, borderWidth: 1, borderColor }}>
            <SectionLabel>Як відчувалось</SectionLabel>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {FEELINGS.map((f) => {
                const isActive = feeling === f.value;
                const FIcon = f.icon;
                return (
                  <TouchableOpacity key={f.value} onPress={() => setFeeling(isActive ? null : f.value)}
                    style={{ alignItems: 'center', gap: 6, flex: 1 }}>
                    <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: isActive ? f.color + '20' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'), alignItems: 'center', justifyContent: 'center', borderWidth: isActive ? 2 : 1, borderColor: isActive ? f.color : 'transparent', transform: [{ scale: isActive ? 1.1 : 1 }] }}>
                      <FIcon size={26} color={isActive ? f.color : 'rgba(128,128,128,0.4)'} />
                    </View>
                    <Text style={{ fontSize: 10, color: isActive ? f.color : 'rgba(128,128,128,0.55)', fontWeight: isActive ? '700' : '400', textAlign: 'center' }}>{f.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Grade perception */}
          <View style={{ backgroundColor: cardBg, borderRadius: 20, padding: 16, borderWidth: 1, borderColor }}>
            <SectionLabel>{gradePerception ? `Складність по відчуттю — ${gradePerception}` : 'Складність по відчуттю'}</SectionLabel>
            <Text style={{ fontSize: 12, color: 'rgba(128,128,128,0.6)', marginBottom: 10 }}>Який грейд цей маршрут заслуговує на твою думку?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {GRADES.map((g) => {
                  const isActive = gradePerception === g;
                  return (
                    <TouchableOpacity key={g} onPress={() => setGradePerception(isActive ? null : g)}
                      style={{ height: 44, minWidth: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: isActive ? 2 : 1, borderColor: isActive ? ACCENT : borderColor, backgroundColor: isActive ? ACCENT + '20' : 'transparent', paddingHorizontal: 10 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: isActive ? ACCENT : 'rgba(128,128,128,0.7)' }}>{g}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Notes */}
          <View style={{ backgroundColor: cardBg, borderRadius: 20, padding: 16, borderWidth: 1, borderColor }}>
            <SectionLabel>{"Нотатки (необов'язково)"}</SectionLabel>
            <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={4}
              placeholder="Бета, де застряг, що спрацювало..." placeholderTextColor={placeholderColor}
              style={{ backgroundColor: inputBg, color: inputColor, fontSize: 14, borderRadius: 12, padding: 14, minHeight: 88, textAlignVertical: 'top' }} />
          </View>

          {/* Video URL */}
          <View style={{ backgroundColor: cardBg, borderRadius: 20, padding: 16, borderWidth: 1, borderColor }}>
            <SectionLabel>{"Відео (необов'язково)"}</SectionLabel>
            <TextInput value={videoUrl} onChangeText={setVideoUrl} placeholder="https://youtube.com/..."
              placeholderTextColor={placeholderColor} keyboardType="url" autoCapitalize="none"
              style={{ backgroundColor: inputBg, color: inputColor, fontSize: 14, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 }} />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save button */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: isDark ? '#000' : '#f2f2f7', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 36 : 20, borderTopWidth: 1, borderTopColor: borderColor }}>
        <TouchableOpacity onPress={handleSave} disabled={isPending}
          style={{ backgroundColor: success ? '#22c55e' : '#ef4444', borderRadius: 18, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', opacity: isPending ? 0.6 : 1 }}
          activeOpacity={0.85}>
          {isPending ? <ActivityIndicator color="#fff" /> : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {success ? <CheckCircle2 size={20} color="#fff" /> : <XCircle size={20} color="#fff" />}
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{success ? 'Записати пролаз' : 'Записати спробу'}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
