import React from 'react';
import { View, Text, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect, Polyline } from 'react-native-svg';
import { MONO } from '../constants/fonts';

// ─── Theme context ────────────────────────────────────────────
export const ThemeCtx = React.createContext(null);
export const useTheme = () => React.useContext(ThemeCtx);

// ─── Shadow helper (cross-platform) ──────────────────────────
export const SHADOW = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,  elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,  elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 10 },
};

// ─── Tab-bar-aware bottom padding ────────────────────────────
export function useTabSafeBottom() {
  const insets = useSafeAreaInsets();
  return 100 + Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);
}

// ─── Food placeholder (gradient card) ────────────────────────
export function FoodPlaceholder({ hue = 30, height = 200, style }) {
  const hue2 = (hue + 15) % 360;
  return (
    <LinearGradient
      colors={[`hsl(${hue}, 22%, 86%)`, `hsl(${hue2}, 26%, 78%)`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ height, overflow: 'hidden' }, style]}
    />
  );
}

// ─── Eyebrow label ────────────────────────────────────────────
export function Eyebrow({ children, color }) {
  const t = useTheme();
  return (
    <Text allowFontScaling={false} style={{
      fontFamily: MONO,
      fontSize: 10, letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: color || t.muted, fontWeight: '500',
    }}>{children}</Text>
  );
}

// ─── Typography ───────────────────────────────────────────────
export function H1({ children, style }) {
  const t = useTheme();
  return (
    <Text allowFontScaling={false} style={[{ fontSize: 34, lineHeight: 40, color: t.fg, fontWeight: '400' }, style]}>
      {children}
    </Text>
  );
}

export function H2({ children, style }) {
  const t = useTheme();
  return (
    <Text allowFontScaling={false} style={[{ fontSize: 24, lineHeight: 30, color: t.fg, fontWeight: '400' }, style]}>
      {children}
    </Text>
  );
}

export function H3({ children, style }) {
  const t = useTheme();
  return (
    <Text allowFontScaling={false} style={[{ fontSize: 18, lineHeight: 24, color: t.fg, fontWeight: '600' }, style]}>
      {children}
    </Text>
  );
}

// ─── Card surface ─────────────────────────────────────────────
export function Card({ children, style, onPress, padded = true }) {
  const t = useTheme();
  const baseStyle = {
    backgroundColor: t.surface,
    borderWidth: 1, borderColor: t.border,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOW.md,
  };

  if (onPress) {
    return (
      <View style={[baseStyle, style]}>
        <Pressable
          onPress={onPress}
          android_ripple={{ color: t.border }}
          style={({ pressed }) => ({
            padding: padded ? 20 : 0,
            opacity: Platform.OS === 'ios' && pressed ? 0.8 : 1,
          })}>
          {children}
        </Pressable>
      </View>
    );
  }
  return (
    <View style={[{ ...baseStyle, padding: padded ? 20 : 0 }, style]}>
      {children}
    </View>
  );
}

// ─── Buttons ──────────────────────────────────────────────────
export function PrimaryButton({ children, onPress, icon, style, disabled }) {
  const t = useTheme();
  return (
    <View style={[{ borderRadius: 999, overflow: 'hidden', ...SHADOW.sm }, style]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
        style={({ pressed }) => ({
          height: 54,
          backgroundColor: disabled ? t.muted : t.accent,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: Platform.OS === 'ios' && pressed ? 0.85 : 1,
        })}>
        {icon && <Icon name={icon} size={18} color="#fffdf7" strokeWidth={2} />}
        <Text allowFontScaling={false} style={{ color: '#fffdf7', fontSize: 15, fontWeight: '600', letterSpacing: -0.1 }}>
          {children}
        </Text>
      </Pressable>
    </View>
  );
}

export function GhostButton({ children, onPress, icon, full = false, style }) {
  const t = useTheme();
  return (
    <View style={[{
      borderRadius: 999, overflow: 'hidden',
      borderWidth: 1, borderColor: t.border2,
    }, full ? { width: '100%' } : undefined, style]}>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: t.border }}
        style={({ pressed }) => ({
          height: 48,
          paddingHorizontal: 20,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: Platform.OS === 'ios' && pressed ? 0.8 : 1,
        })}>
        {icon && <Icon name={icon} size={16} color={t.fg} />}
        <Text allowFontScaling={false} style={{ color: t.fg, fontSize: 14, fontWeight: '500' }}>{children}</Text>
      </Pressable>
    </View>
  );
}

// ─── Chip ─────────────────────────────────────────────────────
export function Chip({ children, active, onPress }) {
  const t = useTheme();
  return (
    <View style={{ borderRadius: 999, overflow: 'hidden' }}>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: active ? 'rgba(255,255,255,0.25)' : t.border }}
        style={({ pressed }) => ({
          height: 36,
          paddingHorizontal: 18,
          borderRadius: 999,
          backgroundColor: active ? t.fg : t.chipBg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: Platform.OS === 'ios' && pressed ? 0.75 : 1,
        })}>
        <Text allowFontScaling={false} style={{ color: active ? t.surface : t.fg, fontSize: 13, fontWeight: '500', letterSpacing: -0.1 }}>
          {children}
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Progress ring ────────────────────────────────────────────
export function Ring({ value = 0, max = 100, size = 90, strokeWidth = 7, color, label, sub }) {
  const t = useTheme();
  const c = color || t.accent;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={cx} cy={cy} r={r} stroke={t.border} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={cx} cy={cy} r={r}
          stroke={c} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text allowFontScaling={false} style={{ fontSize: size * 0.22, color: t.fg, fontWeight: '400' }}>{label}</Text>
        {sub && <Text allowFontScaling={false} style={{ fontFamily: MONO, fontSize: 9, color: t.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>{sub}</Text>}
      </View>
    </View>
  );
}

// ─── Macro bar ────────────────────────────────────────────────
export function MacroBar({ p, c, f, compact }) {
  const t = useTheme();
  const total = (p * 4 + c * 4 + f * 9) || 1;
  const macros = [
    { key: 'P', val: p, kcal: p * 4, color: '#1F8A5B', label: 'Proteína' },
    { key: 'C', val: c, kcal: c * 4, color: '#c98a3a', label: 'Carbohid.' },
    { key: 'F', val: f, kcal: f * 9, color: '#8a5b3a', label: 'Grasa' },
  ];
  return (
    <View>
      <View style={{ height: compact ? 6 : 8, borderRadius: 999, overflow: 'hidden', flexDirection: 'row', backgroundColor: t.border }}>
        {macros.map(m => (
          <View key={m.key} style={{ width: `${(m.kcal / total) * 100}%`, backgroundColor: m.color }} />
        ))}
      </View>
      {!compact && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          {macros.map(m => (
            <View key={m.key}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: m.color }} />
                <Text allowFontScaling={false} style={{ fontFamily: MONO, fontSize: 10, color: t.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.label}</Text>
              </View>
              <Text allowFontScaling={false} style={{ fontSize: 18, color: t.fg, marginTop: 2 }}>
                {m.val}<Text allowFontScaling={false} style={{ fontSize: 11, color: t.muted }}>g</Text>
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Icon button ──────────────────────────────────────────────
export function IconButton({ icon, onPress, active, size = 40 }) {
  const t = useTheme();
  return (
    <View style={{
      width: size, height: size, borderRadius: 999, overflow: 'hidden',
      backgroundColor: active ? t.accent : t.surface,
      borderWidth: 1, borderColor: active ? t.accent : t.border,
    }}>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: active ? 'rgba(255,255,255,0.3)' : t.border, borderless: true }}
        style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color={active ? '#fff' : t.fg} />
      </Pressable>
    </View>
  );
}

// ─── Top bar ──────────────────────────────────────────────────
export function TopBar({ left, title, right, sub }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{
      paddingTop: insets.top + 16, paddingBottom: 16, paddingHorizontal: 22,
      flexDirection: 'row', alignItems: 'center', gap: 14,
      backgroundColor: t.bg,
    }}>
      <View style={{ width: 36, alignItems: 'flex-start' }}>{left}</View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        {sub && <Text allowFontScaling={false} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: t.muted }}>{sub}</Text>}
        {title && <Text allowFontScaling={false} style={{ fontSize: 20, color: t.fg, marginTop: sub ? 2 : 0 }}>{title}</Text>}
      </View>
      <View style={{ width: 36, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

// ─── Section header ───────────────────────────────────────────
export function SectionHeader({ title, action, onAction }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <H3>{title}</H3>
      {action && (
        <Pressable
          onPress={onAction}
          android_ripple={{ color: t.accentSoft, borderless: true }}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', gap: 4,
            opacity: Platform.OS === 'ios' && pressed ? 0.6 : 1,
          })}>
          <Text allowFontScaling={false} style={{ color: t.accent, fontSize: 13, fontWeight: '600' }}>{action}</Text>
          <Icon name="chevron" size={16} color={t.accent} />
        </Pressable>
      )}
    </View>
  );
}

// ─── Data point ───────────────────────────────────────────────
export function DataPoint({ label, value }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text allowFontScaling={false} style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: t.muted }}>{label}</Text>
      <Text allowFontScaling={false} style={{ fontSize: 18, color: t.fg, marginTop: 2 }}>{value}</Text>
    </View>
  );
}

export function Divider() {
  const t = useTheme();
  return <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: t.border }} />;
}

// ─── SVG icon set ─────────────────────────────────────────────
export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.6 }) {
  const props = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const icons = {
    home: (
      <>
        <Path {...props} d="M4 11.5L12 4l8 7.5" />
        <Path {...props} d="M6 10.5V20h12v-9.5" />
      </>
    ),
    book: (
      <>
        <Path {...props} d="M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3V4z" />
        <Path {...props} d="M5 17a3 3 0 013-3h10" />
      </>
    ),
    calendar: (
      <>
        <Rect {...props} x="4" y="5" width="16" height="15" rx="2" />
        <Path {...props} d="M4 9h16M9 3v4M15 3v4" />
      </>
    ),
    dumbbell: (
      <>
        <Path {...props} d="M3 12h2M19 12h2M7 8v8M17 8v8M7 12h10" />
        <Rect {...props} x="5" y="9" width="2" height="6" rx="0.5" />
        <Rect {...props} x="17" y="9" width="2" height="6" rx="0.5" />
      </>
    ),
    user: (
      <>
        <Circle {...props} cx="12" cy="8" r="4" />
        <Path {...props} d="M4 20c1.5-3.5 4.5-5.5 8-5.5s6.5 2 8 5.5" />
      </>
    ),
    scan: (
      <>
        <Path {...props} d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2" />
        <Path {...props} d="M4 12h16" />
      </>
    ),
    plus: <Path {...props} d="M12 5v14M5 12h14" />,
    chevron: <Path {...props} d="M9 6l6 6-6 6" />,
    chevronL: <Path {...props} d="M15 6l-6 6 6 6" />,
    flame: <Path {...props} d="M12 3c0 4-5 5-5 10a5 5 0 0010 0c0-3-2-4-3-6 0 2-1 3-2 3-1 0 0-3 0-7z" />,
    leaf: <Path {...props} d="M5 19c0-9 6-14 15-14 0 9-6 14-15 14zM5 19c5-3 8-6 11-11" />,
    play: <Path {...props} d="M7 5l12 7-12 7V5z" />,
    timer: (
      <>
        <Circle {...props} cx="12" cy="13" r="7" />
        <Path {...props} d="M12 9v4M9 3h6" />
      </>
    ),
    settings: (
      <>
        <Circle {...props} cx="12" cy="12" r="3" />
        <Path {...props} d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
      </>
    ),
    bell: (
      <>
        <Path {...props} d="M6 16V11a6 6 0 0112 0v5l1.5 2H4.5L6 16z" />
        <Path {...props} d="M10 20a2 2 0 004 0" />
      </>
    ),
    check: <Path {...props} d="M5 12l4 4 10-10" />,
    sparkle: <Path {...props} d="M12 4l1.7 4.6L18 10l-4.3 1.4L12 16l-1.7-4.6L6 10l4.3-1.4L12 4z" />,
    apple: (
      <>
        <Path {...props} d="M12 7c2-3 6-3 7 0 1 4-2 13-7 13s-8-9-7-13c1-3 5-3 7 0z" />
        <Path {...props} d="M12 7V4" />
      </>
    ),
    cart: (
      <>
        <Path {...props} d="M3 4h2l3 12h11l2-8H6" />
        <Circle {...props} cx="9" cy="20" r="1.2" />
        <Circle {...props} cx="17" cy="20" r="1.2" />
      </>
    ),
    flash: <Path {...props} d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" />,
    arrow: <Path {...props} d="M5 12h14M13 6l6 6-6 6" />,
    clock: (
      <>
        <Circle {...props} cx="12" cy="12" r="8" />
        <Path {...props} d="M12 8v4l3 2" />
      </>
    ),
    walk: (
      <>
        <Circle {...props} cx="13" cy="4" r="1.6" />
        <Path {...props} d="M9 21l3-7-3-3 4-3 3 4 3 1M7 13l2-4" />
      </>
    ),
    x: <Path {...props} d="M6 6l12 12M18 6L6 18" />,
    weight: (
      <>
        <Rect {...props} x="3" y="6" width="18" height="14" rx="3" />
        <Path {...props} d="M7 6V4h10v2M9 13h6" />
      </>
    ),
    drop: <Path {...props} d="M12 3c-3.5 5-6 8-6 11a6 6 0 0012 0c0-3-2.5-6-6-11z" />,
    moon: <Path {...props} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
    sun: (
      <>
        <Circle {...props} cx="12" cy="12" r="4" />
        <Path {...props} d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </>
    ),
    'log-out': (
      <>
        <Path {...props} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <Polyline {...props} points="16 17 21 12 16 7" />
        <Path {...props} d="M21 12H9" />
      </>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {icons[name] || null}
    </Svg>
  );
}
