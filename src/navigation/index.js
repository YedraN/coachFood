import React from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, Icon } from '../components/ui';
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

function CustomTabBar({ state, navigation }) {
  const t      = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: t.surface,
      borderTopWidth: 1,
      borderTopColor: t.border,
      paddingBottom: insets.bottom,
    }}>
      {TAB_ITEMS.map((tab, index) => {
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => { if (!isFocused) navigation.navigate(tab.name); }}
            activeOpacity={0.7}
            style={{ flex: 1, height: 60, alignItems: 'center', justifyContent: 'center', gap: 3 }}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={isFocused ? t.accent : t.muted}
              strokeWidth={isFocused ? 2 : 1.6}
            />
            <Text allowFontScaling={false} style={{
              fontSize: 10,
              fontWeight: isFocused ? '600' : '500',
              color: isFocused ? t.accent : t.muted,
              letterSpacing: 0.2,
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
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
