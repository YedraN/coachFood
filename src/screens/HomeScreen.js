import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTheme, useTabSafeBottom, Eyebrow, H1, H3, Card, Ring, FoodPlaceholder,
  IconButton, Icon, SectionHeader, DataPoint, Divider,
} from '../components/ui';
import { RECIPES, MEAL_PLAN, MEALS, SNACKS, DAYS, WORKOUT_WEEK } from '../constants/data';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

function getTodayWorkout() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  const dayIndex = (dayOfWeek + 6) % 7; // Adjust to Mon=0, Sun=6
  return WORKOUT_WEEK[dayIndex] || WORKOUT_WEEK[0];
}

function getTodayMeals() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayIndex = (dayOfWeek + 6) % 7; // Adjust to Mon=0, Sun=6
  const mealIds = MEAL_PLAN[dayIndex] || MEAL_PLAN[0];

  const mealTimes = { Desayuno: '08:00', Comida: '14:00', Snack: '17:30', Cena: '21:00' };
  return [0, 1, 3].map((i, idx) => {
    const id = mealIds[i];
    let recipe;
    if (id.startsWith('snack-')) {
      recipe = SNACKS[id];
    } else {
      recipe = RECIPES.find(r => r.id === id);
    }
    const meal = MEALS[i];
    return {
      id: `meal-${idx}`,
      meal: `${meal} · ${mealTimes[meal]}`,
      recipe,
      mealId: `meal-${idx}`,
    };
  }).filter(m => m.recipe);
}

export default function HomeScreen({ navigation }) {
  const t = useTheme();
  const tabBottom = useTabSafeBottom();
  const { user: u, daily, toggleMealDone, addWater, removeWater, addSteps, weightHistory, logWeight } = useApp();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight]             = useState(u.weight);
  const lostKg     = Math.max(0, u.weightStart - u.weight).toFixed(1);
  const progressPct = Math.min(1, (u.weightStart - u.weight) / Math.max(0.1, u.weightStart - u.weightTarget));

  const now = new Date();
  const dayName = DAYS[(now.getDay() + 6) % 7];
  const date = `${dayName} · ${now.getDate()} ${['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][now.getMonth()]}`;

  const todayMeals = getTodayMeals().map(m => ({ ...m, done: daily.mealsDone.includes(m.mealId) }));
  const todayWorkout = getTodayWorkout();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBottom }}>
        {/* Header */}
        <View style={{ padding: 22, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Eyebrow>{date}</Eyebrow>
            <H1 style={{ marginTop: 8 }}>
              Hola, <Text style={{ color: t.accent, fontStyle: 'italic' }}>{u.name}</Text>
            </H1>
          </View>
          <IconButton icon="bell" onPress={() => {}} />
        </View>
        <Text style={{ color: t.muted, fontSize: 13, lineHeight: 20, marginHorizontal: 22, marginTop: -4 }}>
          Llevas <Text style={{ color: t.fg, fontWeight: '600' }}>{u.streak} días</Text> en racha. Hoy toca {todayWorkout.focus.split('·')[0].toLowerCase()} y tienes {todayMeals.length} comidas planeadas.
        </Text>

        {/* Scan CTA */}
        <View style={{ marginHorizontal: 22, marginTop: 20 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Scan')} activeOpacity={0.85} style={{
            backgroundColor: t.fg, borderRadius: 22, padding: 20,
            flexDirection: 'row', alignItems: 'center', gap: 14,
          }}>
            <View style={{
              width: 52, height: 52, borderRadius: 14,
              backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="scan" size={24} color="#fff" strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: MONO, fontSize: 10, opacity: 0.6, letterSpacing: 1.4, textTransform: 'uppercase', color: t.bg }}>
                Empieza por aquí
              </Text>
              <Text style={{ fontSize: 22, color: t.bg, marginTop: 4 }}>Escanea tu ticket</Text>
            </View>
            <Icon name="chevron" size={20} color={t.bg} />
          </TouchableOpacity>
        </View>

        {/* Today's rings */}
        <View style={{ marginHorizontal: 22, marginTop: 16 }}>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Eyebrow>Hoy</Eyebrow>
              <Text style={{ fontSize: 11, color: t.muted, fontFamily: MONO }}>
                {Math.max(0, u.kcalTarget - daily.kcalToday)} kcal restantes
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Ring value={daily.kcalToday} max={u.kcalTarget} size={86} strokeWidth={7}
                label={daily.kcalToday} sub="kcal" />
              <Ring value={daily.proteinToday} max={u.proteinTarget} size={86} strokeWidth={7}
                color="#c98a3a" label={`${daily.proteinToday}g`} sub="proteína" />
              <Ring value={daily.stepsToday} max={u.stepsTarget} size={86} strokeWidth={7}
                color="#8a5b3a" label={(daily.stepsToday / 1000).toFixed(1) + 'k'} sub="pasos" />
            </View>

            {/* Water & steps controls */}
            <View style={{ borderTopWidth: 1, borderColor: t.border, marginTop: 16, paddingTop: 14, gap: 12 }}>
              {/* Water */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="drop" size={18} color={t.accent} strokeWidth={1.8} />
                <View style={{ flex: 1 }}>
                  <Eyebrow>Agua</Eyebrow>
                  <View style={{ flexDirection: 'row', gap: 5, marginTop: 5 }}>
                    {Array.from({ length: u.waterTarget }).map((_, i) => (
                      <View key={i} style={{
                        width: 9, height: 9, borderRadius: 999,
                        backgroundColor: i < daily.waterToday ? t.accent : t.border,
                      }} />
                    ))}
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: t.muted, fontFamily: MONO, marginRight: 8 }}>
                  {daily.waterToday}/{u.waterTarget}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity onPress={removeWater} style={{
                    width: 30, height: 30, borderRadius: 999,
                    borderWidth: 1, borderColor: t.border2, backgroundColor: t.surface,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: t.fg, fontSize: 16, lineHeight: 20 }}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={addWater} style={{
                    width: 30, height: 30, borderRadius: 999,
                    backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: '#fff', fontSize: 16, lineHeight: 20 }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Steps */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="walk" size={18} color="#8a5b3a" strokeWidth={1.8} />
                <View style={{ flex: 1 }}>
                  <Eyebrow>Pasos</Eyebrow>
                  <Text style={{ fontSize: 13, color: t.fg, marginTop: 2 }}>
                    {daily.stepsToday.toLocaleString('es-ES')}
                    <Text style={{ color: t.muted }}> / {u.stepsTarget.toLocaleString('es-ES')}</Text>
                  </Text>
                </View>
                <TouchableOpacity onPress={() => addSteps(500)} style={{
                  paddingHorizontal: 10, height: 30, borderRadius: 999,
                  borderWidth: 1, borderColor: t.border2, backgroundColor: t.surface,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: t.fg, fontSize: 11, fontFamily: MONO }}>+500</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => addSteps(1000)} style={{
                  paddingHorizontal: 10, height: 30, borderRadius: 999,
                  backgroundColor: t.chipBg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: t.fg, fontSize: 11, fontFamily: MONO }}>+1000</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>

        {/* Today's meals */}
        <View style={{ marginHorizontal: 22, marginTop: 24 }}>
          <SectionHeader title="Hoy comes" action="Ver plan" onAction={() => navigation.navigate('Plan')} />
          <View style={{ gap: 10, marginTop: 12 }}>
            {todayMeals.map((m, i) => (
              <TouchableOpacity key={i} onPress={() => navigation.navigate('RecipeDetail', { id: m.recipe.id, mealId: m.mealId })}
                activeOpacity={0.8}>
                <Card padded={false} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 }}>
                  <FoodPlaceholder hue={m.recipe.img?.hue || 18} height={64} style={{ width: 64, borderRadius: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Eyebrow>{m.meal}</Eyebrow>
                    <Text style={{ fontSize: 17, color: t.fg, marginTop: 2 }} numberOfLines={1}>{m.recipe.title}</Text>
                    <Text style={{ fontSize: 11, color: t.muted, marginTop: 3, fontFamily: MONO }}>
                      {m.recipe.kcal} kcal {m.recipe.time ? `· ${m.recipe.time} min` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleMealDone(m.mealId, { kcal: m.recipe.kcal, protein: m.recipe.p || 0 })}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{
                      width: 28, height: 28, borderRadius: 999,
                      borderWidth: 1.5, borderColor: m.done ? t.accent : t.border2,
                      backgroundColor: m.done ? t.accent : 'transparent',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                    {m.done && <Icon name="check" size={14} color="#fff" strokeWidth={2.4} />}
                  </TouchableOpacity>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's workout */}
        {todayWorkout && (
          <View style={{ marginHorizontal: 22, marginTop: 24 }}>
            <SectionHeader title="Entrenamiento de hoy" action="Ver detalle" onAction={() => navigation.navigate('Workout')} />
            <Card padded={false} style={{ marginTop: 12, overflow: 'hidden' }} onPress={() => navigation.navigate('Workout')}>
              <View style={{ position: 'relative' }}>
                <FoodPlaceholder hue={140} height={120} />
                <View style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  justifyContent: 'flex-end', padding: 16,
                }}>
                  <Text style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: '#fff', opacity: 0.85 }}>
                    Hoy · {todayWorkout.day}
                  </Text>
                  <Text style={{ fontSize: 24, color: '#fff', marginTop: 4 }}>{todayWorkout.name}</Text>
                </View>
              </View>
              <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <DataPoint label="Duración" value={`${todayWorkout.duration} min`} />
                <Divider />
                <DataPoint label="Ejercicios" value={todayWorkout.exercises?.length || 0} />
                <Divider />
                <DataPoint label="Focus" value={todayWorkout.focus.split('·')[0].trim()} />
              </View>
            </Card>
          </View>
        )}

        {/* Weight progress */}
        <View style={{ marginHorizontal: 22, marginTop: 24 }}>
          <SectionHeader
            title="Progreso de peso"
            action="+ Registrar"
            onAction={() => { setNewWeight(u.weight); setShowWeightModal(true); }}
          />
          <Card style={{ marginTop: 12 }}>
            {/* Current weight + delta */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
              <View>
                <Eyebrow>Peso actual</Eyebrow>
                <Text style={{ fontSize: 36, color: t.fg, marginTop: 4, lineHeight: 40 }}>
                  {u.weight}<Text style={{ fontSize: 16, color: t.muted }}> kg</Text>
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                {parseFloat(lostKg) > 0 && (
                  <View style={{ backgroundColor: t.accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: t.accent }}>−{lostKg} kg</Text>
                  </View>
                )}
              </View>
            </View>

            {/* SVG chart */}
            {weightHistory.length >= 2 && (
              <WeightChart t={t} data={weightHistory.slice(-10)} />
            )}
            {weightHistory.length < 2 && (
              <Text style={{ fontSize: 12, color: t.muted, marginTop: 12, fontStyle: 'italic' }}>
                Registra al menos 2 pesajes para ver la gráfica.
              </Text>
            )}

            {/* Progress bar */}
            <View style={{ marginTop: 14 }}>
              <View style={{ height: 6, backgroundColor: t.border, borderRadius: 999, overflow: 'hidden' }}>
                <View style={{ width: `${Math.max(2, progressPct * 100)}%`, height: '100%', backgroundColor: t.accent, borderRadius: 999 }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
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
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={{
            backgroundColor: t.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: 28, paddingBottom: Math.max(28, insets.bottom + 16),
          }}>
            <View style={{ width: 40, height: 4, backgroundColor: t.border, borderRadius: 999, alignSelf: 'center', marginBottom: 24 }} />
            <Eyebrow style={{ textAlign: 'center' }}>Registrar peso</Eyebrow>

            {/* Stepper */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 24 }}>
              <TouchableOpacity
                onPress={() => setWeight(w => +(Math.max(30, w - 0.1)).toFixed(1))}
                style={{
                  width: 48, height: 48, borderRadius: 999,
                  borderWidth: 1, borderColor: t.border2, backgroundColor: t.surface,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                <Text style={{ color: t.fg, fontSize: 22 }}>−</Text>
              </TouchableOpacity>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 54, color: t.fg, lineHeight: 60 }}>{weight.toFixed(1)}</Text>
                <Text style={{ fontSize: 14, color: t.muted, marginTop: 2 }}>kg</Text>
              </View>

              <TouchableOpacity
                onPress={() => setWeight(w => +(Math.min(300, w + 0.1)).toFixed(1))}
                style={{
                  width: 48, height: 48, borderRadius: 999,
                  backgroundColor: t.accent,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                <Text style={{ color: '#fff', fontSize: 22 }}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick ±0.5 buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 16 }}>
              {[-1, -0.5, +0.5, +1].map(delta => (
                <TouchableOpacity
                  key={delta}
                  onPress={() => setWeight(w => +(Math.max(30, Math.min(300, w + delta))).toFixed(1))}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
                    backgroundColor: t.chipBg,
                  }}>
                  <Text style={{ color: t.fg, fontSize: 12, fontFamily: MONO }}>
                    {delta > 0 ? `+${delta}` : delta}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={onSave}
              style={{
                marginTop: 28, backgroundColor: t.accent, borderRadius: 999,
                height: 52, alignItems: 'center', justifyContent: 'center',
              }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
