import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, TopBar, IconButton, Icon } from '../components/ui';

export default function ComingSoonScreen({ navigation, route }) {
  const t = useTheme();
  const feature = route.params?.feature || 'Esta funcionalidad';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <TopBar
        left={<IconButton icon="chevronL" onPress={() => navigation.goBack()} />}
        sub="Próximamente"
        title={feature}
      />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
        <View style={{
          width: 96, height: 96, borderRadius: 999,
          backgroundColor: t.accentSoft, borderWidth: 1, borderColor: t.accent + '44',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="sparkle" size={40} color={t.accent} strokeWidth={1.5} />
        </View>
        <Text style={{ fontSize: 22, color: t.fg, fontWeight: '600', textAlign: 'center' }}>
          ¡Próximamente!
        </Text>
        <Text style={{ fontSize: 14, color: t.muted, textAlign: 'center', lineHeight: 22 }}>
          Estamos trabajando en {feature.toLowerCase()}. Pronto estará disponible.
        </Text>
      </View>
    </SafeAreaView>
  );
}
