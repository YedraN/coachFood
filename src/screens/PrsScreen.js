import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, TopBar, IconButton, Eyebrow, H1, Card, PrimaryButton, GhostButton, Icon } from '../components/ui';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

const DEFAULT_EXERCISES = [
  { id: 'squat',    name: 'Sentadilla',      icon: 'weight', unit: 'kg' },
  { id: 'bench',    name: 'Press banca',      icon: 'dumbbell', unit: 'kg' },
  { id: 'deadlift', name: 'Peso muerto',      icon: 'weight', unit: 'kg' },
];

const ESTIMATE_1RM = (w, r) => r === 1 ? w : Math.round(w * (1 + r / 30));

export default function PrsScreen({ navigation }) {
  const t = useTheme();
  const { prs, upsertPr } = useApp();
  const [modal, setModal] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newReps, setNewReps] = useState('1');
  const [newNotes, setNewNotes] = useState('');

  const getPr = (exercise) => prs.find(p => p.exercise === exercise);

  const openModal = (exercise, name) => {
    const existing = getPr(exercise);
    setModal(exercise);
    setCustomMode(false);
    setNewName(name);
    setNewWeight(existing ? String(existing.weight) : '');
    setNewReps(existing ? String(existing.reps) : '1');
    setNewNotes(existing?.notes || '');
  };

  const openCustomModal = () => {
    setModal('custom');
    setCustomMode(true);
    setNewName('');
    setNewWeight('');
    setNewReps('1');
    setNewNotes('');
  };

  const handleSave = async () => {
    const weight = parseFloat(newWeight);
    if (!weight || weight <= 0) return Alert.alert('Error', 'Peso inválido');
    const reps = parseInt(newReps) || 1;
    const name = customMode ? newName.trim() : modal;
    if (!name) return Alert.alert('Error', 'Nombre del ejercicio requerido');
    await upsertPr(name, weight, reps, newNotes);
    setModal(null);
  };

  const allExercises = [...DEFAULT_EXERCISES];
  const customPrs = prs.filter(p => !DEFAULT_EXERCISES.find(e => e.id === p.exercise));
  customPrs.forEach(p => {
    if (!allExercises.find(e => e.id === p.exercise)) {
      allExercises.push({ id: p.exercise, name: p.exercise, icon: 'weight', unit: 'kg' });
    }
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        left={<IconButton icon="chevronL" onPress={() => navigation.goBack()} />}
        sub="Marcas personales"
        title="SBD + PRs"
        right={<TouchableOpacity onPress={openCustomModal} style={{ padding: 8 }}>
          <Text style={{ color: t.accent, fontSize: 13, fontWeight: '600' }}>+ Añadir</Text>
        </TouchableOpacity>}
      />
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        {/* Main 3 lifts */}
        <View style={{ gap: 10 }}>
          {DEFAULT_EXERCISES.map(ex => {
            const pr = getPr(ex.id);
            const e1rm = pr ? ESTIMATE_1RM(pr.weight, pr.reps) : null;
            return (
              <TouchableOpacity key={ex.id} onPress={() => openModal(ex.id, ex.name)} activeOpacity={0.8}>
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{
                      width: 48, height: 48, borderRadius: 14,
                      backgroundColor: pr ? t.accentSoft : t.chipBg,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={ex.icon} size={22} color={pr ? t.accent : t.muted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, color: t.fg, fontWeight: '600' }}>{ex.name}</Text>
                      {pr ? (
                        <Text style={{ fontSize: 12, color: t.muted, marginTop: 2, fontFamily: MONO }}>
                          {pr.weight} kg × {pr.reps} reps · 1RM estimado: {e1rm} kg
                        </Text>
                      ) : (
                        <Text style={{ fontSize: 12, color: t.muted, marginTop: 2, fontStyle: 'italic' }}>
                          Aún sin registrar
                        </Text>
                      )}
                    </View>
                    {pr && <Text style={{ fontSize: 24, color: t.accent, fontWeight: '700' }}>{pr.weight}</Text>}
                    <Icon name="chevron" size={16} color={t.muted} />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom PRs */}
        {customPrs.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Eyebrow>Otros ejercicios</Eyebrow>
            <View style={{ gap: 8, marginTop: 10 }}>
              {customPrs.map(pr => (
                <TouchableOpacity key={pr.id} onPress={() => openModal(pr.exercise, pr.exercise)}>
                  <Card>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="weight" size={22} color={t.accent} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, color: t.fg, fontWeight: '600' }}>{pr.exercise}</Text>
                        <Text style={{ fontSize: 11, color: t.muted, marginTop: 2, fontFamily: MONO }}>
                          {pr.weight} kg × {pr.reps} reps
                        </Text>
                      </View>
                      <Text style={{ fontSize: 22, color: t.accent, fontWeight: '700' }}>{pr.weight}</Text>
                      <Icon name="chevron" size={16} color={t.muted} />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <GhostButton full onPress={openCustomModal} icon="plus" style={{ marginTop: 20 }}>
          Añadir otro ejercicio
        </GhostButton>

        {/* Info box */}
        <View style={{
          marginTop: 20, padding: 16, borderRadius: 14,
          backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
        }}>
          <Text style={{ fontSize: 12, color: t.muted, lineHeight: 18 }}>
            El 1RM estimado se calcula con la fórmula de Epley: peso × (1 + reps/30).
          </Text>
        </View>
      </ScrollView>

      {/* Modal */}
      {modal && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: t.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: 22, paddingBottom: 32,
          borderTopWidth: 1, borderColor: t.border,
          shadowColor: '#000', shadowOffset: { y: -4 }, shadowOpacity: 0.1, shadowRadius: 20,
          elevation: 10,
        }}>
          <View style={{ width: 40, height: 4, backgroundColor: t.border, borderRadius: 999, alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ fontSize: 18, color: t.fg, fontWeight: '600', marginBottom: 16 }}>
            {customMode ? 'Nuevo ejercicio' : newName}
          </Text>

          {customMode && (
            <View style={{
              backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
              borderRadius: 12, padding: 12, marginBottom: 12,
            }}>
              <Text style={{ fontSize: 10, color: t.muted, fontFamily: MONO, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                Nombre del ejercicio
              </Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Ej: Curl bíceps"
                placeholderTextColor={t.muted}
                style={{ fontSize: 16, color: t.fg }}
              />
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{
              flex: 1, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
              borderRadius: 12, padding: 12,
            }}>
              <Text style={{ fontSize: 10, color: t.muted, fontFamily: MONO, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                Peso (kg)
              </Text>
              <TextInput
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={t.muted}
                style={{ fontSize: 20, color: t.fg }}
              />
            </View>
            <View style={{
              width: 80, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
              borderRadius: 12, padding: 12,
            }}>
              <Text style={{ fontSize: 10, color: t.muted, fontFamily: MONO, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                Reps
              </Text>
              <TextInput
                value={newReps}
                onChangeText={setNewReps}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={t.muted}
                style={{ fontSize: 20, color: t.fg }}
              />
            </View>
          </View>

          <PrimaryButton onPress={handleSave} icon="check" style={{ marginTop: 16 }}>
            {customMode ? 'Añadir' : 'Actualizar PR'}
          </PrimaryButton>
          <TouchableOpacity onPress={() => setModal(null)} style={{ alignItems: 'center', padding: 12 }}>
            <Text style={{ color: t.muted, fontSize: 13 }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
