import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
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
          contentContainerStyle={{ paddingHorizontal: 22, gap: 6 }}>
          {DAY_LABELS.map((d, i) => {
            const w = currentPlan.find(p => p.day_of_week === i);
            const isToday = i === todayDayIndex;
            return (
              <TouchableOpacity key={d} onPress={() => {
                if (w) navigation.navigate('Exercise', { planId: w.id, day: i });
              }} style={{
                minWidth: 50, paddingVertical: 8, borderRadius: 12,
                backgroundColor: isToday ? t.fg : (w?.done ? t.accentSoft : t.surface),
                borderWidth: 1, borderColor: isToday ? t.fg : (w?.done ? t.accent + '33' : t.border),
                alignItems: 'center',
              }}>
                <Text style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1, color: isToday ? t.bg : t.muted }}>
                  {d.toUpperCase()}
                </Text>
                <Text style={{ fontSize: 18, color: isToday ? t.bg : t.fg, marginTop: 4 }}>{10 + i}</Text>
                {(w?.done || isToday) && (
                  <View style={{ marginTop: 4, width: 4, height: 4, borderRadius: 999, backgroundColor: isToday ? t.bg : t.accent }} />
                )}
              </TouchableOpacity>
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
              <View style={{ padding: 14 }}>
                {(todayWorkout.exercises || []).map((e, i) => (
                  <View key={e.id} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    paddingVertical: 8,
                    borderBottomWidth: i < todayWorkout.exercises.length - 1 ? 1 : 0,
                    borderColor: t.border,
                  }}>
                    <View style={{ width: 28, height: 28, borderRadius: 999, backgroundColor: t.chipBg, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 14, color: t.fg }}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: t.fg }} numberOfLines={1}>{e.name}</Text>
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
                <View style={{ marginTop: 14 }}>
                  <PrimaryButton onPress={() => navigation.navigate('Exercise', { planId: todayWorkout.id })} icon="play">
                    Empezar entrenamiento
                  </PrimaryButton>
                </View>
                {!todayWorkout.done && (
                  <TouchableOpacity onPress={() => markWorkoutDone(todayWorkout.id)} style={{ alignItems: 'center', marginTop: 10 }}>
                    <Text style={{ color: t.muted, fontSize: 12 }}>Marcar como hecho</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          </View>
        )}

        {/* Full week */}
        <View style={{ paddingHorizontal: 22, marginTop: 24 }}>
          <SectionHeader title="Esta semana" />
          <View style={{ marginTop: 12, gap: 8 }}>
            {DAY_LABELS.map((d, i) => {
              const w = currentPlan.find(p => p.day_of_week === i);
              const isToday = i === todayDayIndex;
              if (!w) return null;
              return (
                <TouchableOpacity key={d} onPress={() => navigation.navigate('Exercise', { planId: w.id })}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
                    backgroundColor: isToday ? t.accentSoft : t.surface,
                    borderWidth: 1, borderColor: isToday ? t.accent + '55' : t.border,
                    borderRadius: 14,
                  }}>
                  <View style={{
                    width: 42, height: 42, borderRadius: 999,
                    backgroundColor: isToday ? t.accent : t.fg,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="dumbbell" size={18} color={isToday ? '#fff' : t.bg} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, color: t.fg }}>{w.name}</Text>
                    <Text style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>{d} · {w.focus}</Text>
                  </View>
                  <Text style={{ fontFamily: MONO, fontSize: 11, color: t.muted }}>{w.duration}min</Text>
                  {w.done && <Text style={{ fontSize: 9, color: t.accent, letterSpacing: 0.5 }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Generate new plan */}
        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          <GhostButton full icon="sparkle" onPress={() => navigation.navigate('WorkoutSurvey')}>
            Generar nuevo plan semanal
          </GhostButton>
        </View>

        {/* PRs link */}
        <View style={{ paddingHorizontal: 22, marginTop: 12 }}>
          <GhostButton full icon="weight" onPress={() => navigation.navigate('Prs')}>
            Mis marcas personales (PRs)
          </GhostButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
