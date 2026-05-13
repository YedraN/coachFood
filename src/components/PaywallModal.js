import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { Icon } from './ui';
import { MONO } from '../constants/fonts';
import { createCheckoutSession } from '../services/stripe';

const FREE_LIMIT = 3;

const BENEFITS = [
  { icon: 'sparkle', title: 'Recetas con IA ilimitadas',   desc: 'Genera recetas personalizadas según tu despensa sin límite mensual' },
  { icon: 'calendar', title: 'Plan de comidas con IA',     desc: 'Regenera tu plan semanal adaptado a tus objetivos' },
  { icon: 'chart',    title: 'Historial completo',         desc: 'Todo tu progreso de peso y estadísticas sin límite de tiempo' },
  { icon: 'dumbbell', title: 'Seguimiento de entrenos',    desc: 'Registra series, cargas y progresión semana a semana' },
];

export default function PaywallModal({ visible, onClose, userId, aiGenerationsThisMonth, onRefreshUser, theme: t }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const remaining = Math.max(0, FREE_LIMIT - (aiGenerationsThisMonth ?? 0));

  const handleSubscribe = async () => {
    if (!userId) {
      Alert.alert('Error', 'Debes iniciar sesión para suscribirte.');
      return;
    }
    setLoading(true);
    try {
      const { url } = await createCheckoutSession();
      const result = await WebBrowser.openAuthSessionAsync(url, 'coachfood://');
      if (result.type === 'success' && result.url?.includes('premium/success')) {
        await new Promise(r => setTimeout(r, 2500));
        await onRefreshUser?.();
        onClose();
        Alert.alert('¡Bienvenido a Premium!', 'Tu suscripción CoachFood Premium está activa.');
      }
    } catch (e) {
      Alert.alert('Error', 'No pudimos abrir el pago. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={{
            backgroundColor: t.bg,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingHorizontal: 22,
            paddingTop: 28,
            paddingBottom: Math.max(28, insets.bottom + 16),
          }}>
            {/* Drag indicator */}
            <View style={{
              width: 40, height: 4, backgroundColor: t.border,
              borderRadius: 999, alignSelf: 'center', marginBottom: 24,
            }} />

            {/* Hero */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{
                width: 68, height: 68, borderRadius: 999,
                backgroundColor: t.accentSoft,
                alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <Icon name="sparkle" size={30} color={t.accent} strokeWidth={1.8} />
              </View>
              <Text allowFontScaling={false} style={{ fontSize: 22, color: t.fg, fontWeight: '700', marginBottom: 6 }}>
                CoachFood Premium
              </Text>
              {remaining > 0 ? (
                <View style={{
                  backgroundColor: t.accentSoft, borderRadius: 999,
                  paddingHorizontal: 12, paddingVertical: 4,
                }}>
                  <Text allowFontScaling={false} style={{ fontSize: 12, color: t.accent, fontFamily: MONO }}>
                    Te quedan {remaining} generaciones gratuitas este mes
                  </Text>
                </View>
              ) : (
                <View style={{
                  backgroundColor: t.warnSoft, borderRadius: 999,
                  paddingHorizontal: 12, paddingVertical: 4,
                }}>
                  <Text allowFontScaling={false} style={{ fontSize: 12, color: t.warn, fontFamily: MONO }}>
                    Has usado tus {FREE_LIMIT} generaciones gratuitas
                  </Text>
                </View>
              )}
            </View>

            {/* Benefits */}
            <ScrollView scrollEnabled={false} style={{ marginBottom: 20 }}>
              {BENEFITS.map((b, i) => (
                <View key={i} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  paddingVertical: 12,
                  borderBottomWidth: i < BENEFITS.length - 1 ? 1 : 0,
                  borderColor: t.border,
                }}>
                  <View style={{
                    width: 38, height: 38, borderRadius: 11,
                    backgroundColor: t.accentSoft,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={b.icon} size={17} color={t.accent} strokeWidth={1.8} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text allowFontScaling={false} style={{ fontSize: 14, color: t.fg, fontWeight: '600', marginBottom: 2 }}>
                      {b.title}
                    </Text>
                    <Text allowFontScaling={false} style={{ fontSize: 12, color: t.muted, lineHeight: 17 }}>
                      {b.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Price */}
            <View style={{
              backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
              borderRadius: 16, padding: 16, marginBottom: 16, alignItems: 'center',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                <Text allowFontScaling={false} style={{ fontSize: 38, color: t.accent, fontWeight: '700', lineHeight: 42 }}>
                  2,99€
                </Text>
                <Text allowFontScaling={false} style={{ fontSize: 14, color: t.muted, marginBottom: 6 }}>
                  /mes
                </Text>
              </View>
              <Text allowFontScaling={false} style={{ fontSize: 11, color: t.muted, marginTop: 4, fontFamily: MONO, letterSpacing: 0.5 }}>
                CANCELA EN CUALQUIER MOMENTO
              </Text>
            </View>

            {/* Subscribe button */}
            <TouchableOpacity
              onPress={handleSubscribe}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                backgroundColor: t.accent, borderRadius: 999,
                height: 52, alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                    Activar Premium
                  </Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={{
                borderRadius: 999, height: 46,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text allowFontScaling={false} style={{ color: t.muted, fontSize: 14 }}>
                Continuar sin premium
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
