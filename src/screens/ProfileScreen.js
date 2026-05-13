import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { useTheme, useTabSafeBottom, Icon } from '../components/ui';
import PaywallModal from '../components/PaywallModal';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

// ── Bottom Sheet wrapper ─────────────────────────────────────────
function Sheet({ visible, onClose, title, children }) {
  const t = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <TouchableOpacity activeOpacity={1} style={{ marginTop: 'auto', backgroundColor: t.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 32 }}>
          <View style={{ width: 40, height: 4, backgroundColor: t.border, borderRadius: 999, alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ fontSize: 18, color: t.fg, fontWeight: '700', marginBottom: 16 }}>{title}</Text>
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
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
  const tabBottom = useTabSafeBottom();
  const { width } = useWindowDimensions();
  const {
    user: u, daily, logout, session, refreshUser, aiGenerationsThisMonth, AI_FREE_LIMIT,
    prs, workoutPlans, aiRecipes, pantry, weightHistory, logWeight, updateUser,
  } = useApp();
  const [showPaywall, setShowPaywall] = useState(false);

  // Sheet state
  const [sheet, setSheet] = useState(null); // 'goal' | 'activity' | 'name' | 'weight' | 'height' | 'age' | 'diet' | 'target' | 'premium'
  const [editValue, setEditValue] = useState('');

  const totalWorkoutsDone = workoutPlans.filter(p => p.done).length;
  const totalPrs = prs.length;
  const bestPr = prs.length > 0 ? [...prs].sort((a, b) => b.weight - a.weight)[0] : null;
  const progressPct = Math.min(1, Math.max(0, (u.weightStart - u.weight) / Math.max(0.1, u.weightStart - u.weightTarget)));

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

  const weekStart = () => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return { mon: d.getDate(), sun: d.getDate() + 6 };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)}
        userId={session?.user?.id} aiGenerationsThisMonth={aiGenerationsThisMonth()}
        onRefreshUser={refreshUser} theme={t} />

      <ScrollView contentContainerStyle={{ paddingBottom: tabBottom + 40 }}>
        {/* ── Header ───────────────────────────────────────────── */}
        <View style={{
          paddingHorizontal: 22, paddingTop: 8, paddingBottom: 28,
          backgroundColor: t.fg, borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: MONO, fontSize: 10, color: t.bg, opacity: 0.5, letterSpacing: 1, textTransform: 'uppercase' }}>
              Perfil
            </Text>
            <TouchableOpacity onPress={t.toggleTheme} style={{
              width: 36, height: 36, borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={t.isDark ? 'sun' : 'moon'} size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', marginTop: 12 }}>
            {/* Avatar */}
            <TouchableOpacity onPress={() => openSheet('name')} style={{
              width: 80, height: 80, borderRadius: 999,
              backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center',
              borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)',
            }}>
              <Text style={{ fontSize: 34, color: '#fff' }}>{u.name[0]?.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSheet('name')} style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 24, color: '#fff', fontWeight: '700', textAlign: 'center' }}>
                {u.name} <Text style={{ fontSize: 16, opacity: 0.7 }}>✎</Text>
              </Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 13, color: '#fff', opacity: 0.6, marginTop: 2 }}>
              {u.age} años · {u.height} cm · {u.weight} kg
            </Text>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', marginTop: 18, gap: 8 }}>
            {[
              { label: 'Racha', value: `${u.streak}`, unit: 'días', color: '#FFD700' },
              { label: 'Perdido', value: `${(u.weightStart - u.weight).toFixed(1)}`, unit: 'kg', color: '#4ADE80' },
              { label: 'PRs', value: `${totalPrs}`, unit: 'marcas', color: '#F472B6' },
            ].map((s, i) => (
              <View key={i} style={{
                flex: 1, backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 14, padding: 12, alignItems: 'center',
              }}>
                <Text style={{ fontSize: 20, color: s.color, fontWeight: '700' }}>{s.value}</Text>
                <Text style={{ fontSize: 10, color: '#fff', opacity: 0.6, marginTop: 2, fontFamily: MONO, letterSpacing: 0.5 }}>
                  {s.unit.toUpperCase()}
                </Text>
                <Text style={{ fontSize: 9, color: '#fff', opacity: 0.4, marginTop: 1 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Progress Card ────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 22, marginTop: -16 }}>
          <View style={{
            backgroundColor: t.surface, borderRadius: 20, padding: 18,
            borderWidth: 1, borderColor: t.border,
            shadowColor: '#000', shadowOffset: { y: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <ProgressRing pct={progressPct} size={64} stroke={6} color={t.accent} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: t.muted, fontFamily: MONO, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Progreso hacia tu objetivo
                </Text>
                <Text style={{ fontSize: 24, color: t.fg, fontWeight: '700', marginTop: 2 }}>
                  {u.weightStart} → {u.weight} kg
                </Text>
                <Text style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>
                  Meta: {u.weightTarget} kg ({Math.round(progressPct * 100)}%)
                </Text>
              </View>
            </View>
            {weightHistory.length >= 2 && (
              <View style={{ alignItems: 'center', marginTop: 12 }}>
                <MiniChart data={weightHistory} color={t.accent} />
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity onPress={() => { setEditValue(String(u.weight)); openSheet('weight'); }}
                style={{ flex: 1, height: 44, borderRadius: 999, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Registrar peso</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditValue(String(u.weightTarget)); openSheet('target'); }}
                style={{ flex: 1, height: 44, borderRadius: 999, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: t.fg, fontSize: 14, fontWeight: '600' }}>Cambiar meta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Quick Actions ────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          <Text style={{ fontSize: 13, color: t.muted, fontFamily: MONO, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
            Acceso rápido
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { icon: 'scan', label: 'Escanear', onPress: () => navigation.navigate('Scan') },
              { icon: 'sparkle', label: 'Recetas IA', onPress: () => navigation.navigate('Recipes') },
              { icon: 'dumbbell', label: 'Entreno', onPress: () => navigation.navigate('Workout') },
              { icon: 'weight', label: 'PRs', onPress: () => navigation.navigate('Prs') },
            ].map((a, i) => (
              <TouchableOpacity key={i} onPress={a.onPress} style={{
                flex: 1, backgroundColor: t.surface, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6,
                borderWidth: 1, borderColor: t.border,
              }}>
                <Icon name={a.icon} size={22} color={t.accent} />
                <Text style={{ fontSize: 10, color: t.muted, fontFamily: MONO, letterSpacing: 0.3 }}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Settings Sections ────────────────────────────────── */}
        <View style={{ paddingHorizontal: 22, marginTop: 24 }}>
          <Section t={t} title="Información personal">
            <SettingRow icon="flame" label="Objetivo" value={{ lose: 'Perder peso', gain: 'Ganar músculo', maintain: 'Mantener' }[u.goal]}
              onPress={() => openSheet('goal')} t={t} />
            <SettingRow icon="walk" label="Actividad" value={{ sedentary: 'Sedentaria', light: 'Ligera', moderate: 'Moderada', active: 'Activa' }[u.activity]}
              onPress={() => openSheet('activity')} t={t} />
            <SettingRow icon="weight" label="Peso actual" value={`${u.weight} kg`}
              onPress={() => { setEditValue(String(u.weight)); openSheet('weight'); }} t={t} />
            <SettingRow icon="apple" label="Peso objetivo" value={`${u.weightTarget} kg`}
              onPress={() => { setEditValue(String(u.weightTarget)); openSheet('target'); }} t={t} />
            <SettingRow icon="user" label="Edad" value={`${u.age} años`}
              onPress={() => { setEditValue(String(u.age)); openSheet('age'); }} t={t} />
            <SettingRow icon="user" label="Altura" value={`${u.height} cm`}
              onPress={() => { setEditValue(String(u.height)); openSheet('height'); }} t={t} last />
          </Section>
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 14 }}>
          <Section t={t} title="Nutrición y dieta">
            <SettingRow icon="leaf" label="Dieta" value="Sin restricciones" onPress={() => openSheet('diet')} t={t} last />
          </Section>
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 14 }}>
          <Section t={t} title="Entrenamiento">
            <SettingRow icon="dumbbell" label="Plan semanal" value={workoutPlans.length > 0 ? 'Activo' : 'Sin plan'}
              onPress={() => navigation.navigate('Workout')} t={t} />
            <SettingRow icon="weight" label="Marcas personales" value={`${totalPrs} registradas`}
              onPress={() => navigation.navigate('Prs')} t={t} last />
          </Section>
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 14 }}>
          <Section t={t} title="Apariencia">
            <SettingRow icon={t.isDark ? 'sun' : 'moon'} label="Tema oscuro" value={t.isDark ? 'Activado' : 'Desactivado'}
              onPress={t.toggleTheme} t={t} last />
          </Section>
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 14 }}>
          <Section t={t} title="Cuenta">
            <SettingRow icon="bell" label="Notificaciones" value="Configurar"
              onPress={() => navigation.navigate('ComingSoon', { feature: 'Notificaciones' })} t={t} />
            <SettingRow icon="cart" label="Mi supermercado" value="Configurar"
              onPress={() => navigation.navigate('ComingSoon', { feature: 'Supermercado favorito' })} t={t} />
            <SettingRow icon="shield" label="Privacidad" value=""
              onPress={() => navigation.navigate('ComingSoon', { feature: 'Privacidad' })} t={t} />
            <SettingRow icon="sparkle" label="Premium" value={u.isPremium ? 'Activo' : 'Probar ahora'}
              onPress={() => { if (!u.isPremium) setShowPaywall(true); }} t={t} />
            <SettingRow icon="user" label="Cerrar sesión" value="" onPress={() => {
              Alert.alert('Cerrar sesión', '¿Estás seguro?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
              ]);
            }} t={t} last />
          </Section>
        </View>

        {/* ── Footer ────────────────────────────────────────────── */}
        <View style={{ alignItems: 'center', marginTop: 28, gap: 4 }}>
          <Text style={{ fontFamily: MONO, fontSize: 10, color: t.muted, letterSpacing: 1 }}>
            COACHFOOD · v0.5.0 · ALPHA
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('ComingSoon', { feature: 'Eliminar cuenta' })}>
            <Text style={{ fontFamily: MONO, fontSize: 9, color: t.muted, opacity: 0.5, letterSpacing: 0.5 }}>
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
      <Sheet visible={sheet === 'name'} onClose={closeSheet} title="Editar nombre">
        <TextInput
          value={editValue || u.name}
          onChangeText={setEditValue}
          placeholder="Tu nombre"
          placeholderTextColor={t.muted}
          autoFocus
          style={{
            backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
            borderRadius: 12, padding: 14, fontSize: 17, color: t.fg, marginBottom: 16,
          }}
        />
        <TouchableOpacity onPress={handleSaveName} style={{
          height: 50, borderRadius: 999, backgroundColor: t.accent,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Guardar</Text>
        </TouchableOpacity>
      </Sheet>

      {/* Number input modals */}
      {['weight', 'target', 'height', 'age'].map(field => {
        const labels = { weight: 'Peso (kg)', target: 'Peso objetivo (kg)', height: 'Altura (cm)', age: 'Edad' };
        const maxValues = { weight: 300, target: 300, height: 250, age: 120 };
        return (
          <Sheet key={field} visible={sheet === field} onClose={closeSheet} title={labels[field]}>
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={t.muted}
              autoFocus
              style={{
                backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
                borderRadius: 12, padding: 14, fontSize: 24, color: t.fg, textAlign: 'center', marginBottom: 16,
              }}
            />
            <TouchableOpacity onPress={() => {
              const v = parseFloat(editValue);
              if (!v || v <= 0 || v > maxValues[field]) return Alert.alert('Error', `Valor entre 1 y ${maxValues[field]}`);
              if (field === 'weight') { logWeight(v); closeSheet(); }
              else { updateUser({ [field]: v }); closeSheet(); }
            }} style={{
              height: 50, borderRadius: 999, backgroundColor: t.accent,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Guardar</Text>
            </TouchableOpacity>
          </Sheet>
        );
      })}
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────────────
function Section({ t, title, children }) {
  return (
    <View>
      <Text style={{
        fontSize: 13, color: t.muted, fontFamily: MONO, letterSpacing: 0.5,
        textTransform: 'uppercase', marginBottom: 8, marginLeft: 4,
      }}>
        {title}
      </Text>
      <View style={{
        backgroundColor: t.surface, borderRadius: 18, overflow: 'hidden',
        borderWidth: 1, borderColor: t.border,
        shadowColor: '#000', shadowOffset: { y: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
      }}>
        {children}
      </View>
    </View>
  );
}

function SettingRow({ t, icon, label, value, onPress, last }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{
      flexDirection: 'row', alignItems: 'center', gap: 14, padding: 15,
      borderBottomWidth: last ? 0 : 1, borderColor: t.border,
    }}>
      <View style={{
        width: 34, height: 34, borderRadius: 10, backgroundColor: t.chipBg,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={17} color={t.fg} />
      </View>
      <Text style={{ flex: 1, fontSize: 15, color: t.fg }}>{label}</Text>
      {value ? (
        <Text style={{ fontSize: 13, color: t.accent, fontWeight: '500' }}>{value}</Text>
      ) : null}
      <Icon name="chevron" size={16} color={t.muted} />
    </TouchableOpacity>
  );
}
