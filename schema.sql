-- ============================================================
-- CoachFood · Supabase Schema
-- ============================================================
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Orden: ejecutar de arriba a abajo, todo de una vez.
-- ============================================================


-- ============================================================
-- 1. PROFILES
--    Extiende auth.users con todos los datos del usuario.
--    Se crea automáticamente al registrarse (trigger abajo).
-- ============================================================
create table public.profiles (
  id                  uuid        primary key references auth.users(id) on delete cascade,

  -- Onboarding
  onboarding_done     boolean     not null default false,
  name                text,

  -- Objetivo y físico
  goal                text        check (goal in ('lose', 'maintain', 'gain')),
  sex                 text        check (sex  in ('Mujer', 'Hombre', 'Otro')),
  age                 smallint    check (age between 14 and 120),
  weight              numeric(5,1) check (weight > 0),
  weight_start        numeric(5,1),
  weight_target       numeric(5,1),
  height              smallint    check (height between 50 and 300),
  activity            text        check (activity in ('sedentary', 'light', 'moderate', 'active')),

  -- Objetivos calculados
  kcal_target         integer,
  protein_target      integer,

  -- Seguimiento diario (preferencias)
  water_target        smallint    not null default 8,
  steps_target        integer     not null default 10000,
  streak              integer     not null default 0,

  -- Premium
  is_premium          boolean     not null default false,
  premium_expires_at  timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Políticas RLS: cada usuario solo ve y edita su propio perfil
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger: crea el perfil vacío cuando el usuario se registra en auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: actualiza updated_at automáticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Grant acceso a la API
grant select, update on public.profiles to authenticated;


-- ============================================================
-- 2. DAILY_LOGS
--    Una fila por usuario por día.
--    Upsert al actualizar agua, pasos o macros.
-- ============================================================
create table public.daily_logs (
  id            bigserial   primary key,
  user_id       uuid        not null references auth.users(id) on delete cascade,
  date          date        not null,

  kcal_today    integer     not null default 0,
  protein_today numeric(6,1) not null default 0,
  water_today   smallint    not null default 0,
  steps_today   integer     not null default 0,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  unique (user_id, date)
);

alter table public.daily_logs enable row level security;

create policy "daily_logs: select own"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "daily_logs: insert own"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "daily_logs: update own"
  on public.daily_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger daily_logs_updated_at
  before update on public.daily_logs
  for each row execute procedure public.set_updated_at();

create index idx_daily_logs_user_date on public.daily_logs (user_id, date desc);

grant select, insert, update on public.daily_logs to authenticated;
grant usage, select on sequence public.daily_logs_id_seq to authenticated;


-- ============================================================
-- 3. MEALS_DONE
--    Qué comidas marcó el usuario como hechas cada día.
--    meal_id es el identificador de la comida ('meal-0', etc.)
-- ============================================================
create table public.meals_done (
  id         bigserial   primary key,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  log_date   date        not null,
  meal_id    text        not null,
  kcal       integer     not null default 0,
  protein    numeric(6,1) not null default 0,
  created_at timestamptz not null default now(),

  unique (user_id, log_date, meal_id)
);

alter table public.meals_done enable row level security;

create policy "meals_done: select own"
  on public.meals_done for select
  using (auth.uid() = user_id);

create policy "meals_done: insert own"
  on public.meals_done for insert
  with check (auth.uid() = user_id);

create policy "meals_done: delete own"
  on public.meals_done for delete
  using (auth.uid() = user_id);

create index idx_meals_done_user_date on public.meals_done (user_id, log_date desc);

grant select, insert, delete on public.meals_done to authenticated;
grant usage, select on sequence public.meals_done_id_seq to authenticated;


-- ============================================================
-- 4. WEIGHT_HISTORY
--    Un registro de peso por día por usuario (upsert).
-- ============================================================
create table public.weight_history (
  id         bigserial    primary key,
  user_id    uuid         not null references auth.users(id) on delete cascade,
  date       date         not null,
  weight     numeric(5,1) not null check (weight > 0),
  created_at timestamptz  not null default now(),

  unique (user_id, date)
);

alter table public.weight_history enable row level security;

create policy "weight_history: select own"
  on public.weight_history for select
  using (auth.uid() = user_id);

create policy "weight_history: insert own"
  on public.weight_history for insert
  with check (auth.uid() = user_id);

create policy "weight_history: update own"
  on public.weight_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weight_history: delete own"
  on public.weight_history for delete
  using (auth.uid() = user_id);

create index idx_weight_history_user_date on public.weight_history (user_id, date desc);

grant select, insert, update, delete on public.weight_history to authenticated;
grant usage, select on sequence public.weight_history_id_seq to authenticated;


-- ============================================================
-- 5. PANTRY_ITEMS
--    Productos escaneados por el usuario.
-- ============================================================
create table public.pantry_items (
  id           uuid         primary key default gen_random_uuid(),
  user_id      uuid         not null references auth.users(id) on delete cascade,

  barcode      text,
  name         text         not null,
  brand        text,
  qty          text,        -- "100 g", "1 unidad", etc.
  cat          text         check (cat in ('protein', 'dairy', 'veg', 'grain', 'fruit', 'pantry')),
  emoji        text,

  kcal         integer      not null default 0,
  protein      numeric(6,1) not null default 0,
  carbs        numeric(6,1) not null default 0,
  fat          numeric(6,1) not null default 0,

  added_at     timestamptz  not null default now()
);

alter table public.pantry_items enable row level security;

create policy "pantry_items: select own"
  on public.pantry_items for select
  using (auth.uid() = user_id);

create policy "pantry_items: insert own"
  on public.pantry_items for insert
  with check (auth.uid() = user_id);

create policy "pantry_items: delete own"
  on public.pantry_items for delete
  using (auth.uid() = user_id);

create index idx_pantry_items_user on public.pantry_items (user_id, added_at desc);

grant select, insert, delete on public.pantry_items to authenticated;


-- ============================================================
-- 6. AI_RECIPES
--    Recetas generadas por IA para el usuario.
-- ============================================================
create table public.ai_recipes (
  id           uuid         primary key default gen_random_uuid(),
  user_id      uuid         not null references auth.users(id) on delete cascade,

  title        text         not null,
  subtitle     text,
  tag          text         check (tag in ('Desayuno', 'Comida', 'Cena', 'Snack')),
  why          text,
  time         smallint,    -- minutos
  kcal         integer,
  protein      numeric(6,1), -- p
  carbs        numeric(6,1), -- c
  fat          numeric(6,1), -- f

  ingredients  jsonb,       -- [{name, qty, have}]
  steps        jsonb,       -- [string]
  match        jsonb,       -- {uses, total}
  img          jsonb,       -- {hue: number}

  created_at   timestamptz  not null default now()
);

alter table public.ai_recipes enable row level security;

create policy "ai_recipes: select own"
  on public.ai_recipes for select
  using (auth.uid() = user_id);

create policy "ai_recipes: insert own"
  on public.ai_recipes for insert
  with check (auth.uid() = user_id);

create policy "ai_recipes: delete own"
  on public.ai_recipes for delete
  using (auth.uid() = user_id);

create index idx_ai_recipes_user on public.ai_recipes (user_id, created_at desc);

grant select, insert, delete on public.ai_recipes to authenticated;


-- ============================================================
-- 7. WORKOUT_PLANS
--    Plan de entrenamiento generado por IA.
-- ============================================================
create table public.workout_plans (
  id           uuid         primary key default gen_random_uuid(),
  user_id      uuid         not null references auth.users(id) on delete cascade,

  week_start   date         not null,
  day_of_week  smallint     not null check (day_of_week between 0 and 6),
  name         text         not null,
  focus        text,
  duration     smallint,
  exercises    jsonb        not null, -- [{id, name, muscle, sets, reps, rest, weight?}]
  done         boolean      not null default false,

  created_at   timestamptz  not null default now()
);

alter table public.workout_plans enable row level security;

create policy "workout_plans: select own"
  on public.workout_plans for select
  using (auth.uid() = user_id);

create policy "workout_plans: insert own"
  on public.workout_plans for insert
  with check (auth.uid() = user_id);

create policy "workout_plans: update own"
  on public.workout_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workout_plans: delete own"
  on public.workout_plans for delete
  using (auth.uid() = user_id);

create index idx_workout_plans_user_week on public.workout_plans (user_id, week_start desc);

grant select, insert, update, delete on public.workout_plans to authenticated;


-- ============================================================
-- 8. PRS (Personal Records)
--    Squat, Bench, Deadlift + ejercicios personalizados.
-- ============================================================
create table public.prs (
  id           uuid         primary key default gen_random_uuid(),
  user_id      uuid         not null references auth.users(id) on delete cascade,

  exercise     text         not null, -- 'squat', 'bench', 'deadlift', o nombre personalizado
  weight       numeric(6,1) not null check (weight > 0),
  reps         smallint     not null default 1,
  date         date         not null default current_date,
  notes        text,

  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now(),

  unique (user_id, exercise)
);

alter table public.prs enable row level security;

create policy "prs: select own"
  on public.prs for select
  using (auth.uid() = user_id);

create policy "prs: insert own"
  on public.prs for insert
  with check (auth.uid() = user_id);

create policy "prs: update own"
  on public.prs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "prs: delete own"
  on public.prs for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.prs to authenticated;


-- ============================================================
-- 9. Añadir campos al perfil
-- ============================================================
alter table public.profiles add column if not exists workout_days smallint     check (workout_days between 1 and 7);
alter table public.profiles add column if not exists workout_goal text        check (workout_goal in ('strength', 'hypertrophy', 'endurance', 'general'));
alter table public.profiles add column if not exists workout_level text       check (workout_level in ('beginner', 'intermediate', 'advanced'));
alter table public.profiles add column if not exists workout_equipment text[] default '{}';
alter table public.profiles add column if not exists has_done_workout_survey boolean not null default false;
