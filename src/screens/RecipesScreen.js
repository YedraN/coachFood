import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useTheme, useTabSafeBottom, Eyebrow, H1, H2, Card, Chip, FoodPlaceholder,
  DataPoint, Divider, Icon, PrimaryButton, SHADOW,
} from '../components/ui';
import PaywallModal from '../components/PaywallModal';
import { useApp } from '../context/AppContext';
import { MONO } from '../constants/fonts';

const TAGS = ['Todas', 'Desayuno', 'Comida', 'Cena'];

export default function RecipesScreen({ navigation }) {
  const t = useTheme();
  const tabBottom = useTabSafeBottom();
  const { pantry, aiRecipes, generateAiRecipes, deleteAiRecipes, user, session, refreshUser, aiGenerationsThisMonth, AI_FREE_LIMIT } = useApp();
  const [filter, setFilter] = useState('Todas');
  const [generating, setGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleGenerateAI = async () => {
    if (pantry.length === 0) {
      Alert.alert(
        'Despensa vacía',
        'Escanea algunos productos primero para que podamos generar recetas personalizadas.',
        [
          { text: 'Escanear ahora', onPress: () => navigation.navigate('Scan') },
          { text: 'Cancelar', style: 'cancel' },
        ],
      );
      return;
    }

    const usedThisMonth = aiGenerationsThisMonth();
    if (!user?.isPremium && usedThisMonth >= AI_FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    setGenerating(true);
    try {
      await generateAiRecipes();
      Alert.alert('¡Recetas generadas!', 'Se han creado nuevas recetas con IA basadas en tu despensa.');
    } catch (error) {
      if (error.message === 'LIMIT_REACHED') {
        setShowPaywall(true);
      } else {
        Alert.alert('Error', `No pudimos generar recetas: ${error.message}`);
      }
    } finally {
      setGenerating(false);
    }
  };

  const allRecipes = aiRecipes;
  const list = filter === 'Todas' ? allRecipes : allRecipes.filter(r => r.tag === filter);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        userId={session?.user?.id}
        aiGenerationsThisMonth={aiGenerationsThisMonth()}
        onRefreshUser={refreshUser}
        theme={t}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: tabBottom }}>
        <View style={{ padding: 22, paddingTop: 16 }}>
          <Eyebrow>Generadas con tu última compra</Eyebrow>
          <H1 style={{ marginTop: 10 }}>
            Tus <Text style={{ color: t.accent, fontStyle: 'italic' }}>recetas</Text>
          </H1>
          <Text style={{ color: t.muted, fontSize: 14, lineHeight: 22, marginTop: 10 }}>
            {aiRecipes.length} recetas personalizadas según tu despensa.
          </Text>
        </View>

        {/* Generar con IA button */}
        {pantry.length > 0 && (
          <View style={{ paddingHorizontal: 22, marginBottom: 16 }}>
            <View style={{ borderRadius: 18, overflow: 'hidden' }}>
              <Pressable
                onPress={handleGenerateAI}
                disabled={generating}
                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                style={({ pressed }) => ({
                  backgroundColor: t.accent,
                  borderRadius: 18,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  opacity: Platform.OS === 'ios' && pressed ? 0.85 : 1,
                })}>
                {generating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Icon name="sparkle" size={20} color="#fff" strokeWidth={2} />
                )}
                <Text allowFontScaling={false} style={{ flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' }}>
                  {generating ? 'Generando recetas...' : 'Generar con IA'}
                </Text>
                {!generating && <Icon name="chevron" size={16} color="#fff" />}
              </Pressable>
            </View>
          </View>
        )}

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 14, gap: 8 }}>
          {TAGS.map(tag => (
            <Chip key={tag} active={filter === tag} onPress={() => setFilter(tag)}>{tag}</Chip>
          ))}
        </ScrollView>

        {/* Featured (first recipe when 'Todas') */}
        {filter === 'Todas' && list.length > 0 && (
          <View style={{ paddingHorizontal: 22, marginBottom: 14 }}>
            <FeaturedRecipe t={t} recipe={list[0]} onPress={() => navigation.navigate('RecipeDetail', { id: list[0].id })} />
          </View>
        )}

        {/* AI Recipes info */}
        {aiRecipes.length > 0 && (
          <View style={{ paddingHorizontal: 22, marginBottom: 12 }}>
            <View style={{
              backgroundColor: t.accentSoft,
              borderWidth: 1, borderColor: t.accent + '44',
              borderRadius: 12, padding: 12,
              flexDirection: 'row', alignItems: 'center', gap: 10,
            }}>
              <Icon name="sparkle" size={16} color={t.accent} />
              <Text style={{ flex: 1, fontSize: 12, color: t.accentInk }}>
                {aiRecipes.length} recetas personalizadas según tu despensa
              </Text>
              {aiRecipes.length > 0 && (
                <TouchableOpacity onPress={deleteAiRecipes} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Icon name="x" size={14} color={t.accent} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Recipe list */}
        <View style={{ paddingHorizontal: 22, gap: 12 }}>
          {(filter === 'Todas' ? list.slice(aiRecipes.length > 0 ? 0 : 1) : list).map(r => (
            <RecipeRow
              key={r.id}
              t={t}
              recipe={r}
              isAI={r.isAI}
              onPress={() => navigation.navigate('RecipeDetail', { id: r.id })} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeaturedRecipe({ t, recipe, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{
      backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
      borderRadius: 22, overflow: 'hidden',
    }}>
      <View>
        <FoodPlaceholder hue={recipe.img.hue} height={220} />
        <View style={{
          position: 'absolute', top: 16, left: 16,
          backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 999,
          paddingHorizontal: 14, paddingVertical: 6,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontFamily: MONO, letterSpacing: 1, textTransform: 'uppercase' }}>
            ★ Sugerencia del día
          </Text>
        </View>
      </View>
      <View style={{ padding: 20 }}>
        <Eyebrow>{recipe.subtitle}</Eyebrow>
        <H2 style={{ marginTop: 8 }}>{recipe.title}</H2>
        <Text style={{ color: t.muted, fontSize: 13, lineHeight: 22, marginTop: 10, marginBottom: 16 }}>{recipe.why}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <DataPoint label="Tiempo" value={`${recipe.time} min`} />
          <Divider />
          <DataPoint label="Calorías" value={`${recipe.kcal} kcal`} />
          <Divider />
          <DataPoint label="Coincide" value={`${recipe.match.uses}/${recipe.match.total}`} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RecipeRow({ t, recipe, onPress, isAI }) {
  return (
    <View style={{ borderRadius: 20, overflow: 'hidden', ...SHADOW.md }}>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: t.border }}
        style={({ pressed }) => ({ opacity: Platform.OS === 'ios' && pressed ? 0.8 : 1 })}>
        <Card padded={false} style={{ flexDirection: 'row', overflow: 'hidden', position: 'relative' }}>
          {isAI && (
            <View style={{
              position: 'absolute', top: 10, right: 10, zIndex: 10,
              backgroundColor: t.accent, paddingHorizontal: 10, paddingVertical: 5,
              borderRadius: 999,
            }}>
              <Text allowFontScaling={false} style={{ fontSize: 9, color: '#fff', fontFamily: MONO, fontWeight: '600' }}>
                ✨ IA
              </Text>
            </View>
          )}
          <FoodPlaceholder hue={recipe.img?.hue || 18} height={120} style={{ width: 120 }} />
          <View style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Eyebrow>{recipe.tag}</Eyebrow>
                <Text allowFontScaling={false} style={{ fontSize: 10, color: t.accent, fontFamily: MONO }}>
                  {recipe.match?.uses || 0}/{recipe.match?.total || 0} en casa
                </Text>
              </View>
              <Text allowFontScaling={false} style={{ fontSize: 18, color: t.fg, marginTop: 4, lineHeight: 22 }}>{recipe.title}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Text allowFontScaling={false} style={{ fontSize: 11, color: t.muted, fontFamily: MONO }}>{recipe.time}min</Text>
              <Text allowFontScaling={false} style={{ fontSize: 11, color: t.muted, fontFamily: MONO }}>· {recipe.kcal}kcal</Text>
              <Text allowFontScaling={false} style={{ fontSize: 11, color: t.muted, fontFamily: MONO }}>· {recipe.p}g prot</Text>
            </View>
          </View>
        </Card>
      </Pressable>
    </View>
  );
}
