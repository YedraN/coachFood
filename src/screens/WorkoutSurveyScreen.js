import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Eyebrow, H1, PrimaryButton, Icon } from '../components/ui';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

const GOALS = [
  { id: 'strength',    icon: 'weight',    title: 'Fuerza',       sub: 'Más peso en menos reps' },
  { id: 'hypertrophy', icon: 'dumbbell',  title: 'Hipertrofia',  sub: 'Crecimiento muscular' },
  { id: 'endurance',   icon: 'walk',      title: 'Resistencia',  sub: 'Más reps, menos peso' },
  { id: 'general',     icon: 'leaf',      title: 'Salud general', sub: 'Mantenerme activo' },
];

const LEVELS = [
  { id: 'beginner',     title: 'Principiante',   sub: 'Nunca o pocos meses entrenando' },
  { id: 'intermediate', title: 'Intermedio',     sub: 'Entreno 1-2 años consistentes' },
  { id: 'advanced',     title: 'Avanzado',       sub: '3+ años con buena técnica' },
];

const EQUIPMENT = [
  { id: 'bar',    label: 'Barra olímpica' },
  { id: 'db',     label: 'Mancuernas' },
  { id: 'kettle', label: 'Kettlebells' },
  { id: 'pully',  label: 'Polea' },
  { id: 'band',   label: 'Gomas elásticas' },
  { id: 'body',   label: 'Peso corporal' },
];

export default function WorkoutSurveyScreen({ navigation }) {
  const t = useTheme();
  const { generateWorkoutPlan } = useApp();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('hypertrophy');
  const [level, setLevel] = useState('beginner');
  const [days, setDays] = useState(4);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleEquipment = (id) => {
    setEquipment(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateWorkoutPlan({ goal, level, days, equipment });
      navigation.replace('Main', { screen: 'Workout' });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 24 }}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={{
              flex: 1, height: 3, borderRadius: 999,
              backgroundColor: i <= step ? t.accent : t.border,
            }} />
          ))}
        </View>

        {step === 0 && (
          <>
            <Eyebrow>01 / 04</Eyebrow>
            <H1 style={{ marginTop: 8, marginBottom: 20 }}>¿Cuál es tu objetivo?</H1>
            {GOALS.map(g => (
              <TouchableOpacity key={g.id} onPress={() => setGoal(g.id)}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
                  borderWidth: 1, borderColor: goal === g.id ? t.accent : t.border,
                  backgroundColor: goal === g.id ? t.accentSoft : t.surface,
                  borderRadius: 14, marginBottom: 8,
                }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 999,
                  backgroundColor: goal === g.id ? t.accent : t.chipBg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={g.icon} size={20} color={goal === g.id ? '#fff' : t.fg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, color: t.fg, fontWeight: '600' }}>{g.title}</Text>
                  <Text style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{g.sub}</Text>
                </View>
                {goal === g.id && <Icon name="check" size={20} color={t.accent} />}
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === 1 && (
          <>
            <Eyebrow>02 / 04</Eyebrow>
            <H1 style={{ marginTop: 8, marginBottom: 20 }}>Tu nivel actual</H1>
            {LEVELS.map(l => (
              <TouchableOpacity key={l.id} onPress={() => setLevel(l.id)}
                style={{
                  padding: 16, borderWidth: 1,
                  borderColor: level === l.id ? t.accent : t.border,
                  backgroundColor: level === l.id ? t.accentSoft : t.surface,
                  borderRadius: 14, marginBottom: 8,
                }}>
                <Text style={{ fontSize: 17, color: t.fg, fontWeight: '600' }}>{l.title}</Text>
                <Text style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{l.sub}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <Eyebrow>03 / 04</Eyebrow>
            <H1 style={{ marginTop: 8, marginBottom: 20 }}>
              Días por semana: <Text style={{ color: t.accent }}>{days}</Text>
            </H1>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {[3, 4, 5, 6].map(n => (
                <TouchableOpacity key={n} onPress={() => setDays(n)}
                  style={{
                    width: 70, height: 70, borderRadius: 999,
                    backgroundColor: days === n ? t.accent : t.surface,
                    borderWidth: 1, borderColor: days === n ? t.accent : t.border,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                  <Text style={{ fontSize: 24, color: days === n ? '#fff' : t.fg }}>{n}</Text>
                  <Text style={{ fontSize: 9, color: days === n ? '#fff' : t.muted, fontFamily: MONO, marginTop: 2 }}>
                    DÍAS
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Eyebrow>04 / 04</Eyebrow>
            <H1 style={{ marginTop: 8, marginBottom: 20 }}>Equipo disponible</H1>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {EQUIPMENT.map(eq => (
                <TouchableOpacity key={eq.id} onPress={() => toggleEquipment(eq.id)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
                    backgroundColor: equipment.includes(eq.id) ? t.accent : t.surface,
                    borderWidth: 1, borderColor: equipment.includes(eq.id) ? t.accent : t.border,
                  }}>
                  <Text style={{
                    fontSize: 13, fontWeight: '500',
                    color: equipment.includes(eq.id) ? '#fff' : t.fg,
                  }}>{eq.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontSize: 12, color: t.muted, marginTop: 12, lineHeight: 18 }}>
              Si no seleccionas nada, generaremos ejercicios con peso corporal.
            </Text>
          </>
        )}

        <View style={{ marginTop: 32, gap: 10 }}>
          {step < 3 ? (
            <PrimaryButton onPress={() => setStep(s => s + 1)} icon="arrow">Continuar</PrimaryButton>
          ) : (
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                height: 52, backgroundColor: t.accent, borderRadius: 999,
                alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
              }}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <><Icon name="sparkle" size={18} color="#fff" /><Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Generar plan con IA</Text></>
              }
            </TouchableOpacity>
          )}
          {step > 0 && (
            <TouchableOpacity onPress={() => setStep(s => s - 1)} style={{ alignItems: 'center', padding: 12 }}>
              <Text style={{ color: t.muted, fontSize: 13 }}>Atrás</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
