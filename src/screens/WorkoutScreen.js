import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useTheme, useTabSafeBottom, Eyebrow, H1, Card, FoodPlaceholder,
  PrimaryButton, SectionHeader, Icon,
} from '../components/ui';
import { WORKOUT_WEEK, TODAY_WORKOUT } from '../constants/data';
import { MONO } from '../constants/fonts';

export default function WorkoutScreen({ navigation }) {
  const t = useTheme();
  const tabBottom = useTabSafeBottom();

  const getTodayWorkout = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayIndex = (dayOfWeek + 6) % 7;
    return WORKOUT_WEEK[dayIndex] || WORKOUT_WEEK[0];
  };

  const todayWorkoutEnhanced = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayIndex = (dayOfWeek + 6) % 7;
    return WORKOUT_WEEK.map((w, i) => ({
      ...w,
      today: i === dayIndex,
    }));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBottom }}>
        <View style={{ padding: 22, paddingTop: 16 }}>
          <Eyebrow>Mes 2 · semana 3</Eyebrow>
          <H1 style={{ marginTop: 8 }}>
            Tu <Text style={{ color: t.accent, fontStyle: 'italic' }}>entrenamiento</Text>
          </H1>
          <Text style={{ color: t.muted, fontSize: 13, lineHeight: 20, marginTop: 8 }}>
            Plan de hipertrofia 4 días. Adaptado a tu objetivo de recomposición y a 3-4 sesiones/semana.
          </Text>
        </View>

        {/* Week strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, gap: 6 }}>
          {todayWorkoutEnhanced.map((w, i) => (
            <View key={i} style={{
              minWidth: 50, paddingVertical: 8, borderRadius: 12,
              backgroundColor: w.today ? t.fg : (w.done ? t.accentSoft : t.surface),
              borderWidth: 1, borderColor: w.today ? t.fg : (w.done ? t.accent + '33' : t.border),
              alignItems: 'center',
            }}>
              <Text style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1, color: w.today ? t.bg : t.muted }}>
                {w.day.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 18, color: w.today ? t.bg : t.fg, marginTop: 4 }}>{10 + i}</Text>
              {(w.done || w.today) && (
                <View style={{
                  marginTop: 4, width: 4, height: 4, borderRadius: 999,
                  backgroundColor: w.today ? t.bg : t.accent,
                }} />
              )}
            </View>
          ))}
        </ScrollView>

        {/* Today's session hero */}
        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          <Card padded={false} style={{ overflow: 'hidden' }}>
            <View style={{ position: 'relative' }}>
              <FoodPlaceholder hue={140} height={140} />
              <View style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
                backgroundColor: 'rgba(0,0,0,0.55)',
                justifyContent: 'flex-end', padding: 16,
              }}>
                {getTodayWorkout() && (
                  <>
                    <Text style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: '#fff', opacity: 0.85 }}>
                      Hoy · {getTodayWorkout().day}
                    </Text>
                    <Text style={{ fontSize: 26, color: '#fff', marginTop: 4 }}>
                      {getTodayWorkout().name} — {getTodayWorkout().duration} min
                    </Text>
                  </>
                )}
              </View>
            </View>
            <View style={{ padding: 14, gap: 0 }}>
              {TODAY_WORKOUT.exercises.map((e, i) => (
                <TouchableOpacity key={e.id} onPress={() => navigation.navigate('Exercise', { id: e.id })}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    paddingVertical: 8,
                    borderBottomWidth: i < TODAY_WORKOUT.exercises.length - 1 ? 1 : 0,
                    borderColor: t.border,
                  }}>
                  <View style={{
                    width: 28, height: 28, borderRadius: 999, backgroundColor: t.chipBg,
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Text style={{ fontSize: 14, color: t.fg }}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: t.fg }} numberOfLines={1}>{e.name}</Text>
                    <Text style={{ fontSize: 10, color: t.muted, marginTop: 2, fontFamily: MONO, letterSpacing: 0.4 }}>
                      {e.muscle.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 16, color: t.fg }}>
                      {e.sets}<Text style={{ color: t.muted, fontSize: 12 }}>×</Text>{e.reps}
                    </Text>
                    <Text style={{ fontSize: 9, color: t.muted, fontFamily: MONO, letterSpacing: 0.5 }}>{e.weight}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ marginTop: 14 }}>
                <PrimaryButton onPress={() => navigation.navigate('Exercise', { id: 'e1' })} icon="play">
                  Empezar entrenamiento
                </PrimaryButton>
              </View>
            </View>
          </Card>
        </View>

        {/* Week list */}
        <View style={{ paddingHorizontal: 22, marginTop: 24 }}>
          <SectionHeader title="Esta semana" />
          <View style={{ marginTop: 12, gap: 8 }}>
            {todayWorkoutEnhanced.map((w, i) => (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
                backgroundColor: w.today ? t.accentSoft : t.surface,
                borderWidth: 1, borderColor: w.today ? t.accent + '55' : t.border,
                borderRadius: 14,
              }}>
                <View style={{
                  width: 42, height: 42, borderRadius: 999,
                  backgroundColor: w.rest ? t.chipBg : (w.today ? t.accent : t.fg),
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon
                    name={w.rest ? 'leaf' : 'dumbbell'}
                    size={18}
                    color={w.rest ? t.muted : (w.today ? '#fff' : t.bg)}
                    strokeWidth={1.8}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text style={{ fontSize: 18, color: t.fg }}>{w.name}</Text>
                    <Text style={{ fontFamily: MONO, fontSize: 10, color: t.muted, letterSpacing: 1 }}>{w.day.toUpperCase()}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{w.focus}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: MONO, fontSize: 11, color: t.muted }}>{w.duration}min</Text>
                  {w.done && <Text style={{ fontSize: 9, color: t.accent, marginTop: 2, letterSpacing: 0.5 }}>HECHO</Text>}
                  {w.today && <Text style={{ fontSize: 9, color: t.accent, marginTop: 2, letterSpacing: 0.5 }}>HOY</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
