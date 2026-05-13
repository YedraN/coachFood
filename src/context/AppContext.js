import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateRecipes } from '../services/ai';

export function calcTargets({ weight, height, age, sex, activity, goal }) {
  const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }[activity] ?? 1.55;
  const bmr = sex === 'Hombre'
    ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    : 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  const tdee = Math.round(bmr * mult);
  const kcalTarget    = goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 300 : tdee;
  const proteinTarget = Math.round(weight * (goal === 'gain' ? 2.2 : goal === 'lose' ? 2.0 : 1.6));
  return { kcalTarget, proteinTarget };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const freshDaily = () => ({
  date: todayStr(),
  kcalToday: 0,
  proteinToday: 0,
  waterToday: 0,
  stepsToday: 0,
  mealsDone: [],
});

function mapProfile(p) {
  return {
    name:             p.name ?? '',
    goal:             p.goal ?? 'lose',
    sex:              p.sex ?? 'Mujer',
    age:              p.age ?? 25,
    weight:           parseFloat(p.weight) || 70,
    weightStart:      parseFloat(p.weight_start) || 70,
    weightTarget:     parseFloat(p.weight_target) || 65,
    height:           p.height ?? 170,
    activity:         p.activity ?? 'moderate',
    streak:           p.streak ?? 0,
    waterTarget:      p.water_target ?? 8,
    stepsTarget:      p.steps_target ?? 10000,
    isPremium:        p.is_premium ?? false,
    premiumExpiresAt: p.premium_expires_at ?? null,
    kcalTarget:       p.kcal_target ?? 1800,
    proteinTarget:    p.protein_target ?? 120,
  };
}

function mapPantryItem(it) {
  return {
    ...it,
    kcal:    it.kcal ?? 0,
    protein: parseFloat(it.protein) || 0,
    carbs:   parseFloat(it.carbs) || 0,
    fat:     parseFloat(it.fat) || 0,
  };
}

function mapRecipeFromDb(r) {
  return {
    id:          r.id,
    title:       r.title,
    subtitle:    r.subtitle ?? '',
    tag:         r.tag ?? 'Comida',
    why:         r.why ?? '',
    time:        r.time ?? 20,
    kcal:        r.kcal ?? 0,
    p:           parseFloat(r.protein) || 0,
    c:           parseFloat(r.carbs) || 0,
    f:           parseFloat(r.fat) || 0,
    ingredients: r.ingredients || [],
    steps:       r.steps || [],
    match:       r.match || { uses: 0, total: 0 },
    img:         r.img || { hue: 30 },
    isAI:        true,
    createdAt:   r.created_at ?? new Date().toISOString(),
  };
}

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [ready, setReady]               = useState(false);
  const [session, setSession]           = useState(null);
  const [onboardingDone, setOnboarding] = useState(false);
  const [user, setUser]                 = useState(null);
  const [daily, setDailyState]          = useState(freshDaily());
  const [pantry, setPantry]             = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [aiRecipes, setAiRecipes]       = useState([]);

  // ── Load all data for an authenticated user ─────────────────
  const loadUserData = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) { setReady(true); return; }

      setOnboarding(profile.onboarding_done);

      if (!profile.onboarding_done) { setReady(true); return; }

      setUser(mapProfile(profile));

      const today = todayStr();
      const [
        { data: dailyLog },
        { data: mealsDoneData },
        { data: pantryData },
        { data: weightData },
        { data: recipesData },
      ] = await Promise.all([
        supabase.from('daily_logs').select('*').eq('user_id', userId).eq('date', today).maybeSingle(),
        supabase.from('meals_done').select('meal_id').eq('user_id', userId).eq('log_date', today),
        supabase.from('pantry_items').select('*').eq('user_id', userId).order('added_at', { ascending: false }),
        supabase.from('weight_history').select('date, weight').eq('user_id', userId).order('date', { ascending: true }),
        supabase.from('ai_recipes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);

      setDailyState({
        date:         today,
        kcalToday:    dailyLog?.kcal_today ?? 0,
        proteinToday: parseFloat(dailyLog?.protein_today) || 0,
        waterToday:   dailyLog?.water_today ?? 0,
        stepsToday:   dailyLog?.steps_today ?? 0,
        mealsDone:    (mealsDoneData ?? []).map(m => m.meal_id),
      });
      setPantry((pantryData ?? []).map(mapPantryItem));
      setWeightHistory((weightData ?? []).map(w => ({ date: w.date, weight: parseFloat(w.weight) })));
      setAiRecipes((recipesData ?? []).map(mapRecipeFromDb));
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setReady(true);
    }
  };

  const resetState = () => {
    setOnboarding(false);
    setUser(null);
    setDailyState(freshDaily());
    setPantry([]);
    setWeightHistory([]);
    setAiRecipes([]);
  };

  // ── Auth state listener ──────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserData(session.user.id);
      } else {
        setReady(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setSession(session);
        loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        resetState();
        setReady(true);
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(session);
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  // ── Onboarding ───────────────────────────────────────────────
  const completeOnboarding = async (form) => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const userId = currentSession?.user?.id;
    if (!userId) return;

    const targets  = calcTargets(form);
    const authUser = currentSession.user;
    const name = authUser.user_metadata?.full_name
      || authUser.user_metadata?.name
      || authUser.email?.split('@')[0]
      || 'Usuario';

    const profileData = {
      onboarding_done: true,
      name,
      goal:           form.goal,
      sex:            form.sex,
      age:            form.age,
      weight:         form.weight,
      weight_start:   form.weight,
      weight_target:  form.target,
      height:         form.height,
      activity:       form.activity,
      kcal_target:    targets.kcalTarget,
      protein_target: targets.proteinTarget,
      streak:         1,
    };

    const { error } = await supabase.from('profiles').update(profileData).eq('id', userId);
    if (!error) {
      setUser(mapProfile({ ...profileData, water_target: 8, steps_target: 10000, is_premium: false, premium_expires_at: null }));
      setOnboarding(true);
    }
  };

  // ── User profile ─────────────────────────────────────────────
  const updateUser = async (changes) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    const userId = s?.user?.id;
    if (!userId) return;

    const dbMap = {
      name:             'name',
      weight:           'weight',
      streak:           'streak',
      isPremium:        'is_premium',
      premiumExpiresAt: 'premium_expires_at',
      waterTarget:      'water_target',
      stepsTarget:      'steps_target',
    };
    const dbChanges = {};
    for (const [key, dbKey] of Object.entries(dbMap)) {
      if (changes[key] !== undefined) dbChanges[dbKey] = changes[key];
    }
    if (Object.keys(dbChanges).length > 0) {
      await supabase.from('profiles').update(dbChanges).eq('id', userId);
    }
    setUser(u => ({ ...u, ...changes }));
  };

  // ── Daily log ────────────────────────────────────────────────
  const upsertDaily = async (next) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    const userId = s?.user?.id;
    if (!userId) return;
    await supabase.from('daily_logs').upsert({
      user_id:       userId,
      date:          next.date,
      kcal_today:    next.kcalToday,
      protein_today: next.proteinToday,
      water_today:   next.waterToday,
      steps_today:   next.stepsToday,
    }, { onConflict: 'user_id,date' });
  };

  const saveDaily = async (next) => {
    setDailyState(next);
    await upsertDaily(next);
  };

  const toggleMealDone = async (mealId, macros = { kcal: 0, protein: 0 }) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    const userId = s?.user?.id;
    if (!userId) return;

    const wasDone  = daily.mealsDone.includes(mealId);
    const mealsDone = wasDone
      ? daily.mealsDone.filter(id => id !== mealId)
      : [...daily.mealsDone, mealId];

    const next = {
      ...daily,
      mealsDone,
      kcalToday:    Math.max(0, daily.kcalToday    + (wasDone ? -macros.kcal    : macros.kcal)),
      proteinToday: Math.max(0, daily.proteinToday + (wasDone ? -macros.protein : macros.protein)),
    };
    setDailyState(next);

    await Promise.all([
      upsertDaily(next),
      wasDone
        ? supabase.from('meals_done').delete().eq('user_id', userId).eq('log_date', daily.date).eq('meal_id', mealId)
        : supabase.from('meals_done').insert({ user_id: userId, log_date: daily.date, meal_id: mealId, kcal: macros.kcal, protein: macros.protein }),
    ]);
  };

  const addWater = () => {
    const max  = (user?.waterTarget ?? 8) + 2;
    const next = { ...daily, waterToday: Math.min(daily.waterToday + 1, max) };
    saveDaily(next);
  };

  const removeWater = () => saveDaily({ ...daily, waterToday: Math.max(daily.waterToday - 1, 0) });

  const addSteps = (amount) => saveDaily({ ...daily, stepsToday: daily.stepsToday + amount });

  // ── Pantry ───────────────────────────────────────────────────
  const addToPantry = async (item) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    const userId = s?.user?.id;
    if (!userId) return;

    const { data, error } = await supabase.from('pantry_items').insert({
      user_id: userId,
      barcode: item.barcode,
      name:    item.name,
      brand:   item.brand,
      qty:     item.qty,
      cat:     item.cat,
      emoji:   item.emoji,
      kcal:    item.kcal,
      protein: item.protein,
      carbs:   item.carbs,
      fat:     item.fat,
    }).select().single();

    if (!error && data) {
      setPantry(prev => [mapPantryItem(data), ...prev]);
    }
  };

  const removeFromPantry = async (id) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    const userId = s?.user?.id;
    if (!userId) return;
    const { error } = await supabase.from('pantry_items').delete().eq('id', id).eq('user_id', userId);
    if (!error) setPantry(prev => prev.filter(it => it.id !== id));
  };

  const clearPantry = async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    const userId = s?.user?.id;
    if (!userId) return;
    await supabase.from('pantry_items').delete().eq('user_id', userId);
    setPantry([]);
  };

  // ── Weight ───────────────────────────────────────────────────
  const logWeight = async (weight) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    const userId = s?.user?.id;
    if (!userId) return;
    const today = todayStr();
    await supabase.from('weight_history').upsert(
      { user_id: userId, date: today, weight: +weight },
      { onConflict: 'user_id,date' }
    );
    const entry    = { date: today, weight: +weight };
    const filtered = weightHistory.filter(e => e.date !== today);
    setWeightHistory([...filtered, entry].sort((a, b) => a.date.localeCompare(b.date)));
    await updateUser({ weight: +weight });
  };

  // ── User refresh ─────────────────────────────────────────────
  const refreshUser = async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    const userId = s?.user?.id;
    if (!userId) return;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profile) setUser(mapProfile(profile));
  };

  // ── AI Recipes ───────────────────────────────────────────────
  const AI_FREE_LIMIT = 3;

  const aiGenerationsThisMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return aiRecipes.filter(r => r.createdAt >= startOfMonth).length;
  };

  const generateAiRecipes = async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    const userId = s?.user?.id;
    if (!userId || !user || pantry.length === 0) throw new Error('Se necesita usuario y productos en despensa');

    if (!user.isPremium && aiGenerationsThisMonth() >= AI_FREE_LIMIT) {
      throw new Error('LIMIT_REACHED');
    }

    const recipes = await generateRecipes(pantry, user);

    const { data, error } = await supabase.from('ai_recipes').insert(
      recipes.map(r => ({
        user_id:     userId,
        title:       r.title,
        subtitle:    r.subtitle,
        tag:         r.tag,
        why:         r.why,
        time:        r.time,
        kcal:        r.kcal,
        protein:     r.p,
        carbs:       r.c,
        fat:         r.f,
        ingredients: r.ingredients,
        steps:       r.steps,
        match:       r.match,
        img:         r.img,
      }))
    ).select();

    if (error) throw error;
    const mapped = (data ?? []).map(mapRecipeFromDb);
    setAiRecipes(prev => [...mapped, ...prev]);
    return mapped;
  };

  const deleteAiRecipes = async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    const userId = s?.user?.id;
    if (!userId) return;
    await supabase.from('ai_recipes').delete().eq('user_id', userId);
    setAiRecipes([]);
  };

  // ── Premium ──────────────────────────────────────────────────
  const activatePremium = async (days = 7) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    await updateUser({ isPremium: true, premiumExpiresAt: expiresAt.toISOString() });
  };

  const deactivatePremium = async () => updateUser({ isPremium: false, premiumExpiresAt: null });

  // ── Logout ───────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppCtx.Provider value={{
      ready, session, onboardingDone, user, daily, pantry, weightHistory, aiRecipes,
      completeOnboarding, updateUser, saveDaily, refreshUser,
      toggleMealDone, addWater, removeWater, addSteps,
      addToPantry, removeFromPantry, clearPantry,
      logWeight, logout, generateAiRecipes, deleteAiRecipes,
      aiGenerationsThisMonth, AI_FREE_LIMIT,
      activatePremium, deactivatePremium,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
