import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import Svg, { Path } from 'react-native-svg';
import { useTheme, Eyebrow, Icon } from '../components/ui';
import { supabase } from '../lib/supabase';
import { MONO } from '../constants/fonts';

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URI = makeRedirectUri({ scheme: 'coachfood', path: 'auth/callback' });

export default function AuthScreen() {
  const t = useTheme();
  const [mode, setMode]               = useState('login');
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  const clear = () => { setError(''); setSuccess(''); };

  const handleEmailAuth = async () => {
    clear();
    if (!email.trim() || !password.trim()) return setError('Rellena todos los campos.');
    if (mode === 'register' && !name.trim()) return setError('Escribe tu nombre.');
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');

    setLoading(true);
    try {
      if (mode === 'register') {
        const { error: e } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (e) throw e;
        setSuccess('¡Cuenta creada! Si recibes un correo de confirmación, ábrelo antes de entrar.');
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (e) throw e;
      }
    } catch (e) {
      setError(mapError(e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    clear();
    setGoogleLoading(true);
    try {
      const { data, error: e } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: REDIRECT_URI, skipBrowserRedirect: true },
      });
      if (e || !data?.url) throw e || new Error('Sin URL de OAuth');

      const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);

      if (result.type === 'success') {
        const fragment = result.url.split('#')[1] || result.url.split('?')[1] || '';
        const params = new URLSearchParams(fragment);
        const access_token  = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
      }
    } catch {
      setError('No se pudo conectar con Google. Inténtalo de nuevo.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) return setError('Escribe tu correo para recuperar la contraseña.');
    clear();
    const { error: e } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: REDIRECT_URI,
    });
    if (e) setError(mapError(e.message));
    else setSuccess('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 22,
              backgroundColor: t.accent,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Icon name="leaf" size={36} color="#fff" strokeWidth={1.5} />
            </View>
            <Text allowFontScaling={false} style={{ fontSize: 28, color: t.fg, fontWeight: '600', letterSpacing: -0.5 }}>
              CoachFood
            </Text>
            <Text allowFontScaling={false} style={{ fontSize: 13, color: t.muted, marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
              Tu coach de nutrición con inteligencia artificial
            </Text>
          </View>

          {/* Tab selector */}
          <View style={{
            flexDirection: 'row', backgroundColor: t.surface2,
            borderRadius: 14, padding: 4, marginBottom: 24,
          }}>
            {[['login', 'Entrar'], ['register', 'Registrarse']].map(([m, label]) => (
              <TouchableOpacity
                key={m}
                onPress={() => { setMode(m); clear(); }}
                style={{
                  flex: 1, height: 40, borderRadius: 10,
                  backgroundColor: mode === m ? t.surface : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text allowFontScaling={false} style={{
                  fontSize: 14, fontWeight: '600',
                  color: mode === m ? t.fg : t.muted,
                }}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form fields */}
          <View style={{ gap: 12 }}>
            {mode === 'register' && (
              <Field t={t} label="Nombre" value={name} onChangeText={setName}
                placeholder="¿Cómo te llamas?" autoCapitalize="words" />
            )}
            <Field t={t} label="Correo electrónico" value={email} onChangeText={setEmail}
              placeholder="tu@correo.com" keyboardType="email-address" autoCapitalize="none" />
            <Field t={t} label="Contraseña" value={password} onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres" secureTextEntry />
          </View>

          {/* Messages */}
          {!!error && (
            <View style={{
              marginTop: 14, padding: 12, borderRadius: 12,
              backgroundColor: t.warnSoft, borderWidth: 1, borderColor: t.warn + '55',
            }}>
              <Text allowFontScaling={false} style={{ fontSize: 13, color: t.warn, lineHeight: 18 }}>
                {error}
              </Text>
            </View>
          )}
          {!!success && (
            <View style={{
              marginTop: 14, padding: 12, borderRadius: 12,
              backgroundColor: t.accentSoft, borderWidth: 1, borderColor: t.accent + '55',
            }}>
              <Text allowFontScaling={false} style={{ fontSize: 13, color: t.accentInk, lineHeight: 18 }}>
                {success}
              </Text>
            </View>
          )}

          {/* Primary button */}
          <TouchableOpacity
            onPress={handleEmailAuth}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              marginTop: 20, height: 52, backgroundColor: t.accent,
              borderRadius: 999, alignItems: 'center', justifyContent: 'center',
            }}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                  {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
                </Text>
            }
          </TouchableOpacity>

          {/* Forgot password */}
          {mode === 'login' && (
            <TouchableOpacity onPress={handleForgotPassword} style={{ alignItems: 'center', marginTop: 14 }}>
              <Text allowFontScaling={false} style={{ fontSize: 13, color: t.muted }}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 10 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: t.border }} />
            <Text allowFontScaling={false} style={{
              fontFamily: MONO, fontSize: 10, color: t.muted,
              letterSpacing: 1, textTransform: 'uppercase',
            }}>
              o continúa con
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: t.border }} />
          </View>

          {/* Google button */}
          <TouchableOpacity
            onPress={handleGoogle}
            disabled={googleLoading}
            activeOpacity={0.85}
            style={{
              height: 52, borderRadius: 999,
              borderWidth: 1, borderColor: t.border2,
              backgroundColor: t.surface,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {googleLoading
              ? <ActivityIndicator color={t.fg} />
              : <>
                  <GoogleG size={20} />
                  <Text allowFontScaling={false} style={{ fontSize: 15, fontWeight: '600', color: t.fg }}>
                    Continuar con Google
                  </Text>
                </>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ t, label, value, onChangeText, placeholder, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: focused ? t.accent : t.border,
      borderRadius: 16,
      padding: 14,
    }}>
      <Eyebrow>{label}</Eyebrow>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.muted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        allowFontScaling={false}
        style={{ marginTop: 4, fontSize: 16, color: t.fg, paddingVertical: 0 }}
        {...props}
      />
    </View>
  );
}

function GoogleG({ size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

function mapError(msg = '') {
  const map = {
    'Invalid login credentials':                          'Correo o contraseña incorrectos.',
    'Email not confirmed':                                'Confirma tu correo antes de entrar.',
    'User already registered':                            'Este correo ya tiene una cuenta. Inicia sesión.',
    'Password should be at least 6 characters':          'La contraseña debe tener al menos 6 caracteres.',
    'Unable to validate email address: invalid format':  'El formato del correo no es válido.',
  };
  return map[msg] ?? (msg || 'Ha ocurrido un error. Inténtalo de nuevo.');
}
