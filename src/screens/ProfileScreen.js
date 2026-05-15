import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, useWindowDimensions, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useTabSafeBottom, Icon, SHADOW } from '../components/ui';
import PaywallModal from '../components/PaywallModal';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

// ── Bottom Sheet wrapper (for pickers) ─────────────────────────
function Sheet({ visible, onClose, title, children }) {
  const t = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <ScrollView bounces={false} keyboardShouldPersistTaps="handled" style={{
            backgroundColor: t.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
            maxHeight: '80%',
          }}>
            <View style={{ padding: 24, paddingBottom: 36 }}>
              <View style={{ width: 40, height: 5, backgroundColor: t.border, borderRadius: 999, alignSelf: 'center', marginBottom: 20 }} />
              <Text style={{ fontSize: 20, color: t.fg, fontWeight: '700', marginBottom: 20 }}>{title}</Text>
              {children}
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Center floating modal (for data entry with keyboard) ──────
function CenterModal({ visible, onClose, title, children }) {
  const t = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{
            backgroundColor: t.surface, borderRadius: 24, padding: 24,
            width: '84%', maxWidth: 340,
            borderWidth: 1, borderColor: t.border,
            ...SHADOW.lg,
          }}>
            <View style={{ width: 40, height: 5, backgroundColor: t.border, borderRadius: 999, alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ fontSize: 20, color: t.fg, fontWeight: '700', marginBottom: 20, textAlign: 'center' }}>{title}</Text>
            {children}
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function PickerRow({ label, value, selected, onPress }) {
  const t = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={{
      flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 6,
      borderBottomWidth: 1, borderColor: t.border,
    }}>
      <View style={{
        width: 24, height: 24, borderRadius: 999,
        borderWidth: 2, borderColor: selected ? t.accent : t.border2,
        backgroundColor: selected ? t.accent : 'transparent',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#fff' }} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: t.fg, fontWeight: '500' }}>{label}</Text>
        {value ? <Text style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{value}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

// ── SVG Progress Ring ────────────────────────────────────────────
function ProgressRing({ pct, size = 64, stroke = 5, color }) {
  const t = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.border} strokeWidth={stroke} fill="none" />
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={color || t.accent} strokeWidth={stroke} fill="none"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </Svg>
  );
}

// ── Mini Weight Chart ────────────────────────────────────────────
function MiniChart({ data, color }) {
  const t = useTheme();
  const w = 260, h = 80, pad = 4;
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d.weight);
  const min = Math.min(...vals) - 1;
  const max = Math.max(...vals) + 1;
  const range = max - min || 1;
  const xStep = (w - pad * 2) / (data.length - 1);
  const points = data.map((d, i) => `${pad + i * xStep},${h - pad - ((d.weight - min) / range) * (h - pad * 2)}`).join(' ');
  return (
    <Svg width={w} height={h}>
      <Polyline points={points} fill="none" stroke={color || t.accent} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {[0, data.length - 1].map(i => (
        <Circle key={i} cx={parseFloat(points.split(' ')[i].split(',')[0])} cy={parseFloat(points.split(' ')[i].split(',')[1])}
          r={3} fill={color || t.accent} />
      ))}
    </Svg>
  );
}

// ── Main Screen ──────────────────────────────────────────────────
const GOALS = [
  { id: 'lose',     label: 'Perder peso',     sub: 'Déficit calórico, alta proteína' },
  { id: 'gain',     label: 'Ganar músculo',    sub: 'Superávit moderado, entrenar fuerte' },
  { id: 'maintain', label: 'Mantener peso',    sub: 'Equilibrio calórico' },
];

const ACTIVITY = [
  { id: 'sedentary', label: 'Sedentaria',   sub: 'Trabajo de oficina, poco ejercicio' },
  { id: 'light',     label: 'Ligera',       sub: '1-2 días/semana de ejercicio' },
  { id: 'moderate',  label: 'Moderada',     sub: '3-5 días/semana' },
  { id: 'active',    label: 'Activa',       sub: '6-7 días/semana o trabajo físico' },
];

const MEALS = [
  { id: 'any',     label: 'Sin restricciones' },
  { id: 'veg',     label: 'Vegetariana' },
  { id: 'vegan',   label: 'Vegana' },
  { id: 'keto',    label: 'Keto / Bajo en carbos' },
  { id: 'paleo',   label: 'Paleo' },
  { id: 'gluten',  label: 'Sin gluten' },
  { id: 'lactose', label: 'Sin lactosa' },
];

export default function ProfileScreen({ navigation }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const tabBottom = useTabSafeBottom();
  const { width } = useWindowDimensions();
  const {
    user: u, daily, logout, session, refreshUser, aiGenerationsThisMonth, AI_FREE_LIMIT,
    prs, workoutPlans, aiRecipes, pantry, weightHistory, logWeight, updateUser,
  } = useApp();
  const [showPaywall, setShowPaywall] = useState(false);

  const [sheet, setSheet] = useState(null);
  const [editValue, setEditValue] = useState('');

  const totalWorkoutsDone = workoutPlans.filter(p => p.done).length;
  const totalPrs = prs.length;
  const bestPr = prs.length > 0 ? [...prs].sort((a, b) => b.weight - a.weight)[0] : null;
  const progressPct = Math.min(1, Math.max(0, (u.weightStart - u.weight) / Math.max(0.1, u.weightStart - u.weightTarget)));
  const lostKg = (u.weightStart - u.weight) > 0 ? (u.weightStart - u.weight).toFixed(1) : null;

  const openSheet = (name) => {
    setEditValue('');
    setSheet(name);
  };

  const closeSheet = () => setSheet(null);

  const handleSaveGoal = async (goal) => {
    await updateUser({ goal });
    closeSheet();
  };

  const handleSaveActivity = async (activity) => {
    await updateUser({ activity });
    closeSheet();
  };

  const handleSaveName = async () => {
    if (editValue.trim()) {
      await updateUser({ name: editValue.trim() });
    }
    closeSheet();
  };

  const handleSaveNumber = async (field) => {
    const v = parseFloat(editValue);
    if (!v || v <= 0) return Alert.alert('Error', 'Valor inválido');
    await updateUser({ [field]: v });
    closeSheet();
  };

  const handleLogWeight = async () => {
    const v = parseFloat(editValue);
    if (!v || v <= 0) return Alert.alert('Error', 'Peso inválido');
    await logWeight(v);
    closeSheet();
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)}
        userId={session?.user?.id} aiGenerationsThisMonth={aiGenerationsThisMonth()}
        onRefreshUser={refreshUser} theme={t} />

      <ScrollView contentContainerStyle={{ paddingBottom: tabBottom + 40 }}>
        {/* ══════════════════════════════════════════════════════════
            HEADER — full bleed to top edge
           ══════════════════════════════════════════════════════════ */}
        <LinearGradient
          colors={[t.accent, t.accent + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 22 }}
        >
          {/* Top row: label + theme toggle */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: MONO, fontSize: 10, color: '#fff', opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Perfil
            </Text>
            <TouchableOpacity onPress={t.toggleTheme} style={{
              width: 36, height: 36, borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={t.isDark ? 'sun' : 'moon'} size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Avatar + name */}
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <View style={{
              width: 96, height: 96, borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
              ...SHADOW.md,
            }}>
              <TouchableOpacity onPress={() => openSheet('name')} style={{
                width: '100%', height: '100%', borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 40, color: '#fff', fontWeight: '600' }}>{u.name[0]?.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => openSheet('name')} style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 28, color: '#fff', fontWeight: '700', textAlign: 'center' }}>
                {u.name} <Text style={{ fontSize: 16, opacity: 0.7 }}>✎</Text>
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              <Text style={{ fontSize: 14, color: '#fff', opacity: 0.75 }}>{u.age} años</Text>
              <Text style={{ fontSize: 14, color: '#fff', opacity: 0.4 }}>·</Text>
              <Text style={{ fontSize: 14, color: '#fff', opacity: 0.75 }}>{u.height} cm</Text>
              <Text style={{ fontSize: 14, color: '#fff', opacity: 0.4 }}>·</Text>
              <Text style={{ fontSize: 14, color: '#fff', opacity: 0.75 }}>{u.weight} kg</Text>
            </View>
          </View>

          {/* Achievements row */}
          <View style={{ flexDirection: 'row', marginTop: 22, gap: 10 }}>
            {[
              { icon: 'flame',    value: `${u.streak}`, unit: 'días',  label: 'Racha' },
              { icon: 'arrow',    value: lostKg ? `-${lostKg}` : '0',  unit: 'kg',   label: lostKg ? 'Perdido' : 'Estable' },
              { icon: 'dumbbell', value: `${totalWorkoutsDone}`, unit: 'ents', label: 'Completados' },
            ].map((s, i) => (
              <View key={i} style={{
                flex: 1, backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: 14, padding: 12, alignItems: 'center', gap: 4,
              }}>
                <Icon name={s.icon} size={16} color="#fff" strokeWidth={1.8} />
                <Text style={{ fontSize: 20, color: '#fff', fontWeight: '700' }}>{s.value}</Text>
                <Text style={{ fontSize: 9, color: '#fff', opacity: 0.55, fontFamily: MONO, letterSpacing: 0.5 }}>
                  {s.unit.toUpperCase()}
                </Text>
                <Text style={{ fontSize: 8, color: '#fff', opacity: 0.4 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ══════════════════════════════════════════════════════════
            PROGRESS CARD — slides up over the header
           ══════════════════════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: 20, marginTop: -20 }}>
          <View style={{
            backgroundColor: t.surface, borderRadius: 20, padding: 20,
            borderWidth: 1, borderColor: t.border,
            ...SHADOW.md,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <ProgressRing pct={progressPct} size={72} stroke={6} color={t.accent} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: t.muted, fontFamily: MONO, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Progreso
                </Text>
                <Text style={{ fontSize: 28, color: t.fg, fontWeight: '700', marginTop: 2 }}>
                  {u.weightStart} → {u.weight} kg
                </Text>
                <Text style={{ fontSize: 13, color: t.muted, marginTop: 2 }}>
                  Meta: {u.weightTarget} kg ({Math.round(progressPct * 100)}%)
                </Text>
              </View>
            </View>
            {weightHistory.length >= 2 && (
              <View style={{ alignItems: 'center', marginTop: 14 }}>
                <MiniChart data={weightHistory} color={t.accent} />
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity onPress={() => { setEditValue(String(u.weight)); openSheet('weight'); }}
                style={{ flex: 1, height: 48, borderRadius: 999, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Registrar peso</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditValue(String(u.weightTarget)); openSheet('target'); }}
                style={{ flex: 1, height: 48, borderRadius: 999, backgroundColor: 'transparent', borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: t.fg, fontSize: 15, fontWeight: '600' }}>Cambiar meta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            QUICK ACTIONS
           ══════════════════════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{
            fontSize: 13, color: t.muted, fontFamily: MONO, letterSpacing: 0.5,
            textTransform: 'uppercase', marginBottom: 12, marginLeft: 2,
          }}>
            Acceso rápido
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: 'scan',  label: 'Escanear',      onPress: () => navigation.navigate('Scan') },
              { icon: 'sparkle',  label: 'Recetas IA',    onPress: () => navigation.navigate('Recipes') },
              { icon: 'dumbbell', label: 'Entrenar',      onPress: () => navigation.navigate('Workout') },
              { icon: 'weight',   label: 'Marcas',        onPress: () => navigation.navigate('Prs') },
            ].map((a, i) => (
              <TouchableOpacity key={i} onPress={a.onPress} activeOpacity={0.7}
                style={{
                  flex: 1, backgroundColor: t.surface, borderRadius: 16, paddingVertical: 18,
                  alignItems: 'center', gap: 8,
                  borderWidth: 1, borderColor: t.border,
                  ...SHADOW.sm,
                }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 14,
                  backgroundColor: t.accent + '18', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={a.icon} size={22} color={t.accent} />
                </View>
                <Text style={{ fontSize: 10, color: t.muted, fontFamily: MONO, letterSpacing: 0.3 }}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            SETTINGS SECTIONS
           ══════════════════════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: 20, marginTop: 28, gap: 20 }}>
          {/* Personal info */}
          <View>
            <Text style={{
              fontSize: 12, color: t.muted, fontFamily: MONO, letterSpacing: 0.5,
              textTransform: 'uppercase', marginBottom: 10, marginLeft: 4,
            }}>
              Información personal
            </Text>
            <View style={{
              backgroundColor: t.surface, borderRadius: 18, overflow: 'hidden',
              borderWidth: 1, borderColor: t.border,
              ...SHADOW.sm,
            }}>
              <SettingRow icon="flame" label="Objetivo" value={{ lose: 'Perder peso', gain: 'Ganar músculo', maintain: 'Mantener' }[u.goal]}
                onPress={() => openSheet('goal')} t={t} />
              <SettingRow icon="walk" label="Actividad" value={{ sedentary: 'Sedentaria', light: 'Ligera', moderate: 'Moderada', active: 'Activa' }[u.activity]}
                onPress={() => openSheet('activity')} t={t} />
              <SettingRow icon="user" label="Edad" value={`${u.age} años`}
                onPress={() => { setEditValue(String(u.age)); openSheet('age'); }} t={t} last />
            </View>
          </View>

          {/* Nutrition */}
          <View>
            <Text style={{
              fontSize: 12, color: t.muted, fontFamily: MONO, letterSpacing: 0.5,
              textTransform: 'uppercase', marginBottom: 10, marginLeft: 4,
            }}>
              Nutrición y dieta
            </Text>
            <View style={{
              backgroundColor: t.surface, borderRadius: 18, overflow: 'hidden',
              borderWidth: 1, borderColor: t.border,
              ...SHADOW.sm,
            }}>
              <SettingRow icon="leaf" label="Preferencia" value="Sin restricciones"
                onPress={() => openSheet('diet')} t={t} last />
            </View>
          </View>

          {/* Training */}
          <View>
            <Text style={{
              fontSize: 12, color: t.muted, fontFamily: MONO, letterSpacing: 0.5,
              textTransform: 'uppercase', marginBottom: 10, marginLeft: 4,
            }}>
              Entrenamiento
            </Text>
            <View style={{
              backgroundColor: t.surface, borderRadius: 18, overflow: 'hidden',
              borderWidth: 1, borderColor: t.border,
              ...SHADOW.sm,
            }}>
              <SettingRow icon="dumbbell" label="Plan semanal" value={workoutPlans.length > 0 ? 'Activo' : 'Sin plan'}
                onPress={() => navigation.navigate('Workout')} t={t} />
              <SettingRow icon="weight" label="Marcas personales" value={`${totalPrs} registradas`}
                onPress={() => navigation.navigate('Prs')} t={t} last />
            </View>
          </View>

          {/* Appearance */}
          <View>
            <Text style={{
              fontSize: 12, color: t.muted, fontFamily: MONO, letterSpacing: 0.5,
              textTransform: 'uppercase', marginBottom: 10, marginLeft: 4,
            }}>
              Apariencia
            </Text>
            <View style={{
              backgroundColor: t.surface, borderRadius: 18, overflow: 'hidden',
              borderWidth: 1, borderColor: t.border,
              ...SHADOW.sm,
            }}>
              <SettingRow icon={t.isDark ? 'moon' : 'sun'} label="Tema oscuro" value={t.isDark ? 'Activado' : 'Desactivado'}
                onPress={t.toggleTheme} t={t} last />
            </View>
          </View>

          {/* Account */}
          <View>
            <Text style={{
              fontSize: 12, color: t.muted, fontFamily: MONO, letterSpacing: 0.5,
              textTransform: 'uppercase', marginBottom: 10, marginLeft: 4,
            }}>
              Cuenta
            </Text>
            <View style={{
              backgroundColor: t.surface, borderRadius: 18, overflow: 'hidden',
              borderWidth: 1, borderColor: t.border,
              ...SHADOW.sm,
            }}>
              <SettingRow icon="bell" label="Notificaciones" value="Configurar"
                onPress={() => navigation.navigate('ComingSoon', { feature: 'Notificaciones' })} t={t} />
              <SettingRow icon="cart" label="Mi supermercado" value="Configurar"
                onPress={() => navigation.navigate('ComingSoon', { feature: 'Supermercado favorito' })} t={t} />
              <SettingRow icon="sparkle" label="Premium" value={u.isPremium ? 'Activo' : 'Probar ahora'}
                onPress={() => { if (!u.isPremium) setShowPaywall(true); }} t={t} />
              <SettingRow icon="log-out" label="Cerrar sesión" value="" onPress={() => {
                Alert.alert('Cerrar sesión', '¿Estás seguro?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
                ]);
              }} t={t} last />
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            FOOTER
           ══════════════════════════════════════════════════════════ */}
        <View style={{ alignItems: 'center', marginTop: 36, gap: 8, paddingHorizontal: 20 }}>
          <View style={{ width: 32, height: 1, backgroundColor: t.border, opacity: 0.5 }} />
          <Text style={{ fontFamily: MONO, fontSize: 10, color: t.muted, letterSpacing: 1 }}>
            COACHFOOD · v0.5.0 · ALPHA
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('ComingSoon', { feature: 'Eliminar cuenta' })}>
            <Text style={{ fontFamily: MONO, fontSize: 9, color: t.muted, opacity: 0.4, letterSpacing: 0.5 }}>
              ELIMINAR CUENTA
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Bottom Sheets ────────────────────────────────────────── */}

      {/* Goal picker */}
      <Sheet visible={sheet === 'goal'} onClose={closeSheet} title="¿Cuál es tu objetivo?">
        {GOALS.map(g => (
          <PickerRow key={g.id} label={g.label} value={g.sub} selected={u.goal === g.id}
            onPress={() => handleSaveGoal(g.id)} />
        ))}
      </Sheet>

      {/* Activity picker */}
      <Sheet visible={sheet === 'activity'} onClose={closeSheet} title="Nivel de actividad">
        {ACTIVITY.map(a => (
          <PickerRow key={a.id} label={a.label} value={a.sub} selected={u.activity === a.id}
            onPress={() => handleSaveActivity(a.id)} />
        ))}
      </Sheet>

      {/* Diet picker */}
      <Sheet visible={sheet === 'diet'} onClose={closeSheet} title="Preferencia de dieta">
        {MEALS.map(m => (
          <PickerRow key={m.id} label={m.label} selected={false} onPress={() => closeSheet()} />
        ))}
      </Sheet>

      {/* Name editor */}
      <CenterModal visible={sheet === 'name'} onClose={closeSheet} title="Editar nombre">
        <TextInput
          value={editValue || u.name}
          onChangeText={setEditValue}
          placeholder="Tu nombre"
          placeholderTextColor={t.muted}
          autoFocus
          style={{
            backgroundColor: t.bg, borderWidth: 1, borderColor: t.border,
            borderRadius: 14, padding: 16, fontSize: 17, color: t.fg, marginBottom: 16,
          }}
        />
        <TouchableOpacity onPress={handleSaveName} style={{
          height: 52, borderRadius: 999, backgroundColor: t.accent,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Guardar</Text>
        </TouchableOpacity>
      </CenterModal>

      {/* Number input modals */}
      {['weight', 'target', 'height', 'age'].map(field => {
        const labels = { weight: 'Peso (kg)', target: 'Peso objetivo (kg)', height: 'Altura (cm)', age: 'Edad' };
        const maxValues = { weight: 300, target: 300, height: 250, age: 120 };
        return (
          <CenterModal key={field} visible={sheet === field} onClose={closeSheet} title={labels[field]}>
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={t.muted}
              autoFocus
              style={{
                backgroundColor: t.bg, borderWidth: 1, borderColor: t.border,
                borderRadius: 14, padding: 16, fontSize: 26, color: t.fg, textAlign: 'center', marginBottom: 16,
              }}
            />
            <TouchableOpacity onPress={() => {
              const v = parseFloat(editValue);
              if (!v || v <= 0 || v > maxValues[field]) return Alert.alert('Error', `Valor entre 1 y ${maxValues[field]}`);
              if (field === 'weight') { logWeight(v); closeSheet(); }
              else { updateUser({ [field]: v }); closeSheet(); }
            }} style={{
              height: 52, borderRadius: 999, backgroundColor: t.accent,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Guardar</Text>
            </TouchableOpacity>
          </CenterModal>
        );
      })}
    </View>
  );
}

// ── Sub-components ──────────────────────────────────────────────
function SettingRow({ t, icon, label, value, onPress, last }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: t.border }}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
        borderBottomWidth: last ? 0 : 1, borderColor: t.border,
        opacity: Platform.OS === 'ios' && pressed ? 0.7 : 1,
      })}>
      <View style={{
        width: 36, height: 36, borderRadius: 10, backgroundColor: t.chipBg,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={18} color={t.fg} />
      </View>
      <Text allowFontScaling={false} style={{ flex: 1, fontSize: 15, color: t.fg }}>{label}</Text>
      {value ? (
        <Text allowFontScaling={false} style={{ fontSize: 13, color: t.accent, fontWeight: '500' }}>{value}</Text>
      ) : null}
      <Icon name="chevron" size={16} color={t.muted} />
    </Pressable>
  );
}
