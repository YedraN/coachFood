import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTheme, FoodPlaceholder, IconButton, Eyebrow, H1, MacroBar,
  PrimaryButton, Icon,
} from '../components/ui';
import { RECIPES } from '../constants/data';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

export default function RecipeDetailScreen({ navigation, route }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { toggleMealDone, daily } = useApp();
  const id = route.params?.id;
  const mealId = route.params?.mealId;
  const r = RECIPES.find(x => x.id === id) || RECIPES[0];
  const [tab, setTab] = useState('ingredients');
  const [checked, setChecked] = useState(new Set());

  const isDone = mealId && daily.mealsDone.includes(mealId);

  const toggle = (i) => {
    setChecked(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Hero image */}
        <View style={{ position: 'relative' }}>
          <FoodPlaceholder hue={r.img.hue} height={300} />
          <View style={{
            position: 'absolute', top: insets.top + 12, left: 22, right: 22,
            flexDirection: 'row', justifyContent: 'space-between',
          }}>
            <IconButton icon="chevronL" onPress={() => navigation.goBack()} />
            <IconButton icon="bell" onPress={() => {}} />
          </View>
          <View style={{ position: 'absolute', bottom: -16, left: 22 }}>
            <View style={{
              backgroundColor: t.accent, paddingHorizontal: 12, paddingVertical: 5,
              borderRadius: 999,
            }}>
              <Text style={{ color: '#fff', fontSize: 10, fontFamily: MONO, letterSpacing: 1, textTransform: 'uppercase' }}>
                {r.tag} · {r.subtitle.split('·')[1]?.trim()}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ padding: 22, paddingTop: 34 }}>
          <H1 style={{ fontSize: 32 }}>{r.title}</H1>

          {/* Stats row */}
          <View style={{
            marginTop: 18,
            flexDirection: 'row',
            backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
            borderRadius: 16, padding: 14,
          }}>
            {[
              { label: 'kcal', value: r.kcal },
              { label: 'min', value: r.time },
              { label: 'prot', value: `${r.p}g` },
              { label: 'match', value: `${r.match.uses}/${r.match.total}`, accent: true },
            ].map((s, i) => (
              <View key={s.label} style={{ flex: 1, alignItems: 'center', borderRightWidth: i < 3 ? 1 : 0, borderColor: t.border }}>
                <Text style={{ fontSize: 22, color: s.accent ? t.accent : t.fg }}>{s.value}</Text>
                <Text style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: t.muted, marginTop: 4 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 16 }}>
            <MacroBar p={r.p} c={r.c} f={r.f} />
          </View>

          {/* Why */}
          <View style={{
            marginTop: 18, padding: 16, borderRadius: 14,
            backgroundColor: t.accentSoft, flexDirection: 'row', gap: 10,
          }}>
            <Icon name="sparkle" size={18} color={t.accentInk} strokeWidth={1.6} />
            <Text style={{ flex: 1, fontSize: 13, lineHeight: 20, color: t.accentInk }}>{r.why}</Text>
          </View>

          {/* Tabs */}
          <View style={{
            marginTop: 22, flexDirection: 'row', gap: 4,
            backgroundColor: t.chipBg, padding: 4, borderRadius: 999,
          }}>
            {[['ingredients', 'Ingredientes'], ['steps', 'Pasos']].map(([tabId, label]) => (
              <TouchableOpacity key={tabId} onPress={() => setTab(tabId)} style={{
                flex: 1, height: 38, borderRadius: 999,
                backgroundColor: tab === tabId ? t.surface : 'transparent',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: t.fg, fontSize: 13, fontWeight: '600' }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'ingredients' && (
            <View style={{ marginTop: 16, gap: 0 }}>
              {r.ingredients.map((ing, i) => (
                <TouchableOpacity key={i} onPress={() => toggle(i)} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  paddingVertical: 12, paddingHorizontal: 4,
                  borderBottomWidth: 1, borderColor: t.border,
                }}>
                  <View style={{
                    width: 22, height: 22, borderRadius: 6,
                    borderWidth: 1.5, borderColor: checked.has(i) ? t.accent : t.border2,
                    backgroundColor: checked.has(i) ? t.accent : 'transparent',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {checked.has(i) && <Icon name="check" size={12} color="#fff" strokeWidth={2.6} />}
                  </View>
                  <Text style={{
                    flex: 1, fontSize: 14, color: t.fg,
                    textDecorationLine: checked.has(i) ? 'line-through' : 'none',
                    opacity: checked.has(i) ? 0.5 : 1,
                  }}>{ing.name}</Text>
                  <Text style={{ fontSize: 12, color: t.muted, fontFamily: MONO }}>{ing.qty}</Text>
                  <View style={{
                    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
                    backgroundColor: ing.have ? t.accentSoft : t.warnSoft,
                  }}>
                    <Text style={{
                      fontSize: 9, fontFamily: MONO, letterSpacing: 0.5, textTransform: 'uppercase',
                      color: ing.have ? t.accent : t.warn,
                    }}>{ing.have ? 'en casa' : 'falta'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {tab === 'steps' && (
            <View style={{ marginTop: 16, gap: 14 }}>
              {r.steps.map((s, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 14 }}>
                  <View style={{
                    width: 30, height: 30, borderRadius: 999,
                    backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Text style={{ fontSize: 16, color: t.fg }}>{i + 1}</Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, lineHeight: 22, color: t.fg, paddingTop: 4 }}>{s}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      {mealId && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          paddingHorizontal: 22, paddingTop: 16,
          paddingBottom: Math.max(22, insets.bottom + 12),
          backgroundColor: t.bg,
          borderTopWidth: 1, borderColor: t.border,
        }}>
          <PrimaryButton
            icon={isDone ? 'check' : 'plus'}
            onPress={() => {
              toggleMealDone(mealId, { kcal: r.kcal, protein: r.p || 0 });
              navigation.goBack();
            }}
          >
            {isDone ? 'Hecha ✓' : 'Marcar como hecha'}
          </PrimaryButton>
        </View>
      )}
    </View>
  );
}
