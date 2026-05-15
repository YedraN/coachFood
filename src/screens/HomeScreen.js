import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTheme, useTabSafeBottom, Eyebrow, H1, H3, Card, Ring, FoodPlaceholder,
  IconButton, Icon, SectionHeader, DataPoint, Divider,
} from '../components/ui';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function HomeScreen({ navigation }) {
  const t = useTheme();
  const tabBottom = useTabSafeBottom();
  const { user: u, daily, toggleMealDone, addWater, removeWater, addSteps, weightHistory, logWeight, aiRecipes, workoutPlans, pantry } = useApp();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight]             = useState(u.weight);
  const lostKg     = Math.max(0, u.weightStart - u.weight).toFixed(1);
  const totalToLose = u.weightStart - u.weightTarget;
  const progressPct = totalToLose > 0 ? Math.min(1, Math.max(0, (u.weightStart - u.weight) / totalToLose)) : 0;

  const now = new Date();
  const dayName = DAYS[(now.getDay() + 6) % 7];
  const date = `${dayName} · ${now.getDate()} ${['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][now.getMonth()]}`;

  const todayDayIndex = (now.getDay() + 6) % 7;
  const todayWorkout = workoutPlans.find(p => p.day_of_week === todayDayIndex) || null;
  const latestRecipes = aiRecipes.slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBottom }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 22, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Eyebrow>{date}</Eyebrow>
            <H1 style={{ marginTop: 10 }}>
              Hola, <Text style={{ color: t.accent, fontStyle: 'italic' }}>{u.name}</Text>
            </H1>
          </View>
          <IconButton icon="bell" onPress={() => {}} />
        </View>
        <Text style={{ color: t.muted, fontSize: 13, lineHeight: 22, marginHorizontal: 22, marginTop: 4 }}>
          Llevas <Text style={{ color: t.fg, fontWeight: '600' }}>{u.streak} días</Text> en racha.
          {todayWorkout ? ` Hoy toca ${(todayWorkout.focus || '').split('·')[0]?.toLowerCase() || 'entrenar'}.` : ''}
          {pantry.length > 0 ? ` Tienes ${pantry.length} productos en la despensa.` : ''}
        </Text>

        {/* Scan CTA */}
        <View style={{ marginHorizontal: 22, marginTop: 22 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Scan')} activeOpacity={0.85} style={{
            backgroundColor: t.fg, borderRadius: 22, padding: 20,
            flexDirection: 'row', alignItems: 'center', gap: 16,
          }}>
            <View style={{
              width: 52, height: 52, borderRadius: 14,
              backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="scan" size={24} color="#fff" strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: t.surface2, opacity: 0.8 }}>
                Empieza por aquí
              </Text>
              <Text style={{ fontSize: 22, color: t.bg === '#121214' ? '#FFFFFF' : '#FFFFFF', marginTop: 4 }}>Escanea tu ticket</Text>
            </View>
            <Icon name="chevron" size={20} color={t.surface2} />
          </TouchableOpacity>
        </View>

        {/* Today's rings */}
        <View style={{ marginHorizontal: 22, marginTop: 22 }}>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Eyebrow>Hoy</Eyebrow>
              <Text style={{ fontSize: 11, color: t.muted, fontFamily: MONO }}>
                {Math.max(0, u.kcalTarget - daily.kcalToday)} kcal restantes
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 4 }}>
              <Ring value={daily.kcalToday} max={u.kcalTarget} size={86} strokeWidth={7}
                label={daily.kcalToday} sub="kcal" />
              <Ring value={daily.proteinToday} max={u.proteinTarget} size={86} strokeWidth={7}
                color="#c98a3a" label={`${daily.proteinToday}g`} sub="proteína" />
              <Ring value={daily.stepsToday} max={u.stepsTarget} size={86} strokeWidth={7}
                color="#8a5b3a" label={(daily.stepsToday / 1000).toFixed(1) + 'k'} sub="pasos" />
            </View>

            {/* Water & steps controls */}
            <View style={{ borderTopWidth: 1, borderColor: t.border, marginTop: 18, paddingTop: 18, gap: 16 }}>
              {/* Water */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icon name="drop" size={20} color={t.accent} strokeWidth={1.8} />
                <View style={{ flex: 1 }}>
                  <Eyebrow>Agua</Eyebrow>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                    {Array.from({ length: u.waterTarget }).map((_, i) => (
                      <View key={i} style={{
                        width: 10, height: 10, borderRadius: 999,
                        backgroundColor: i < daily.waterToday ? t.accent : t.border,
                      }} />
                    ))}
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: t.muted, fontFamily: MONO, marginRight: 8 }}>
                  {daily.waterToday}/{u.waterTarget}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={removeWater} style={{
                    width: 36, height: 36, borderRadius: 999,
                    borderWidth: 1, borderColor: t.border2, backgroundColor: t.surface,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: t.fg, fontSize: 18, lineHeight: 22 }}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={addWater} style={{
                    width: 36, height: 36, borderRadius: 999,
                    backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: '#fff', fontSize: 18, lineHeight: 22 }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Steps */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icon name="walk" size={20} color="#8a5b3a" strokeWidth={1.8} />
                <View style={{ flex: 1 }}>
                  <Eyebrow>Pasos</Eyebrow>
                  <Text style={{ fontSize: 14, color: t.fg, marginTop: 3 }}>
                    {daily.stepsToday.toLocaleString('es-ES')}
                    <Text style={{ color: t.muted }}> / {u.stepsTarget.toLocaleString('es-ES')}</Text>
                  </Text>
                </View>
                <TouchableOpacity onPress={() => addSteps(500)} style={{
                  paddingHorizontal: 14, height: 36, borderRadius: 999,
                  borderWidth: 1, borderColor: t.border2, backgroundColor: t.surface,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: t.fg, fontSize: 11, fontFamily: MONO }}>+500</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => addSteps(1000)} style={{
                  paddingHorizontal: 14, height: 36, borderRadius: 999,
                  backgroundColor: t.chipBg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: t.fg, fontSize: 11, fontFamily: MONO }}>+1000</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>

        {/* AI Recipes */}
        {latestRecipes.length > 0 && (
          <View style={{ marginHorizontal: 22, marginTop: 28 }}>
            <SectionHeader title="Recetas generadas" action="Ver todas" onAction={() => navigation.navigate('Recipes')} />
            <View style={{ gap: 12, marginTop: 14 }}>
              {latestRecipes.map(r => (
                <TouchableOpacity key={r.id} onPress={() => navigation.navigate('RecipeDetail', { id: r.id })}
                  activeOpacity={0.8}>
                  <Card padded={false} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 }}>
                    <FoodPlaceholder hue={r.img?.hue || 18} height={64} style={{ width: 64, borderRadius: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Eyebrow>{r.tag || 'Receta'}</Eyebrow>
                      <Text style={{ fontSize: 17, color: t.fg, marginTop: 3 }} numberOfLines={1}>{r.title}</Text>
                      <Text style={{ fontSize: 11, color: t.muted, marginTop: 4, fontFamily: MONO }}>
                        {r.kcal} kcal {r.time ? `· ${r.time} min` : ''}
                      </Text>
                    </View>
                    <Icon name="chevron" size={16} color={t.muted} />
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Pantry CTA if no recipes yet */}
        {latestRecipes.length === 0 && pantry.length > 0 && (
          <View style={{ marginHorizontal: 22, marginTop: 28 }}>
            <Card style={{ backgroundColor: t.accentSoft, borderColor: t.accent + '44' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Icon name="sparkle" size={24} color={t.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: t.accentInk, fontWeight: '600' }}>Genera recetas con IA</Text>
                  <Text style={{ fontSize: 12, color: t.accentInk, opacity: 0.8, marginTop: 3 }}>
                    Usa los {pantry.length} productos de tu despensa
                  </Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Recipes')}
                  style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: t.accent }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Ir</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* Today's workout */}
        {todayWorkout && (
          <View style={{ marginHorizontal: 22, marginTop: 28 }}>
            <SectionHeader title="Entrenamiento de hoy" action="Ver detalle" onAction={() => navigation.navigate('Workout')} />
            <Card padded={false} style={{ marginTop: 14, overflow: 'hidden' }} onPress={() => navigation.navigate('Workout')}>
              <View style={{ position: 'relative' }}>
                <FoodPlaceholder hue={140} height={140} />
                <View style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  justifyContent: 'flex-end', padding: 18,
                }}>
                  <Text style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: '#fff', opacity: 0.85 }}>
                    Hoy · {todayWorkout.name}
                  </Text>
                  <Text style={{ fontSize: 26, color: '#fff', marginTop: 4 }}>{todayWorkout.focus}</Text>
                </View>
              </View>
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <DataPoint label="Duración" value={`${todayWorkout.duration} min`} />
                <Divider />
                <DataPoint label="Ejercicios" value={todayWorkout.exercises?.length || 0} />
                <Divider />
                <DataPoint label="Focus" value={(todayWorkout.focus || '').split('·')[0]?.trim() || 'General'} />
              </View>
            </Card>
          </View>
        )}

        {/* Weight progress */}
        <View style={{ marginHorizontal: 22, marginTop: 28 }}>
          <SectionHeader
            title="Progreso de peso"
            action="+ Registrar"
            onAction={() => { setNewWeight(u.weight); setShowWeightModal(true); }}
          />
          <Card style={{ marginTop: 14 }}>
            {/* Current weight + delta */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 14 }}>
              <View>
                <Eyebrow>Peso actual</Eyebrow>
                <Text style={{ fontSize: 40, color: t.fg, marginTop: 6, lineHeight: 44 }}>
                  {u.weight}<Text style={{ fontSize: 18, color: t.muted }}> kg</Text>
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                {parseFloat(lostKg) > 0 && (
                  <View style={{ backgroundColor: t.accentSoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: t.accent }}>−{lostKg} kg</Text>
                  </View>
                )}
              </View>
            </View>

            {/* SVG chart */}
            {weightHistory.length >= 2 && (
              <WeightChart t={t} data={weightHistory.slice(-10)} />
            )}
            {weightHistory.length < 2 && (
              <Text style={{ fontSize: 12, color: t.muted, marginTop: 14, fontStyle: 'italic' }}>
                Registra al menos 2 pesajes para ver la gráfica.
              </Text>
            )}

            {/* Progress bar */}
            <View style={{ marginTop: 18 }}>
              <View style={{ height: 8, backgroundColor: t.border, borderRadius: 999, overflow: 'hidden' }}>
                <View style={{ width: `${Math.max(2, progressPct * 100)}%`, height: '100%', backgroundColor: t.accent, borderRadius: 999 }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontSize: 11, color: t.muted, fontFamily: MONO }}>{u.weightStart} kg · inicio</Text>
                <Text style={{ fontSize: 11, color: t.muted, fontFamily: MONO }}>{u.weightTarget} kg · objetivo</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Weight modal */}
        <WeightModal
          t={t}
          visible={showWeightModal}
          weight={newWeight}
          setWeight={setNewWeight}
          onSave={async () => {
            await logWeight(newWeight);
            setShowWeightModal(false);
          }}
          onClose={() => setShowWeightModal(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const CHART_PADDING = { top: 12, bottom: 22, left: 4, right: 4 };
const CHART_H = 110;

function WeightChart({ t, data }) {
  const { width } = useWindowDimensions();
  const chartW = width - 44 - 36; // screen - margins - card padding
  const weights = data.map(d => d.weight);
  const minW = Math.min(...weights) - 0.3;
  const maxW = Math.max(...weights) + 0.3;
  const range = maxW - minW || 1;

  const toX = (i) =>
    CHART_PADDING.left + (i / (data.length - 1)) * (chartW - CHART_PADDING.left - CHART_PADDING.right);
  const toY = (w) =>
    CHART_PADDING.top + ((maxW - w) / range) * (CHART_H - CHART_PADDING.top - CHART_PADDING.bottom);

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.weight), ...d }));
  const d   = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <View style={{ marginTop: 14 }}>
      <Svg width={chartW} height={CHART_H}>
        <Path d={d} stroke={t.accent} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={t.accent} />
        ))}
        {/* First label */}
        <SvgText x={pts[0].x} y={CHART_H} fontSize={9} fill={t.muted} textAnchor="start">
          {data[0].date.slice(5).replace('-', '/')}
        </SvgText>
        {/* Last label */}
        <SvgText x={pts[pts.length - 1].x} y={CHART_H} fontSize={9} fill={t.muted} textAnchor="end">
          {data[data.length - 1].date.slice(5).replace('-', '/')}
        </SvgText>
        {/* Min / max weight labels on Y axis */}
        <SvgText x={pts[0].x} y={toY(minW) - 2} fontSize={9} fill={t.muted} textAnchor="start">
          {minW.toFixed(1)}
        </SvgText>
        <SvgText x={pts[0].x} y={toY(maxW) + 10} fontSize={9} fill={t.muted} textAnchor="start">
          {maxW.toFixed(1)}
        </SvgText>
      </Svg>
    </View>
  );
}

function WeightModal({ t, visible, weight, setWeight, onSave, onClose }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={{
            backgroundColor: t.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: 28, paddingBottom: Math.max(32, insets.bottom + 20),
          }}>
            <View style={{ width: 40, height: 5, backgroundColor: t.border, borderRadius: 999, alignSelf: 'center', marginBottom: 24 }} />
            <Eyebrow style={{ textAlign: 'center' }}>Registrar peso</Eyebrow>

            {/* Stepper */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 28 }}>
              <TouchableOpacity
                onPress={() => setWeight(w => +(Math.max(30, w - 0.1)).toFixed(1))}
                style={{
                  width: 52, height: 52, borderRadius: 999,
                  borderWidth: 1, borderColor: t.border2, backgroundColor: t.bg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                <Text style={{ color: t.fg, fontSize: 24 }}>−</Text>
              </TouchableOpacity>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 58, color: t.fg, lineHeight: 64 }}>{weight.toFixed(1)}</Text>
                <Text style={{ fontSize: 14, color: t.muted, marginTop: 4 }}>kg</Text>
              </View>

              <TouchableOpacity
                onPress={() => setWeight(w => +(Math.min(300, w + 0.1)).toFixed(1))}
                style={{
                  width: 52, height: 52, borderRadius: 999,
                  backgroundColor: t.accent,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick ±0.5 buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 20 }}>
              {[-1, -0.5, +0.5, +1].map(delta => (
                <TouchableOpacity
                  key={delta}
                  onPress={() => setWeight(w => +(Math.max(30, Math.min(300, w + delta))).toFixed(1))}
                  style={{
                    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999,
                    backgroundColor: t.chipBg,
                  }}>
                  <Text style={{ color: t.fg, fontSize: 13, fontFamily: MONO }}>
                    {delta > 0 ? `+${delta}` : delta}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={onSave}
              style={{
                marginTop: 28, backgroundColor: t.accent, borderRadius: 999,
                height: 54, alignItems: 'center', justifyContent: 'center',
              }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
