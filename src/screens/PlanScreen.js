import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useTheme, useTabSafeBottom, Eyebrow, H1, Card, Ring, FoodPlaceholder, Icon,
} from '../components/ui';
import { DAYS, MEALS, MEAL_PLAN, RECIPES, SNACKS } from '../constants/data';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

export default function PlanScreen({ navigation }) {
  const t = useTheme();
  const tabBottom = useTabSafeBottom();
  const { user } = useApp();

  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Adjust to Mon=0
  const [day, setDay] = useState(dayOfWeek);

  const dayMeals = MEAL_PLAN[day].map((id, mi) => {
    if (id.startsWith('snack-')) return { kind: 'snack', meal: MEALS[mi], data: SNACKS[id], id };
    return { kind: 'recipe', meal: MEALS[mi], data: RECIPES.find(r => r.id === id), id };
  });

  const dayKcal = dayMeals.reduce((s, m) => s + (m.data.kcal || 0), 0);
  const dayProt = dayMeals.reduce((s, m) => s + (m.data.p || 0), 0);

  const mealTimes = { Desayuno: '08:00', Comida: '14:00', Snack: '17:30', Cena: '21:00' };

  const getWeekDates = () => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1; // First day is Sunday
    const mon = new Date(curr.setDate(first + 1)); // Monday
    const sun = new Date(curr.setDate(first + 7)); // Sunday
    const fmtDate = (d) => d.getDate();
    const fmtMonth = (d) => ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][d.getMonth()];
    return `${fmtDate(mon)}–${fmtDate(sun)} ${fmtMonth(sun)}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBottom }}>
        <View style={{ padding: 22, paddingTop: 16 }}>
          <Eyebrow>Esta semana · {getWeekDates()}</Eyebrow>
          <H1 style={{ marginTop: 8 }}>
            Plan de <Text style={{ color: t.accent, fontStyle: 'italic' }}>comidas</Text>
          </H1>
        </View>

        {/* Day picker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, gap: 8, paddingBottom: 2 }}>
          {DAYS.map((d, i) => (
            <TouchableOpacity key={d} onPress={() => setDay(i)} style={{
              minWidth: 52, height: 64, borderRadius: 14,
              backgroundColor: day === i ? t.fg : t.surface,
              borderWidth: 1, borderColor: day === i ? t.fg : t.border,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1, color: day === i ? t.bg : t.muted }}>
                {d.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 22, color: day === i ? t.bg : t.fg, marginTop: 2 }}>{10 + i}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Day stats */}
        <View style={{ paddingHorizontal: 22, marginTop: 18 }}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Ring value={dayKcal} max={user?.kcalTarget || 2000} size={70} strokeWidth={6} label={dayKcal} sub="kcal" />
              <View style={{ flex: 1 }}>
                <Eyebrow>Total {DAYS[day]}</Eyebrow>
                <Text style={{ fontSize: 22, color: t.fg, marginTop: 4 }}>
                  {dayKcal} <Text style={{ fontSize: 13, color: t.muted }}>de {user?.kcalTarget || 2000} kcal</Text>
                </Text>
                <Text style={{ fontSize: 11, color: t.muted, marginTop: 4, fontFamily: MONO }}>
                  {dayProt}g proteína · {dayMeals.length} comidas
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Meals timeline */}
        <View style={{ paddingHorizontal: 22, marginTop: 18, gap: 12 }}>
          {dayMeals.map((m, i) => (
            <TouchableOpacity key={i} activeOpacity={0.85}
              onPress={() => m.kind === 'recipe' && navigation.navigate('RecipeDetail', { id: m.id })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 64, alignItems: 'center' }}>
                  <Text style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1, color: t.muted, textTransform: 'uppercase' }}>
                    {m.meal}
                  </Text>
                  <Text style={{ fontSize: 16, color: t.fg, marginTop: 4 }}>{mealTimes[m.meal]}</Text>
                </View>
                <View style={{
                  flex: 1, padding: 12, backgroundColor: t.surface,
                  borderWidth: 1, borderColor: t.border, borderRadius: 14,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                }}>
                  {m.kind === 'recipe' ? (
                    <FoodPlaceholder hue={m.data.img.hue} height={50} style={{ width: 50, borderRadius: 10 }} />
                  ) : (
                    <View style={{
                      width: 50, height: 50, borderRadius: 10, backgroundColor: t.chipBg,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name="leaf" size={22} color={t.accent} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, color: t.fg, lineHeight: 20 }} numberOfLines={1}>{m.data.title}</Text>
                    <Text style={{ fontSize: 11, color: t.muted, marginTop: 3, fontFamily: MONO }}>
                      {m.data.kcal} kcal{m.data.time ? ` · ${m.data.time} min` : ''}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Shopping CTA */}
        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          <Card style={{ backgroundColor: t.fg, borderWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{
                width: 44, height: 44, borderRadius: 12, backgroundColor: t.accent,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="cart" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: t.bg, opacity: 0.6 }}>
                  Próxima compra
                </Text>
                <Text style={{ fontSize: 18, color: t.bg, marginTop: 4 }}>Lista para el sábado</Text>
              </View>
              <Icon name="chevron" size={20} color={t.bg} />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
