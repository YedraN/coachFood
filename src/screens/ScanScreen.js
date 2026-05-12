import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  useTheme, TopBar, IconButton, PrimaryButton, GhostButton,
  Eyebrow, H2, Icon,
} from '../components/ui';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

const CAT_FROM_TAGS = (tags = []) => {
  const s = tags.join(' ').toLowerCase();
  if (/meat|fish|seafood|egg|poultry|chicken|beef|pork|tuna|salmon/.test(s)) return 'protein';
  if (/dairy|milk|cheese|yogurt|butter|cream/.test(s))                        return 'dairy';
  if (/vegetable|veggie|broccoli|spinach|tomato|carrot|pepper/.test(s))       return 'veg';
  if (/cereal|grain|bread|pasta|rice|oat|flour|wheat/.test(s))               return 'grain';
  if (/fruit|apple|banana|orange|berry|grape/.test(s))                        return 'fruit';
  return 'pantry';
};

const CAT_EMOJI = { protein: '🥩', dairy: '🥛', veg: '🥦', grain: '🌾', fruit: '🍎', pantry: '🥫' };

async function fetchProduct(barcode) {
  try {
    const res  = await fetch(`https://world.openfoodfacts.org/api/v3/product/${barcode}.json`);
    const data = await res.json();
    if (data.status !== 'success' && data.status !== 1) return null;
    const p    = data.product;
    const name = p.product_name_es || p.product_name || '';
    if (!name) return null;
    const cat = CAT_FROM_TAGS(p.categories_tags || []);
    return {
      barcode,
      name,
      brand:        p.brands || '',
      packageQty:   p.quantity || '',
      cat,
      emoji:        CAT_EMOJI[cat],
      kcalPer100:   Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
      proteinPer100: +(p.nutriments?.proteins_100g        || 0).toFixed(1),
      carbsPer100:   +(p.nutriments?.carbohydrates_100g   || 0).toFixed(1),
      fatPer100:     +(p.nutriments?.fat_100g             || 0).toFixed(1),
    };
  } catch {
    return null;
  }
}

export default function ScanScreen({ navigation }) {
  const t = useTheme();
  const { addToPantry } = useApp();
  const [phase, setPhase]     = useState('idle');
  const [product, setProduct] = useState(null);
  const [grams, setGrams]     = useState(100);
  const [torch, setTorch]     = useState(false);
  const scannedRef            = useRef(false);

  const [permission, requestPermission] = useCameraPermissions();

  const startScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    scannedRef.current = false;
    setPhase('scanning');
  };

  const handleBarcodeScanned = async ({ data: barcode }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setPhase('loading');
    const prod = await fetchProduct(barcode);
    if (prod) {
      setProduct(prod);
      setGrams(100);
      setPhase('found');
    } else {
      setPhase('notfound');
    }
  };

  const handleAdd = () => {
    const ratio = grams / 100;
    addToPantry({
      id:      Date.now().toString(),
      barcode: product.barcode,
      name:    product.name,
      brand:   product.brand,
      qty:     `${grams} g`,
      cat:     product.cat,
      emoji:   product.emoji,
      kcal:    Math.round(product.kcalPer100 * ratio),
      protein: +(product.proteinPer100 * ratio).toFixed(1),
      carbs:   +(product.carbsPer100   * ratio).toFixed(1),
      fat:     +(product.fatPer100     * ratio).toFixed(1),
      addedAt: new Date().toISOString(),
    });
    navigation.navigate('Pantry');
  };

  const reset = () => {
    scannedRef.current = false;
    setProduct(null);
    setTorch(false);
    setPhase('idle');
  };

  const retry = () => {
    scannedRef.current = false;
    setPhase('scanning');
  };

  const rightAction = phase === 'idle'
    ? <IconButton icon="settings" />
    : <IconButton icon="x" onPress={reset} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        left={<IconButton icon="chevronL" onPress={() => navigation.goBack()} />}
        sub="Escanear"
        title="Código de barras"
        right={rightAction}
      />

      {phase === 'idle'     && <ScanIdle     t={t} onStart={startScan} hasPermission={permission?.granted} />}
      {phase === 'scanning' && <ScanCamera   t={t} torch={torch} setTorch={setTorch} onScanned={handleBarcodeScanned} />}
      {phase === 'loading'  && <ScanLoading  t={t} />}
      {phase === 'found'    && <ScanFound    t={t} product={product} grams={grams} setGrams={setGrams} onAdd={handleAdd} onRetry={retry} />}
      {phase === 'notfound' && <ScanNotFound t={t} onRetry={retry} onReset={reset} />}
    </SafeAreaView>
  );
}

function ScanIdle({ t, onStart, hasPermission }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
      <View style={{
        backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
        borderRadius: 22, padding: 22,
      }}>
        <Eyebrow>Cómo funciona</Eyebrow>
        <H2 style={{ marginTop: 8 }}>
          Escanea un producto y añádelo a tu{' '}
          <Text style={{ color: t.accent, fontStyle: 'italic' }}>despensa</Text>.
        </H2>
        <Text style={{ color: t.muted, fontSize: 13, lineHeight: 20, marginTop: 12 }}>
          Usamos Open Food Facts para obtener el nombre, calorías y macros de cualquier producto por su código de barras.
        </Text>
      </View>

      <View style={{ marginTop: 14, gap: 10 }}>
        {[
          { n: '01', t: 'Apunta la cámara al código de barras del producto.' },
          { n: '02', t: 'Obtenemos calorías, proteínas, hidratos y grasas.' },
          { n: '03', t: 'Elige la cantidad y añádelo a tu despensa.' },
        ].map(s => (
          <View key={s.n} style={{
            flexDirection: 'row', gap: 12, padding: 12,
            backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 14,
          }}>
            <Text style={{ fontFamily: MONO, fontSize: 11, color: t.accent }}>{s.n}</Text>
            <Text style={{ flex: 1, fontSize: 13, color: t.fg, lineHeight: 20 }}>{s.t}</Text>
          </View>
        ))}
      </View>

      {hasPermission === false && (
        <View style={{
          marginTop: 14, padding: 14, borderRadius: 14,
          backgroundColor: t.warnSoft, borderWidth: 1, borderColor: t.warn + '66',
        }}>
          <Text style={{ fontSize: 12, color: t.warn, lineHeight: 18 }}>
            Necesitas dar permiso de cámara para escanear. Actívalo en Ajustes del dispositivo.
          </Text>
        </View>
      )}

      <View style={{ marginTop: 22 }}>
        <PrimaryButton onPress={onStart} icon="scan">Escanear código de barras</PrimaryButton>
      </View>
    </ScrollView>
  );
}

function ScanCamera({ t, torch, setTorch, onScanned }) {
  const { width } = useWindowDimensions();
  const scanW = Math.round(width * 0.72);
  const scanH = Math.round(scanW * 0.56);
  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={onScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
      >
        {/* Overlay oscuro con ventana central */}
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' }}>
          {/* Ventana transparente */}
          <View style={{ width: scanW, height: scanH, position: 'relative' }}>
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent' }} />

            {/* Esquinas */}
            {[
              { top: 0, left: 0,  borderTopWidth: 3, borderLeftWidth: 3,  borderTopLeftRadius: 10 },
              { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
              { bottom: 0, left: 0,  borderBottomWidth: 3, borderLeftWidth: 3,  borderBottomLeftRadius: 10 },
              { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },
            ].map((style, i) => (
              <View key={i} style={{
                position: 'absolute', width: 28, height: 28, borderColor: t.accent, ...style,
              }} />
            ))}
          </View>

          <Text style={{
            color: '#fff', fontSize: 12, marginTop: 24, opacity: 0.85,
            fontFamily: MONO, letterSpacing: 0.5, textAlign: 'center',
          }}>
            APUNTA AL CÓDIGO DE BARRAS
          </Text>

          {/* Botón linterna */}
          <TouchableOpacity
            onPress={() => setTorch(v => !v)}
            style={{
              marginTop: 40, width: 56, height: 56, borderRadius: 999,
              backgroundColor: torch ? t.accent : 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="flash" size={22} color="#fff" strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

function ScanLoading({ t }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <ActivityIndicator size="large" color={t.accent} />
      <Text style={{ fontSize: 14, color: t.muted }}>Buscando producto…</Text>
    </View>
  );
}

function ScanFound({ t, product, grams, setGrams, onAdd, onRetry }) {
  const ratio    = grams / 100;
  const kcal     = Math.round(product.kcalPer100 * ratio);
  const protein  = (product.proteinPer100 * ratio).toFixed(1);
  const carbs    = (product.carbsPer100   * ratio).toFixed(1);
  const fat      = (product.fatPer100     * ratio).toFixed(1);

  return (
    <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
      {/* Product header */}
      <View style={{
        backgroundColor: t.accentSoft, borderWidth: 1, borderColor: t.accent + '44',
        borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
      }}>
        <View style={{
          width: 52, height: 52, borderRadius: 14, backgroundColor: t.accent,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 26 }}>{product.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, color: t.fg, fontWeight: '600', lineHeight: 22 }} numberOfLines={2}>
            {product.name}
          </Text>
          {product.brand ? (
            <Text style={{ fontSize: 12, color: t.muted, marginTop: 3 }}>{product.brand}</Text>
          ) : null}
          {product.packageQty ? (
            <Text style={{ fontSize: 11, color: t.muted, fontFamily: MONO, marginTop: 2 }}>
              {product.packageQty}
            </Text>
          ) : null}
        </View>
        <Icon name="check" size={22} color={t.accent} strokeWidth={2.2} />
      </View>

      {/* Quantity selector */}
      <View style={{
        marginTop: 16, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
        borderRadius: 16, padding: 16,
      }}>
        <Eyebrow>Cantidad</Eyebrow>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <TouchableOpacity
            onPress={() => setGrams(g => Math.max(10, g - 50))}
            style={{
              width: 40, height: 40, borderRadius: 999,
              borderWidth: 1, borderColor: t.border2, backgroundColor: t.bg,
              alignItems: 'center', justifyContent: 'center',
            }}>
            <Text style={{ color: t.fg, fontSize: 20, lineHeight: 24 }}>−</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 32, color: t.fg }}>
              {grams}<Text style={{ fontSize: 16, color: t.muted }}> g</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setGrams(g => Math.min(2000, g + 50))}
            style={{
              width: 40, height: 40, borderRadius: 999,
              backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center',
            }}>
            <Text style={{ color: '#fff', fontSize: 20, lineHeight: 24 }}>+</Text>
          </TouchableOpacity>
        </View>
        {/* Quick presets */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'center' }}>
          {[50, 100, 150, 200, 300].map(g => (
            <TouchableOpacity key={g} onPress={() => setGrams(g)} style={{
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
              backgroundColor: grams === g ? t.fg : t.chipBg,
            }}>
              <Text style={{ fontSize: 12, color: grams === g ? t.bg : t.muted, fontFamily: MONO }}>
                {g}g
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Macros for selected quantity */}
      <View style={{
        marginTop: 12, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
        borderRadius: 16, padding: 16,
      }}>
        <Eyebrow>Macros para {grams} g</Eyebrow>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <MacroCol t={t} label="Kcal"     value={kcal}    color={t.accent} />
          <MacroCol t={t} label="Proteína" value={`${protein}g`} color="#c98a3a" />
          <MacroCol t={t} label="HC"       value={`${carbs}g`}   color={t.muted} />
          <MacroCol t={t} label="Grasa"    value={`${fat}g`}     color={t.muted} />
        </View>
        <Text style={{ fontSize: 10, color: t.muted, marginTop: 10, fontFamily: MONO, textAlign: 'center' }}>
          Por 100 g: {product.kcalPer100} kcal · {product.proteinPer100}g prot · {product.carbsPer100}g HC · {product.fatPer100}g grasa
        </Text>
      </View>

      <View style={{ marginTop: 20, gap: 10 }}>
        <PrimaryButton onPress={onAdd} icon="plus">Añadir a despensa</PrimaryButton>
        <GhostButton full onPress={onRetry} icon="scan">Escanear otro</GhostButton>
      </View>
    </ScrollView>
  );
}

function MacroCol({ t, label, value, color }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 22, color: color ?? t.fg, fontWeight: '600' }}>{value}</Text>
      <Text style={{ fontSize: 10, color: t.muted, marginTop: 3, fontFamily: MONO, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}

function ScanNotFound({ t, onRetry, onReset }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
      <View style={{
        width: 80, height: 80, borderRadius: 999,
        backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="x" size={32} color={t.muted} strokeWidth={1.5} />
      </View>
      <H2 style={{ textAlign: 'center' }}>Producto no encontrado</H2>
      <Text style={{ fontSize: 13, color: t.muted, textAlign: 'center', lineHeight: 20 }}>
        No encontramos este código en Open Food Facts. Puedes intentarlo de nuevo o añadir el producto manualmente.
      </Text>
      <View style={{ width: '100%', gap: 10, marginTop: 8 }}>
        <PrimaryButton onPress={onRetry} icon="scan">Intentar de nuevo</PrimaryButton>
        <GhostButton full onPress={onReset}>Cancelar</GhostButton>
      </View>
    </View>
  );
}

