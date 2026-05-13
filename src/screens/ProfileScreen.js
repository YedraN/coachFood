import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useTabSafeBottom, Eyebrow, H2, Card, IconButton, Icon } from '../components/ui';
import PaywallModal from '../components/PaywallModal';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

export default function ProfileScreen({ navigation }) {
  const t = useTheme();
  const tabBottom = useTabSafeBottom();
  const { user: u, daily, logout, session, refreshUser, aiGenerationsThisMonth, AI_FREE_LIMIT, prs, workoutPlans, aiRecipes, pantry } = useApp();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', onPress: async () => { await logout(); }, style: 'destructive' },
    ]);
  };

  const totalWorkoutsDone = workoutPlans.filter(p => p.done).length;
  const totalPrs = prs.length;
  const recipesThisMonth = aiGenerationsThisMonth();
  const bestPr = prs.length > 0 ? [...prs].sort((a, b) => b.weight - a.weight)[0] : null;

  const stats = [
    { label: 'Racha actual',  value: `${u.streak}`, unit: 'días',   icon: 'flame', accent: true },
    { label: 'Peso perdido',  value: `−${(u.weightStart - u.weight).toFixed(1)}`, unit: 'kg', icon: 'weight' },
    { label: 'Entrenos hechos', value: `${totalWorkoutsDone}`, unit: 'sesiones', icon: 'dumbbell' },
    { label: 'PRs registrados', value: `${totalPrs}`, unit: 'marcas', icon: 'weight', accent: true },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        userId={session?.user?.id}
        aiGenerationsThisMonth={recipesThisMonth}
        onRefreshUser={refreshUser}
        theme={t}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: tabBottom }}>
        {/* Profile header */}
        <View style={{ padding: 22, paddingTop: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 999, backgroundColor: t.accent,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 28, color: '#fff' }}>{u.name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <H2 style={{ fontSize: 24 }}>{u.name}</H2>
            <Text style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>
              {u.age} años · {u.height} cm · {u.weight} kg · {u.sex}
            </Text>
            <Text style={{ fontSize: 11, color: t.accent, marginTop: 2, fontFamily: MONO }}>
              {pantry.length} prod. · {aiRecipes.length} recetas · {totalWorkoutsDone} entrenos
            </Text>
          </View>
          <IconButton icon={t.isDark ? 'sun' : 'moon'} onPress={t.toggleTheme} />
        </View>

        {/* Stats grid */}
        <View style={{ paddingHorizontal: 22 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {stats.map((s, i) => (
              <TouchableOpacity key={i} style={{ width: '47.5%' }} onPress={() => {
                if (s.label === 'PRs registrados') navigation.navigate('Prs');
              }}>
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Eyebrow>{s.label}</Eyebrow>
                    <Icon name={s.icon} size={12} color={s.accent ? t.accent : t.muted} />
                  </View>
                  <Text style={{ fontSize: 30, color: s.accent ? t.accent : t.fg, marginTop: 6, lineHeight: 34 }}>
                    {s.value}<Text style={{ fontSize: 13, color: t.muted }}> {s.unit}</Text>
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings groups */}
        <View style={{ paddingHorizontal: 22, marginTop: 24 }}>
          <SettingsGroup t={t} title="Nutrición" rows={[
            { icon: 'flame', label: 'Objetivo',  value: { lose: 'Perder peso', gain: 'Ganar músculo', maintain: 'Mantener' }[u.goal] ?? 'Perder peso' },
            { icon: 'leaf',  label: 'Calorías',  value: `${u.kcalTarget} kcal/día` },
            { icon: 'apple', label: 'Proteína',  value: `${u.proteinTarget} g/día` },
            { icon: 'walk',  label: 'Actividad', value: { sedentary: 'Sedentaria', light: 'Ligera', moderate: 'Moderada', active: 'Activa' }[u.activity] ?? 'Moderada' },
          ]} />
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 14 }}>
          <SettingsGroup t={t} title="Entrenamiento" rows={[
            { icon: 'dumbbell', label: 'Plan semanal', value: `${workoutPlans.length > 0 ? 'Activo' : 'Sin plan'}`, onPress: () => navigation.navigate('Workout') },
            { icon: 'weight', label: 'Mis marcas (PRs)', value: `${totalPrs} registradas`, onPress: () => navigation.navigate('Prs') },
          ]} />
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 14 }}>
          <SettingsGroup t={t} title="Cuenta" rows={[
            { icon: t.isDark ? 'sun' : 'moon', label: 'Tema oscuro', value: t.isDark ? 'Activado' : 'Desactivado', onPress: t.toggleTheme },
            { icon: 'bell', label: 'Notificaciones', value: 'Próximamente' },
            { icon: 'cart', label: 'Mi supermercado', value: 'Configurar' },
            { icon: 'sparkle', label: 'CoachFood Premium', value: u.isPremium ? 'Activo' : 'Probar ahora', onPress: u.isPremium ? undefined : () => setShowPaywall(true) },
            ...(u.isPremium ? [{ icon: 'user', label: 'Cerrar sesión', value: '', onPress: handleLogout }] : []),
          ]} />
        </View>

        {!u.isPremium && (
          <View style={{ paddingHorizontal: 22, marginTop: 14 }}>
            <SettingsGroup t={t} title="Más" rows={[
              { icon: 'sparkle', label: 'Premium', value: 'Probar ahora', onPress: () => setShowPaywall(true) },
              { icon: 'user', label: 'Cerrar sesión', value: '', onPress: handleLogout },
            ]} />
          </View>
        )}

        {/* Version */}
        <Text style={{
          textAlign: 'center', marginTop: 20, fontFamily: MONO,
          fontSize: 10, color: t.muted, letterSpacing: 1,
        }}>
          COACHFOOD · v0.5.0 · ALPHA
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsGroup({ t, title, rows }) {
  return (
    <View>
      <Eyebrow>{title}</Eyebrow>
      <View style={{
        marginTop: 8, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
        borderRadius: 16, overflow: 'hidden',
      }}>
        {rows.map((r, i) => (
          <TouchableOpacity key={i} activeOpacity={0.7} onPress={r.onPress} style={{
            flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
            borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderColor: t.border,
          }}>
            <View style={{
              width: 32, height: 32, borderRadius: 10, backgroundColor: t.chipBg,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={r.icon} size={16} color={t.fg} />
            </View>
            <Text style={{ flex: 1, fontSize: 14, color: t.fg }}>{r.label}</Text>
            {r.value ? <Text style={{ fontSize: 12, color: t.muted }}>{r.value}</Text> : null}
            <Icon name="chevron" size={16} color={t.muted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
