import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTheme, FoodPlaceholder, IconButton, Eyebrow, H1, Card,
  SectionHeader, DataPoint, Divider, Icon,
} from '../components/ui';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

export default function ExerciseScreen({ navigation, route }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { workoutPlans } = useApp();
  const planId = route.params?.planId;

  const plan = planId ? workoutPlans.find(p => p.id === planId) : null;
  const exercises = plan?.exercises || [];

  const [setsDone, setSetsDone] = useState({});
  const [resting, setResting] = useState(false);
  const [seconds, setSeconds] = useState(90);

  useEffect(() => {
    if (!resting) return;
    if (seconds <= 0) { setResting(false); return; }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resting, seconds]);

  const completeSet = (exId, setIdx) => {
    const key = `${exId}-${setIdx}`;
    setSetsDone(prev => ({ ...prev, [key]: !prev[key] }));
    if (!setsDone[key]) { setSeconds(exercises.find(e => e.id === exId)?.rest || 90); setResting(true); }
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!plan) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ color: t.muted, fontSize: 14 }}>Entreno no encontrado</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: t.accent, fontSize: 14 }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ position: 'relative' }}>
          <View style={{ height: 220, backgroundColor: t.fg }}>
            <FoodPlaceholder hue={140} height={220} style={{ opacity: 0.4 }} />
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <View style={{
                width: 70, height: 70, borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.92)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="play" size={28} color={t.fg} strokeWidth={2} />
              </View>
            </View>
          </View>
          <View style={{ position: 'absolute', top: insets.top + 12, left: 22, right: 22, flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton icon="chevronL" onPress={() => navigation.goBack()} />
          </View>
        </View>

        <View style={{ padding: 22 }}>
          <Eyebrow>{plan.focus}</Eyebrow>
          <H1 style={{ marginTop: 6, fontSize: 30 }}>{plan.name}</H1>
          <DataPoint label="Duración" value={`${plan.duration} min`} />
        </View>

        {/* Exercises */}
        <View style={{ paddingHorizontal: 22 }}>
          <SectionHeader title="Ejercicios" />
          <View style={{ marginTop: 12, gap: 10 }}>
            {exercises.map((ex, i) => (
              <Card key={ex.id} style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 32, height: 32, borderRadius: 999,
                    backgroundColor: t.chipBg, alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 14, color: t.fg }}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, color: t.fg, fontWeight: '500' }}>{ex.name}</Text>
                    <Text style={{ fontSize: 10, color: t.muted, marginTop: 2, fontFamily: MONO, letterSpacing: 0.4 }}>
                      {ex.muscle?.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 15, color: t.fg }}>
                    {ex.sets}×{ex.reps}
                  </Text>
                  {ex.weight && <Text style={{ fontSize: 12, color: t.muted, fontFamily: MONO }}>{ex.weight}</Text>}
                </View>

                {/* Sets tracker */}
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                  {Array.from({ length: ex.sets || 3 }).map((_, si) => {
                    const key = `${ex.id}-${si}`;
                    const done = setsDone[key];
                    return (
                      <TouchableOpacity key={si} onPress={() => completeSet(ex.id, si)}
                        style={{
                          flex: 1, height: 36, borderRadius: 8,
                          backgroundColor: done ? t.accent : t.surface,
                          borderWidth: 1, borderColor: done ? t.accent : t.border2,
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                        <Text style={{ color: done ? '#fff' : t.muted, fontSize: 11, fontFamily: MONO }}>
                          {done ? '✓' : `${si + 1}`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Card>
            ))}
          </View>

          {/* Rest timer */}
          {resting && (
            <View style={{
              marginTop: 16, padding: 18, borderRadius: 16,
              backgroundColor: t.fg, flexDirection: 'row', alignItems: 'center', gap: 16,
            }}>
              <View style={{
                width: 56, height: 56, borderRadius: 999,
                borderWidth: 2, borderColor: t.accent,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="timer" size={24} color={t.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: t.bg, opacity: 0.6 }}>
                  Descanso
                </Text>
                <Text style={{ fontSize: 32, color: t.bg, lineHeight: 36, marginTop: 2 }}>{fmtTime(seconds)}</Text>
              </View>
              <TouchableOpacity onPress={() => setResting(false)} style={{
                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
              }}>
                <Text style={{ color: t.bg, fontSize: 12, fontWeight: '600' }}>Saltar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
