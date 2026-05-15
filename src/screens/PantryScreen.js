import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, TopBar, IconButton, Card, Eyebrow, Chip, Icon } from '../components/ui';
import { CAT_LABELS } from '../constants/data';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

const CATS = ['all', 'protein', 'veg', 'grain', 'dairy', 'fruit', 'pantry'];

export default function PantryScreen({ navigation }) {
  const t = useTheme();
  const { pantry, removeFromPantry } = useApp();
  const [filter, setFilter] = useState('all');

  const items = filter === 'all' ? pantry : pantry.filter(i => i.cat === filter);
  const totalKcal = pantry.reduce((acc, it) => acc + (it.kcal || 0), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        left={<IconButton icon="chevronL" onPress={() => navigation.goBack()} />}
        sub="Despensa"
        title="Lo que tienes en casa"
        right={<IconButton icon="scan" onPress={() => navigation.navigate('Scan')} />}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Stats */}
        <View style={{ paddingHorizontal: 22 }}>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <StatBox label="Productos" value={pantry.length} t={t} />
              <StatBox label="Kcal total" value={totalKcal} t={t} />
              <StatBox label="Escaneados" value={pantry.length} t={t} accent />
            </View>
          </Card>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 16, gap: 8 }}>
          {CATS.map(c => (
            <Chip key={c} active={filter === c} onPress={() => setFilter(c)}>
              {c === 'all' ? 'Todo' : CAT_LABELS[c] ?? c}
            </Chip>
          ))}
        </ScrollView>

        {/* Empty state */}
        {pantry.length === 0 && (
          <View style={{ alignItems: 'center', padding: 40, gap: 14 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 999,
              backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="scan" size={30} color={t.muted} strokeWidth={1.5} />
            </View>
            <Text style={{ fontSize: 16, color: t.fg, textAlign: 'center' }}>
              Tu despensa está vacía
            </Text>
            <Text style={{ fontSize: 13, color: t.muted, textAlign: 'center', lineHeight: 20 }}>
              Escanea el código de barras de cualquier producto para añadirlo.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Scan')}
              style={{
                marginTop: 4, paddingHorizontal: 20, paddingVertical: 12,
                backgroundColor: t.accent, borderRadius: 999,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Escanear producto</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Items grid */}
        {items.length > 0 && (
          <View style={{ paddingHorizontal: 22 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {items.map((it) => (
                <View key={it.id} style={{
                  width: '45%',
                  backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
                  borderRadius: 16, padding: 14,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{
                      width: 44, height: 44, borderRadius: 12, backgroundColor: t.chipBg,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 22 }}>{it.emoji || '🥫'}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFromPantry(it.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Icon name="x" size={14} color={t.muted} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: t.fg, marginTop: 12, lineHeight: 18 }}
                    numberOfLines={2}>
                    {it.name}
                  </Text>
                  <Text style={{ fontSize: 10, color: t.muted, marginTop: 6, fontFamily: MONO, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {it.qty}
                  </Text>
                  {it.kcal > 0 && (
                    <Text style={{ fontSize: 11, color: t.accent, marginTop: 6, fontFamily: MONO }}>
                      {it.kcal} kcal · {it.protein}g prot
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* No results for filter */}
        {pantry.length > 0 && items.length === 0 && (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ fontSize: 13, color: t.muted }}>
              No hay productos en esta categoría.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, t, accent }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Eyebrow>{label}</Eyebrow>
      <Text style={{ fontSize: 26, color: accent ? t.accent : t.fg, marginTop: 4 }}>{value}</Text>
    </View>
  );
}
