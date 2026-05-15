import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Eyebrow, H1, Icon, PrimaryButton } from '../components/ui';
import { useApp, calcTargets } from '../context/AppContext';
import { MONO } from '../constants/fonts';

const STEPS = [
  { eyebrow: '01 / 03', title: '¿Cuál es tu objetivo?' },
  { eyebrow: '02 / 03', title: 'Tus datos' },
  { eyebrow: '03 / 03', title: 'Tu ritmo de vida' },
];

export default function OnboardingScreen() {
  const t = useTheme();
  const { completeOnboarding, logout } = useApp();
  const [step, setStep]         = useState(0);
  const [goal, setGoal]         = useState('lose');
  const [sex, setSex]           = useState('Mujer');
  const [age, setAge]           = useState(29);
  const [weight, setWeight]     = useState(70);
  const [height, setHeight]     = useState(170);
  const [activity, setActivity] = useState('moderate');
  const [target, setTarget]     = useState(65);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const next = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setSaving(true);
      setErrorMsg('');
      try {
        await completeOnboarding({ goal, sex, age, weight, height, activity, target });
      } catch (e) {
        setErrorMsg(e.message || 'Error al guardar');
        setSaving(false);
      }
    }
  };

  const back = () => step > 0 && setStep(step - 1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header: back-to-login + progress bar */}
        <View style={{ paddingTop: 16, paddingHorizontal: 22 }}>
          <TouchableOpacity onPress={logout} style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingVertical: 4, paddingHorizontal: 2,
            }}>
              <Icon name="chevronL" size={16} color={t.muted} />
              <Text allowFontScaling={false} style={{ fontSize: 13, color: t.muted }}>Volver al inicio de sesión</Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[0, 1, 2].map(i => (
              <View key={i} style={{
                flex: 1, height: 3, borderRadius: 999,
                backgroundColor: i <= step ? t.accent : t.border,
              }} />
            ))}
          </View>
        </View>

        <View style={{ padding: 24, paddingBottom: 12 }}>
          <Eyebrow>{STEPS[step].eyebrow}</Eyebrow>
          <H1 style={{ marginTop: 12 }}>{STEPS[step].title}</H1>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 22, paddingTop: 4 }}>
          {step === 0 && <StepGoal t={t} goal={goal} setGoal={setGoal} />}
          {step === 1 && (
            <StepData
              t={t} sex={sex} setSex={setSex}
              age={age} setAge={setAge}
              weight={weight} setWeight={setWeight}
              height={height} setHeight={setHeight}
              goal={goal} target={target} setTarget={setTarget}
            />
          )}
          {step === 2 && (
            <StepActivity
              t={t} activity={activity} setActivity={setActivity}
              formData={{ goal, weight, height, age, sex }}
            />
          )}
        </ScrollView>

        <View style={{
          paddingHorizontal: 22, paddingBottom: 32, paddingTop: 12,
          flexDirection: 'row', gap: 10,
        }}>
          {step > 0 && (
            <TouchableOpacity onPress={back} style={{
              width: 52, height: 52, borderRadius: 999,
              borderWidth: 1, borderColor: t.border2,
              backgroundColor: t.surface,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="chevronL" size={20} color={t.fg} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <PrimaryButton onPress={next} disabled={saving} icon={step === 2 ? 'sparkle' : 'arrow'}>
              {saving ? 'Guardando...' : step === 2 ? 'Empezar' : 'Continuar'}
            </PrimaryButton>
            {errorMsg ? (
              <Text style={{ color: t.warn, fontSize: 12, textAlign: 'center', marginTop: 8 }}>{errorMsg}</Text>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepGoal({ t, goal, setGoal }) {
  const options = [
    { id: 'lose',     icon: 'flame',   title: 'Perder peso',   sub: 'Déficit calórico controlado' },
    { id: 'maintain', icon: 'leaf',    title: 'Mantener',      sub: 'Hábitos saludables' },
    { id: 'gain',     icon: 'sparkle', title: 'Ganar músculo', sub: 'Superávit con proteína alta' },
  ];
  return (
    <View style={{ gap: 12 }}>
      {options.map(opt => (
        <TouchableOpacity key={opt.id} onPress={() => setGoal(opt.id)} activeOpacity={0.8}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20,
            borderWidth: 1, borderColor: goal === opt.id ? t.accent : t.border,
            backgroundColor: goal === opt.id ? t.accentSoft : t.surface,
            borderRadius: 16,
          }}>
          <View style={{
            width: 44, height: 44, borderRadius: 999,
            backgroundColor: goal === opt.id ? t.accent : t.chipBg,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={opt.icon} size={20} color={goal === opt.id ? '#fff' : t.fg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text allowFontScaling={false} style={{ fontSize: 20, color: t.fg }}>{opt.title}</Text>
            <Text allowFontScaling={false} style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{opt.sub}</Text>
          </View>
          {goal === opt.id && <Icon name="check" size={20} color={t.accent} strokeWidth={2.2} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function StepData({ t, sex, setSex, age, setAge, weight, setWeight, height, setHeight, goal, target, setTarget }) {
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {['Mujer', 'Hombre', 'Otro'].map(s => (
          <TouchableOpacity key={s} onPress={() => setSex(s)} style={{
            flex: 1, height: 46, borderRadius: 14,
            borderWidth: 1, borderColor: sex === s ? t.accent : t.border,
            backgroundColor: sex === s ? t.accentSoft : t.surface,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text allowFontScaling={false} style={{ color: t.fg, fontSize: 14 }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <NumberRow t={t} label="Edad"          value={age}    onChange={setAge}    unit="años" min={14} max={90} />
      <NumberRow t={t} label="Peso"          value={weight} onChange={setWeight} unit="kg"   step={0.5} min={30} max={200} />
      <NumberRow t={t} label="Altura"        value={height} onChange={setHeight} unit="cm"   min={120} max={220} />
      {goal !== 'maintain' && (
        <NumberRow t={t} label="Peso objetivo" value={target} onChange={setTarget} unit="kg" step={0.5} min={30} max={200} />
      )}
    </View>
  );
}

function StepActivity({ t, activity, setActivity, formData }) {
  const options = [
    { id: 'sedentary', title: 'Sedentaria', sub: 'Trabajo de oficina, poca actividad' },
    { id: 'light',     title: 'Ligera',     sub: '1-2 entrenos por semana' },
    { id: 'moderate',  title: 'Moderada',   sub: '3-4 entrenos por semana' },
    { id: 'active',    title: 'Activa',     sub: '5+ entrenos o trabajo físico' },
  ];
  const { kcalTarget: kcal } = calcTargets({ ...formData, activity });
  const { goal } = formData;
  return (
    <View style={{ gap: 12 }}>
      {options.map(opt => (
        <TouchableOpacity key={opt.id} onPress={() => setActivity(opt.id)} activeOpacity={0.8}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18,
            borderWidth: 1, borderColor: activity === opt.id ? t.accent : t.border,
            backgroundColor: activity === opt.id ? t.accentSoft : t.surface,
            borderRadius: 14,
          }}>
          <View style={{ flex: 1 }}>
            <Text allowFontScaling={false} style={{ fontWeight: '600', fontSize: 15, color: t.fg }}>{opt.title}</Text>
            <Text allowFontScaling={false} style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{opt.sub}</Text>
          </View>
          {activity === opt.id && <Icon name="check" size={18} color={t.accent} strokeWidth={2.2} />}
        </TouchableOpacity>
      ))}

      <View style={{ marginTop: 12, padding: 18, borderRadius: 16, backgroundColor: t.fg }}>
        <Text allowFontScaling={false} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: t.bg, opacity: 0.6 }}>
          Tu objetivo diario
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 8 }}>
          <Text allowFontScaling={false} style={{ fontSize: 44, lineHeight: 48, color: t.bg }}>{kcal}</Text>
          <Text allowFontScaling={false} style={{ fontSize: 14, color: t.bg, opacity: 0.7, marginBottom: 4 }}>kcal/día</Text>
        </View>
        <Text allowFontScaling={false} style={{ fontSize: 12, color: t.bg, opacity: 0.7, marginTop: 8 }}>
          Calculado para {goal === 'lose' ? 'perder 0.5 kg/sem' : goal === 'gain' ? 'ganar 0.3 kg/sem' : 'mantenerte'} con tu nivel de actividad.
        </Text>
      </View>
    </View>
  );
}

function NumberRow({ t, label, value, onChange, unit, step = 1, min, max }) {
  const inc = () => onChange(prev => Math.min(max ?? 9999, +(prev + step).toFixed(1)));
  const dec = () => onChange(prev => Math.max(min ?? 0,   +(prev - step).toFixed(1)));
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', padding: 16,
      borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, borderRadius: 14,
    }}>
      <View style={{ flex: 1 }}>
        <Eyebrow>{label}</Eyebrow>
        <Text allowFontScaling={false} style={{ marginTop: 4, fontSize: 26, color: t.fg }}>
          {value}<Text allowFontScaling={false} style={{ fontSize: 14, color: t.muted }}> {unit}</Text>
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <RoundBtn t={t} onPress={dec}>−</RoundBtn>
        <RoundBtn t={t} onPress={inc}>+</RoundBtn>
      </View>
    </View>
  );
}

function RoundBtn({ t, children, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{
      width: 36, height: 36, borderRadius: 999,
      borderWidth: 1, borderColor: t.border2,
      backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center',
    }}>
      <Text allowFontScaling={false} style={{ color: t.fg, fontSize: 18, lineHeight: 22 }}>{children}</Text>
    </TouchableOpacity>
  );
}
