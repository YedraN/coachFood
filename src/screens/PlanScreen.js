import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useTheme, useTabSafeBottom, Eyebrow, H1, Card, Ring, FoodPlaceholder, Icon, PrimaryButton, GhostButton,
} from '../components/ui';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function PlanScreen({ navigation }) {
  const t = useTheme();
  const tabBottom = useTabSafeBottom();
  const { user, aiRecipes, pantry } = useApp();
  const [view, setView] = useState('grid');

  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const [day, setDay] = useState(dayOfWeek);

  const grouped = useMemo(() => {
    const groups = { Desayuno: [], Comida: [], Cena: [], Snack: [] };
    aiRecipes.forEach(r => {
      if (groups[r.tag]) groups[r.tag].push(r);
    });
    return groups;
  }, [aiRecipes]);

  const totalKcal = aiRecipes.reduce((s, r) => s + (r.kcal || 0), 0);
  const totalProt = aiRecipes.reduce((s, r) => s + (r.p || 0), 0);

  const getWeekDates = () => {
    const mon = new Date(now);
    mon.setDate(now.getDate() - now.getDay() + 1);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const fmt = (d) => d.getDate();
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${fmt(mon)}–${fmt(sun)} ${months[sun.getMonth()]}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBottom }}>
        <View style={{ padding: 22, paddingTop: 16 }}>
          <Eyebrow>Recetas disponibles · {getWeekDates()}</Eyebrow>
          <H1 style={{ marginTop: 8 }}>
            Plan de <Text style={{ color: t.accent, fontStyle: 'italic' }}>comidas</Text>
          </H1>
        </View>

        {/* Stats */}
        {aiRecipes.length > 0 && (
          <View style={{ paddingHorizontal: 22, marginTop: 4 }}>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Ring value={totalKcal} max={user?.kcalTarget * aiRecipes.length || 2000} size={70} strokeWidth={6} label={totalKcal} sub="kcal" />
                <View style={{ flex: 1 }}>
                  <Eyebrow>Total recetas</Eyebrow>
                  <Text style={{ fontSize: 22, color: t.fg, marginTop: 4 }}>
                    {aiRecipes.length} recetas
                  </Text>
                  <Text style={{ fontSize: 11, color: t.muted, marginTop: 4, fontFamily: MONO }}>
                    {totalProt}g proteína · {Object.values(grouped).flat().length} platos
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Grouped by meal type */}
        {aiRecipes.length > 0 ? (
          <View style={{ paddingHorizontal: 22, marginTop: 22, gap: 20 }}>
            {Object.entries(grouped).map(([tag, recipes]) => {
              if (recipes.length === 0) return null;
              return (
                <View key={tag}>
                  <Eyebrow style={{ marginBottom: 10 }}>{tag}</Eyebrow>
                  <View style={{ gap: 10 }}>
                    {recipes.map(r => (
                      <TouchableOpacity key={r.id} onPress={() => navigation.navigate('RecipeDetail', { id: r.id })} activeOpacity={0.8}>
                        <Card padded={false} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 }}>
                          <FoodPlaceholder hue={r.img?.hue || 18} height={60} style={{ width: 60, borderRadius: 12 }} />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, color: t.fg }} numberOfLines={1}>{r.title}</Text>
                            <Text style={{ fontSize: 11, color: t.muted, marginTop: 3, fontFamily: MONO }}>
                              {r.kcal} kcal · {r.p}g prot · {r.time} min
                            </Text>
                          </View>
                          <Icon name="chevron" size={16} color={t.muted} />
                        </Card>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* Empty state */
          <View style={{ alignItems: 'center', padding: 40, gap: 14 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 999,
              backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="calendar" size={30} color={t.muted} strokeWidth={1.5} />
            </View>
            <Text style={{ fontSize: 16, color: t.fg, textAlign: 'center' }}>
              Aún no has generado recetas
            </Text>
            <Text style={{ fontSize: 13, color: t.muted, textAlign: 'center', lineHeight: 20 }}>
              Escanea productos en tu despensa y genera recetas personalizadas con IA.
            </Text>
            {pantry.length > 0 ? (
              <PrimaryButton icon="sparkle" onPress={() => navigation.navigate('Recipes')}>
                Generar recetas
              </PrimaryButton>
            ) : (
              <PrimaryButton icon="scan" onPress={() => navigation.navigate('Scan')}>
                Escanear productos
              </PrimaryButton>
            )}
          </View>
        )}

        {/* Generate more */}
        {aiRecipes.length > 0 && pantry.length > 0 && (
          <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
            <GhostButton full icon="sparkle" onPress={() => navigation.navigate('Recipes')}>
              Generar más recetas
            </GhostButton>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
