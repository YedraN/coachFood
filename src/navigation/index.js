import React from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Platform } from 'react-native';
import { GlassView, isLiquidGlassAvailable, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, Icon, SHADOW } from '../components/ui';
import { useApp } from '../context/AppContext';

import AuthScreen             from '../screens/AuthScreen';
import OnboardingScreen       from '../screens/OnboardingScreen';
import WorkoutSurveyScreen    from '../screens/WorkoutSurveyScreen';
import HomeScreen             from '../screens/HomeScreen';
import ScanScreen             from '../screens/ScanScreen';
import PantryScreen           from '../screens/PantryScreen';
import RecipesScreen          from '../screens/RecipesScreen';
import RecipeDetailScreen     from '../screens/RecipeDetailScreen';
import PlanScreen             from '../screens/PlanScreen';
import WorkoutScreen          from '../screens/WorkoutScreen';
import ExerciseScreen         from '../screens/ExerciseScreen';
import ProfileScreen          from '../screens/ProfileScreen';
import PrsScreen              from '../screens/PrsScreen';
import ComingSoonScreen       from '../screens/ComingSoonScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_ITEMS = [
  { name: 'Home',    label: 'Hoy',     icon: 'home' },
  { name: 'Recipes', label: 'Recetas', icon: 'book' },
  { name: 'Plan',    label: 'Plan',    icon: 'calendar' },
  { name: 'Workout', label: 'Entreno', icon: 'dumbbell' },
  { name: 'Profile', label: 'Perfil',  icon: 'user' },
];

function TabBarInner({ state, navigation }) {
  const t      = useTheme();

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly',
      height: 72, paddingHorizontal: 8,
    }}>
      {TAB_ITEMS.map((tab, index) => {
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => { if (!isFocused) navigation.navigate(tab.name); }}
            activeOpacity={0.7}
            style={{
              flex: 1, height: 56, alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            <View style={{
              width: isFocused ? 48 : 38, height: isFocused ? 48 : 38, borderRadius: 999,
              backgroundColor: isFocused ? t.accent : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon
                name={tab.icon}
                size={isFocused ? 22 : 20}
                color={isFocused ? '#fff' : t.muted}
                strokeWidth={isFocused ? 2.2 : 1.6}
              />
            </View>
            {isFocused && (
              <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: t.accent }} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function CustomTabBar({ state, navigation }) {
  const t      = useTheme();
  const insets = useSafeAreaInsets();
  const tabHeight = 88;
  const hasLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  return (
    <View style={{
      height: tabHeight + insets.bottom,
      backgroundColor: 'transparent',
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      justifyContent: 'flex-end',
      paddingBottom: Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 16),
    }}>
      <View style={{
        marginHorizontal: 16, borderRadius: 36, overflow: 'hidden',
        ...SHADOW.lg,
      }}>
        {hasLiquidGlass ? (
          <GlassView
            glassEffectStyle="regular"
            colorScheme={t.isDark ? 'dark' : 'light'}
            style={{ borderRadius: 36, overflow: 'hidden' }}
          >
            <TabBarInner state={state} navigation={navigation} />
          </GlassView>
        ) : (
          <View style={{
            backgroundColor: t.surface + '99',
            borderRadius: 36,
            borderWidth: Platform.OS === 'android' ? 1 : 1,
            borderColor: t.border + '50',
          }}>
            <TabBarInner state={state} navigation={navigation} />
          </View>
        )}
      </View>
    </View>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Recipes" component={RecipesScreen} />
      <Tab.Screen name="Plan"    component={PlanScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { ready, session, onboardingDone, user } = useApp();
  const t = useTheme();

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !onboardingDone ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main"               component={HomeTabs} />
            <Stack.Screen name="Scan"               component={ScanScreen} />
            <Stack.Screen name="Pantry"             component={PantryScreen} />
            <Stack.Screen name="RecipeDetail"       component={RecipeDetailScreen} />
            <Stack.Screen name="Exercise"           component={ExerciseScreen} />
            <Stack.Screen name="WorkoutSurvey"      component={WorkoutSurveyScreen} />
            <Stack.Screen name="Prs"                component={PrsScreen} />
            <Stack.Screen name="ComingSoon"         component={ComingSoonScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
