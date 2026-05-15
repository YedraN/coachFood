import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useTheme, useTabSafeBottom, Eyebrow, H1, Card, FoodPlaceholder,
  PrimaryButton, SectionHeader, Icon, GhostButton,
} from '../components/ui';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function WorkoutScreen({ navigation }) {
  const t = useTheme();
  const tabBottom = useTabSafeBottom();
  const { workoutPlans, user, markWorkoutDone } = useApp();

  const hasPlan = workoutPlans.length > 0;
  const hasSurvey = user?.hasDoneWorkoutSurvey;

  const currentPlan = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    const weekStr = weekStart.toISOString().slice(0, 10);
    return workoutPlans.filter(p => p.week_start === weekStr).sort((a, b) => a.day_of_week - b.day_of_week);
  }, [workoutPlans]);

  const today = new Date();
  const todayDayIndex = (today.getDay() + 6) % 7;
  const todayWorkout = currentPlan.find(p => p.day_of_week === todayDayIndex);

  if (!hasPlan) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 999,
            backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="dumbbell" size={36} color={t.muted} />
          </View>
          <H1 style={{ textAlign: 'center' }}>Sin plan de entreno</H1>
          <Text style={{ fontSize: 13, color: t.muted, textAlign: 'center', lineHeight: 20 }}>
            {hasSurvey
              ? 'Tu plan de la semana anterior ha expirado. Genera uno nuevo.'
              : 'Responde unas preguntas y la IA creará un plan semanal personalizado para ti.'}
          </Text>
          <PrimaryButton icon="sparkle" onPress={() => navigation.navigate('WorkoutSurvey')}>
            {hasSurvey ? 'Generar nuevo plan' : 'Comenzar cuestionario'}
          </PrimaryButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBottom }}>
        <View style={{ padding: 22, paddingTop: 16 }}>
          <Eyebrow>Plan semanal</Eyebrow>
          <H1 style={{ marginTop: 8 }}>
            Tu <Text style={{ color: t.accent, fontStyle: 'italic' }}>entreno</Text>
          </H1>
        </View>

        {/* Week strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, gap: 8 }}>
          {DAY_LABELS.map((d, i) => {
            const w = currentPlan.find(p => p.day_of_week === i);
            const isToday = i === todayDayIndex;
            return (
              <View key={d} style={{ borderRadius: 14, overflow: 'hidden' }}>
                <Pressable
                  onPress={() => { if (w) navigation.navigate('Exercise', { planId: w.id, day: i }); }}
                  android_ripple={{ color: isToday ? 'rgba(255,255,255,0.2)' : t.border }}
                  style={({ pressed }) => ({
                    minWidth: 54, paddingVertical: 10, borderRadius: 14,
                    backgroundColor: isToday ? t.fg : (w?.done ? t.accentSoft : t.surface),
                    borderWidth: 1, borderColor: isToday ? t.fg : (w?.done ? t.accent + '33' : t.border),
                    alignItems: 'center',
                    opacity: Platform.OS === 'ios' && pressed ? 0.7 : 1,
                  })}>
                  <Text allowFontScaling={false} style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1, color: isToday ? t.bg : t.muted }}>
                    {d.toUpperCase()}
                  </Text>
                  <Text allowFontScaling={false} style={{ fontSize: 20, color: isToday ? t.bg : t.fg, marginTop: 4 }}>{10 + i}</Text>
                  {(w?.done || isToday) && (
                    <View style={{ marginTop: 4, width: 5, height: 5, borderRadius: 999, backgroundColor: isToday ? t.bg : t.accent }} />
                  )}
                </Pressable>
              </View>
            );
          })}
        </ScrollView>

        {/* Today's workout */}
        {todayWorkout && (
          <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
            <Card padded={false} style={{ overflow: 'hidden' }}>
              <View style={{ position: 'relative' }}>
                <FoodPlaceholder hue={140} height={140} />
                <View style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  justifyContent: 'flex-end', padding: 16,
                }}>
                  <Text style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: '#fff', opacity: 0.85 }}>
                    Hoy · {todayWorkout.name}
                  </Text>
                  <Text style={{ fontSize: 26, color: '#fff', marginTop: 4 }}>
                    {todayWorkout.focus} — {todayWorkout.duration} min
                  </Text>
                </View>
              </View>
              <View style={{ padding: 16 }}>
                {(todayWorkout.exercises || []).map((e, i) => (
                  <View key={e.id} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 14,
                    paddingVertical: 10,
                    borderBottomWidth: i < todayWorkout.exercises.length - 1 ? 1 : 0,
                    borderColor: t.border,
                  }}>
                    <View style={{ width: 32, height: 32, borderRadius: 999, backgroundColor: t.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 15, color: t.fg }}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '500', color: t.fg }} numberOfLines={1}>{e.name}</Text>
                      <Text style={{ fontSize: 10, color: t.muted, marginTop: 2, fontFamily: MONO, letterSpacing: 0.4 }}>
                        {e.muscle.toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 16, color: t.fg }}>{e.sets}×{e.reps}</Text>
                      <Text style={{ fontSize: 9, color: t.muted, fontFamily: MONO, letterSpacing: 0.5 }}>{e.weight || ''}</Text>
                    </View>
                  </View>
                ))}
                <View style={{ marginTop: 16 }}>
                  <PrimaryButton onPress={() => navigation.navigate('Exercise', { planId: todayWorkout.id })} icon="play">
                    Empezar entrenamiento
                  </PrimaryButton>
                </View>
                {!todayWorkout.done && (
                  <TouchableOpacity onPress={() => markWorkoutDone(todayWorkout.id)} style={{ alignItems: 'center', marginTop: 12 }}>
                    <Text style={{ color: t.muted, fontSize: 13 }}>Marcar como hecho</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          </View>
        )}

        {/* Full week */}
        <View style={{ paddingHorizontal: 22, marginTop: 28 }}>
          <SectionHeader title="Esta semana" />
          <View style={{ marginTop: 14, gap: 10 }}>
            {DAY_LABELS.map((d, i) => {
              const w = currentPlan.find(p => p.day_of_week === i);
              const isToday = i === todayDayIndex;
              if (!w) return null;
              return (
                <View key={d} style={{ borderRadius: 14, overflow: 'hidden' }}>
                  <Pressable
                    onPress={() => navigation.navigate('Exercise', { planId: w.id })}
                    android_ripple={{ color: isToday ? t.accent + '33' : t.border }}
                    style={({ pressed }) => ({
                      flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
                      backgroundColor: isToday ? t.accentSoft : t.surface,
                      borderWidth: 1, borderColor: isToday ? t.accent + '55' : t.border,
                      borderRadius: 14,
                      opacity: Platform.OS === 'ios' && pressed ? 0.7 : 1,
                    })}>
                    <View style={{
                      width: 44, height: 44, borderRadius: 999,
                      backgroundColor: isToday ? t.accent : t.fg,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name="dumbbell" size={20} color={isToday ? '#fff' : t.bg} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text allowFontScaling={false} style={{ fontSize: 16, color: t.fg }}>{w.name}</Text>
                      <Text allowFontScaling={false} style={{ fontSize: 12, color: t.muted, marginTop: 3 }}>{d} · {w.focus}</Text>
                    </View>
                    <Text allowFontScaling={false} style={{ fontFamily: MONO, fontSize: 11, color: t.muted }}>{w.duration}min</Text>
                    {w.done && <Text allowFontScaling={false} style={{ fontSize: 10, color: t.accent, letterSpacing: 0.5 }}>✓</Text>}
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        {/* Generate new plan */}
        <View style={{ paddingHorizontal: 22, marginTop: 24 }}>
          <GhostButton full icon="sparkle" onPress={() => navigation.navigate('WorkoutSurvey')}>
            Generar nuevo plan semanal
          </GhostButton>
        </View>

        {/* PRs link */}
        <View style={{ paddingHorizontal: 22, marginTop: 14 }}>
          <GhostButton full icon="weight" onPress={() => navigation.navigate('Prs')}>
            Mis marcas personales (PRs)
          </GhostButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
