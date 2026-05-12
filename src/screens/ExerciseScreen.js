import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTheme, FoodPlaceholder, IconButton, Eyebrow, H1, Card,
  SectionHeader, DataPoint, Divider, Icon,
} from '../components/ui';
import { TODAY_WORKOUT, EXERCISE_DETAIL } from '../constants/data';
import { MONO } from '../constants/fonts';

export default function ExerciseScreen({ navigation, route }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const id = route.params?.id || 'e1';
  const ex = TODAY_WORKOUT.exercises.find(e => e.id === id) || TODAY_WORKOUT.exercises[0];
  const detail = EXERCISE_DETAIL[id] || EXERCISE_DETAIL.e1;

  const [setsDone, setSetsDone] = useState(Array(ex.sets).fill(false));
  const [resting, setResting] = useState(false);
  const [seconds, setSeconds] = useState(ex.rest);

  useEffect(() => {
    if (!resting) return;
    if (seconds <= 0) { setResting(false); return; }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resting, seconds]);

  const completeSet = (i) => {
    const next = [...setsDone];
    next[i] = !next[i];
    setSetsDone(next);
    if (next[i]) { setSeconds(ex.rest); setResting(true); }
    else setResting(false);
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero */}
        <View style={{ position: 'relative' }}>
          <View style={{ height: 300, backgroundColor: t.fg }}>
            <FoodPlaceholder hue={140} height={300} style={{ opacity: 0.4 }} />
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <View style={{
                width: 70, height: 70, borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.92)',
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 10,
              }}>
                <Icon name="play" size={28} color={t.fg} strokeWidth={2} />
              </View>
            </View>
          </View>
          <View style={{ position: 'absolute', top: insets.top + 12, left: 22, right: 22, flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton icon="chevronL" onPress={() => navigation.goBack()} />
            <IconButton icon="settings" onPress={() => {}} />
          </View>
        </View>

        <View style={{ padding: 22 }}>
          <Eyebrow>{detail.muscle}</Eyebrow>
          <H1 style={{ marginTop: 6, fontSize: 30 }}>{ex.name}</H1>

          <View style={{ flexDirection: 'row', gap: 14, marginTop: 14 }}>
            <DataPoint label="Series" value={ex.sets} />
            <Divider />
            <DataPoint label="Reps" value={ex.reps} />
            <Divider />
            <DataPoint label="Carga" value={ex.weight} />
            <Divider />
            <DataPoint label="Descanso" value={`${ex.rest}s`} />
          </View>
        </View>

        {/* Sets tracker */}
        <View style={{ paddingHorizontal: 22 }}>
          <SectionHeader title="Tus series" />
          <View style={{ marginTop: 12, gap: 8 }}>
            {Array.from({ length: ex.sets }).map((_, i) => (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12,
                backgroundColor: setsDone[i] ? t.accentSoft : t.surface,
                borderWidth: 1, borderColor: setsDone[i] ? t.accent + '55' : t.border,
                borderRadius: 14,
              }}>
                <View style={{
                  width: 32, height: 32, borderRadius: 999,
                  backgroundColor: setsDone[i] ? t.accent : t.chipBg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {setsDone[i]
                    ? <Icon name="check" size={14} color="#fff" strokeWidth={2.5} />
                    : <Text style={{ fontSize: 16, color: t.fg }}>{i + 1}</Text>
                  }
                </View>
                <View style={{ flex: 1, flexDirection: 'row', gap: 16 }}>
                  <SetField t={t} label="Reps" value={ex.reps.split('-')[0]} />
                  <SetField t={t} label="Kg" value={ex.weight.replace(/\D+/g, '')} />
                </View>
                <TouchableOpacity onPress={() => completeSet(i)} style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                  borderWidth: 1, borderColor: setsDone[i] ? t.accent : t.border2,
                  backgroundColor: setsDone[i] ? t.accent : 'transparent',
                }}>
                  <Text style={{ color: setsDone[i] ? '#fff' : t.fg, fontSize: 12, fontWeight: '600' }}>
                    {setsDone[i] ? 'Hecha' : 'Marcar'}
                  </Text>
                </TouchableOpacity>
              </View>
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

        {/* Technique cues */}
        <View style={{ paddingHorizontal: 22, marginTop: 24 }}>
          <SectionHeader title="Técnica" />
          <View style={{ marginTop: 12, gap: 0 }}>
            {detail.cues.map((c, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12, paddingVertical: 10 }}>
                <Text style={{ fontFamily: MONO, fontSize: 11, color: t.accent }}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={{ flex: 1, fontSize: 13, lineHeight: 20, color: t.fg }}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* History */}
        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          <SectionHeader title="Histórico" />
          <Card style={{ marginTop: 12 }}>
            {detail.history.map((h, i) => (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                borderBottomWidth: i < detail.history.length - 1 ? 1 : 0, borderColor: t.border,
              }}>
                <Text style={{ flex: 1, fontFamily: MONO, fontSize: 11, color: t.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {h.date}
                </Text>
                <Text style={{ fontSize: 18, color: t.fg }}>
                  {h.weight}<Text style={{ fontSize: 12, color: t.muted }}> kg</Text>
                </Text>
                <Text style={{ marginLeft: 14, fontFamily: MONO, fontSize: 11, color: t.muted }}>×{h.reps} reps</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

function SetField({ t, label, value }) {
  return (
    <View>
      <Text style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1, color: t.muted, textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ fontSize: 18, color: t.fg, marginTop: 2 }}>{value}</Text>
    </View>
  );
}
