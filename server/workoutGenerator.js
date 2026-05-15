const EXERCISES = {
  chest: [
    { name: 'Press de banca con barra', musle: 'Pecho', eq: 'bar', minLevel: 'beginner' },
    { name: 'Press de banca inclinado con barra', musle: 'Pecho', eq: 'bar', minLevel: 'beginner' },
    { name: 'Press de banca declinado con barra', musle: 'Pecho', eq: 'bar', minLevel: 'intermediate' },
    { name: 'Press con mancuernas en banco plano', musle: 'Pecho', eq: 'db', minLevel: 'beginner' },
    { name: 'Press inclinado con mancuernas', musle: 'Pecho', eq: 'db', minLevel: 'beginner' },
    { name: 'Aperturas con mancuernas', musle: 'Pecho', eq: 'db', minLevel: 'beginner' },
    { name: 'Aperturas en polea alta (cruce)', musle: 'Pecho', eq: 'pully', minLevel: 'intermediate' },
    { name: 'Flexiones', musle: 'Pecho', eq: 'body', minLevel: 'beginner' },
    { name: 'Flexiones diamante', musle: 'Pecho', eq: 'body', minLevel: 'beginner' },
    { name: 'Flexiones declinadas', musle: 'Pecho', eq: 'body', minLevel: 'intermediate' },
    { name: 'Pull-over con mancuerna', musle: 'Pecho', eq: 'db', minLevel: 'beginner' },
    { name: 'Press con mancuernas en máquina', musle: 'Pecho', eq: 'pully', minLevel: 'beginner' },
  ],
  back: [
    { name: 'Dominadas (peso corporal)', musle: 'Espalda', eq: 'body', minLevel: 'beginner' },
    { name: 'Remo con barra', musle: 'Espalda', eq: 'bar', minLevel: 'beginner' },
    { name: 'Remo con mancuerna a una mano', musle: 'Espalda', eq: 'db', minLevel: 'beginner' },
    { name: 'Jalón al pecho en polea', musle: 'Espalda', eq: 'pully', minLevel: 'beginner' },
    { name: 'Remo en polea baja sentado', musle: 'Espalda', eq: 'pully', minLevel: 'beginner' },
    { name: 'Peso muerto con barra', musle: 'Espalda', eq: 'bar', minLevel: 'beginner' },
    { name: 'Peso muerto rumano', musle: 'Espalda', eq: 'bar', minLevel: 'intermediate' },
    { name: 'Remo invertido (australian pull-up)', musle: 'Espalda', eq: 'body', minLevel: 'beginner' },
    { name: 'Pull-over con barra', musle: 'Espalda', eq: 'bar', minLevel: 'intermediate' },
    { name: 'Remo con kettlebell', musle: 'Espalda', eq: 'kettle', minLevel: 'beginner' },
    { name: 'Jalón con agarre cerrado', musle: 'Espalda', eq: 'pully', minLevel: 'beginner' },
    { name: 'Hiperextensiones (espalda baja)', musle: 'Espalda', eq: 'body', minLevel: 'beginner' },
  ],
  shoulders: [
    { name: 'Press militar con barra', musle: 'Hombros', eq: 'bar', minLevel: 'beginner' },
    { name: 'Press con mancuernas sentado', musle: 'Hombros', eq: 'db', minLevel: 'beginner' },
    { name: 'Elevaciones laterales con mancuerna', musle: 'Hombros', eq: 'db', minLevel: 'beginner' },
    { name: 'Elevaciones frontales con mancuerna', musle: 'Hombros', eq: 'db', minLevel: 'beginner' },
    { name: 'Pájaro (elevaciones traseras)', musle: 'Hombros', eq: 'db', minLevel: 'intermediate' },
    { name: 'Press con mancuernas en máquina', musle: 'Hombros', eq: 'pully', minLevel: 'beginner' },
    { name: 'Elevaciones laterales en polea', musle: 'Hombros', eq: 'pully', minLevel: 'intermediate' },
    { name: 'Face pull en polea', musle: 'Hombros', eq: 'pully', minLevel: 'intermediate' },
    { name: 'Press Arnold con mancuernas', musle: 'Hombros', eq: 'db', minLevel: 'intermediate' },
    { name: 'Push press con barra', musle: 'Hombros', eq: 'bar', minLevel: 'intermediate' },
    { name: 'Clean and press con kettlebell', musle: 'Hombros', eq: 'kettle', minLevel: 'intermediate' },
    { name: 'Pike push-ups', musle: 'Hombros', eq: 'body', minLevel: 'intermediate' },
  ],
  biceps: [
    { name: 'Curl con barra recta', musle: 'Bíceps', eq: 'bar', minLevel: 'beginner' },
    { name: 'Curl con barra Z', musle: 'Bíceps', eq: 'bar', minLevel: 'beginner' },
    { name: 'Curl alterno con mancuernas', musle: 'Bíceps', eq: 'db', minLevel: 'beginner' },
    { name: 'Curl martillo con mancuernas', musle: 'Bíceps', eq: 'db', minLevel: 'beginner' },
    { name: 'Curl en polea baja', musle: 'Bíceps', eq: 'pully', minLevel: 'beginner' },
    { name: 'Curl predicador con barra Z', musle: 'Bíceps', eq: 'bar', minLevel: 'intermediate' },
    { name: 'Curl concentrado con mancuerna', musle: 'Bíceps', eq: 'db', minLevel: 'beginner' },
    { name: 'Curl con banda elástica', musle: 'Bíceps', eq: 'band', minLevel: 'beginner' },
    { name: 'Curl inclinado con mancuerna', musle: 'Bíceps', eq: 'db', minLevel: 'intermediate' },
    { name: 'Curl araña con barra Z', musle: 'Bíceps', eq: 'bar', minLevel: 'advanced' },
    { name: '21s con barra (7+7+7)', musle: 'Bíceps', eq: 'bar', minLevel: 'intermediate' },
  ],
  triceps: [
    { name: 'Fondos en paralelas', musle: 'Tríceps', eq: 'body', minLevel: 'intermediate' },
    { name: 'Fondos en banco (tríceps)', musle: 'Tríceps', eq: 'body', minLevel: 'beginner' },
    { name: 'Press francés con barra Z', musle: 'Tríceps', eq: 'bar', minLevel: 'intermediate' },
    { name: 'Press francés con mancuerna', musle: 'Tríceps', eq: 'db', minLevel: 'beginner' },
    { name: 'Extensión de tríceps en polea', musle: 'Tríceps', eq: 'pully', minLevel: 'beginner' },
    { name: 'Extensión de tríceps por encima (cable)', musle: 'Tríceps', eq: 'pully', minLevel: 'beginner' },
    { name: 'Patada de tríceps con mancuerna', musle: 'Tríceps', eq: 'db', minLevel: 'beginner' },
    { name: 'Press cerrado con barra', musle: 'Tríceps', eq: 'bar', minLevel: 'beginner' },
    { name: 'Press cerrado con mancuernas', musle: 'Tríceps', eq: 'db', minLevel: 'beginner' },
    { name: 'Flexiones diamante (tríceps)', musle: 'Tríceps', eq: 'body', minLevel: 'beginner' },
    { name: 'Extensión con kettlebell a dos manos', musle: 'Tríceps', eq: 'kettle', minLevel: 'intermediate' },
  ],
  legs: [
    { name: 'Sentadilla con barra', musle: 'Piernas', eq: 'bar', minLevel: 'beginner' },
    { name: 'Sentadilla frontal con barra', musle: 'Piernas', eq: 'bar', minLevel: 'intermediate' },
    { name: 'Prensa de piernas', musle: 'Piernas', eq: 'pully', minLevel: 'beginner' },
    { name: 'Peso muerto con barra', musle: 'Piernas', eq: 'bar', minLevel: 'beginner' },
    { name: 'Zancadas con mancuernas', musle: 'Piernas', eq: 'db', minLevel: 'beginner' },
    { name: 'Zancadas laterales con mancuerna', musle: 'Piernas', eq: 'db', minLevel: 'intermediate' },
    { name: 'Sentadilla búlgara con mancuerna', musle: 'Piernas', eq: 'db', minLevel: 'intermediate' },
    { name: 'Curl femoral tumbado', musle: 'Piernas', eq: 'pully', minLevel: 'beginner' },
    { name: 'Curl femoral sentado', musle: 'Piernas', eq: 'pully', minLevel: 'intermediate' },
    { name: 'Extensiones de cuádriceps', musle: 'Piernas', eq: 'pully', minLevel: 'beginner' },
    { name: 'Sentadilla con kettlebell (goblet)', musle: 'Piernas', eq: 'kettle', minLevel: 'beginner' },
    { name: 'Peso muerto a una pierna con mancuerna', musle: 'Piernas', eq: 'db', minLevel: 'intermediate' },
    { name: 'Sentadilla con salto', musle: 'Piernas', eq: 'body', minLevel: 'beginner' },
    { name: 'Step-ups con mancuerna', musle: 'Piernas', eq: 'db', minLevel: 'beginner' },
    { name: 'Hip thrust con barra', musle: 'Piernas', eq: 'bar', minLevel: 'beginner' },
    { name: 'Puente a una pierna', musle: 'Piernas', eq: 'body', minLevel: 'beginner' },
    { name: 'Sentadilla a una pierna (pistol)', musle: 'Piernas', eq: 'body', minLevel: 'advanced' },
    { name: 'Peso muerto sumo con kettlebell', musle: 'Piernas', eq: 'kettle', minLevel: 'beginner' },
  ],
  glutes: [
    { name: 'Hip thrust con barra', musle: 'Glúteos', eq: 'bar', minLevel: 'beginner' },
    { name: 'Hip thrust a una pierna', musle: 'Glúteos', eq: 'body', minLevel: 'intermediate' },
    { name: 'Patada de glúteo en polea', musle: 'Glúteos', eq: 'pully', minLevel: 'beginner' },
    { name: 'Abducción de cadera en máquina', musle: 'Glúteos', eq: 'pully', minLevel: 'beginner' },
    { name: 'Puente de glúteo', musle: 'Glúteos', eq: 'body', minLevel: 'beginner' },
    { name: 'Sentadilla profunda con pausa', musle: 'Glúteos', eq: 'bar', minLevel: 'intermediate' },
    { name: 'Zancada búlgara', musle: 'Glúteos', eq: 'db', minLevel: 'intermediate' },
    { name: 'Peso muerto rumano a una pierna', musle: 'Glúteos', eq: 'db', minLevel: 'intermediate' },
  ],
  abs: [
    { name: 'Plancha', musle: 'Abdominales', eq: 'body', minLevel: 'beginner' },
    { name: 'Plancha lateral', musle: 'Abdominales', eq: 'body', minLevel: 'beginner' },
    { name: 'Crunch', musle: 'Abdominales', eq: 'body', minLevel: 'beginner' },
    { name: 'Elevación de piernas colgado', musle: 'Abdominales', eq: 'body', minLevel: 'intermediate' },
    { name: 'Russian twist con disco', musle: 'Abdominales', eq: 'bar', minLevel: 'beginner' },
    { name: 'Russian twist con mancuerna', musle: 'Abdominales', eq: 'db', minLevel: 'beginner' },
    { name: 'Ab wheel rollout', musle: 'Abdominales', eq: 'body', minLevel: 'intermediate' },
    { name: 'Encogimiento en polea (cable crunch)', musle: 'Abdominales', eq: 'pully', minLevel: 'beginner' },
    { name: 'Bicycle crunch', musle: 'Abdominales', eq: 'body', minLevel: 'beginner' },
    { name: 'Mountain climbers', musle: 'Abdominales', eq: 'body', minLevel: 'beginner' },
    { name: 'Dead bug', musle: 'Abdominales', eq: 'body', minLevel: 'beginner' },
    { name: 'V-ups', musle: 'Abdominales', eq: 'body', minLevel: 'intermediate' },
  ],
  cardio: [
    { name: 'Burpees', musle: 'Cardio', eq: 'body', minLevel: 'beginner' },
    { name: 'Saltos de tijera (jumping jacks)', musle: 'Cardio', eq: 'body', minLevel: 'beginner' },
    { name: 'High knees', musle: 'Cardio', eq: 'body', minLevel: 'beginner' },
    { name: 'Battle ropes', musle: 'Cardio', eq: 'body', minLevel: 'beginner' },
    { name: 'Kettlebell swings', musle: 'Cardio', eq: 'kettle', minLevel: 'beginner' },
    { name: 'Box jumps', musle: 'Cardio', eq: 'body', minLevel: 'intermediate' },
    { name: 'Cuerda de saltar', musle: 'Cardio', eq: 'body', minLevel: 'beginner' },
  ],
};

const LEVEL_RANGES = {
  beginner:      { sets: [2, 3],  reps: '10-12', rest: 90,  minEx: 4, maxEx: 5 },
  intermediate:  { sets: [3, 4],  reps: '8-10',  rest: 75,  minEx: 4, maxEx: 6 },
  advanced:      { sets: [4, 5],  reps: '6-8',   rest: 60,  minEx: 5, maxEx: 6 },
};

const GOAL_FOCUS = {
  strength:     { emphasis: 'Fuerza',     extraCompound: true },
  hypertrophy:  { emphasis: 'Hipertrofia', extraCompound: false },
  endurance:    { emphasis: 'Resistencia', extraCompound: false },
  general:      { emphasis: 'Salud general', extraCompound: true },
};

const SPLIT_TEMPLATES = {
  3: [
    { label: 'Empuje (Push)', focus: 'Pecho · Hombros · Tríceps',      groups: ['chest', 'shoulders', 'triceps'] },
    { label: 'Tracción (Pull)', focus: 'Espalda · Bíceps · Abdomen',     groups: ['back', 'biceps', 'abs'] },
    { label: 'Piernas (Legs)', focus: 'Piernas · Glúteos · Cardio',      groups: ['legs', 'glutes', 'cardio'] },
  ],
  4: [
    { label: 'Parte superior A', focus: 'Pecho · Hombros · Tríceps',    groups: ['chest', 'shoulders', 'triceps'] },
    { label: 'Parte inferior A', focus: 'Piernas · Glúteos · Abdomen',   groups: ['legs', 'glutes', 'abs'] },
    { label: 'Parte superior B', focus: 'Espalda · Bíceps · Abdomen',    groups: ['back', 'biceps', 'abs'] },
    { label: 'Parte inferior B', focus: 'Piernas · Cardio',             groups: ['legs', 'cardio'] },
  ],
  5: [
    { label: 'Día 1: Pecho + Tríceps', focus: 'Pecho · Tríceps',        groups: ['chest', 'triceps'] },
    { label: 'Día 2: Espalda + Bíceps', focus: 'Espalda · Bíceps',       groups: ['back', 'biceps'] },
    { label: 'Día 3: Piernas + Glúteos', focus: 'Piernas · Glúteos',     groups: ['legs', 'glutes'] },
    { label: 'Día 4: Hombros + Abdomen', focus: 'Hombros · Abdomen',    groups: ['shoulders', 'abs'] },
    { label: 'Día 5: Cuerpo completo', focus: 'Full body + Cardio',     groups: ['chest', 'back', 'legs', 'cardio'] },
  ],
  6: [
    { label: 'Día 1: Pecho', focus: 'Pecho · Hombros frontales',        groups: ['chest', 'shoulders'] },
    { label: 'Día 2: Espalda', focus: 'Espalda · Hombros traseros',     groups: ['back', 'shoulders'] },
    { label: 'Día 3: Piernas A', focus: 'Piernas · Glúteos',            groups: ['legs', 'glutes'] },
    { label: 'Día 4: Hombros + Brazos', focus: 'Hombros · Bíceps · Tríceps', groups: ['shoulders', 'biceps', 'triceps'] },
    { label: 'Día 5: Piernas B', focus: 'Piernas · Abdomen',            groups: ['legs', 'abs'] },
    { label: 'Día 6: Full body', focus: 'Cuerpo completo + Cardio',     groups: ['chest', 'back', 'legs', 'cardio'] },
  ],
};

const WORKOUT_NAMES = {
  'Pecho · Hombros · Tríceps': ['Empuje explosivo', 'Press & Push', 'Upper Push'],
  'Espalda · Bíceps · Abdomen': ['Pull intenso', 'Remo & Curl', 'Upper Pull'],
  'Piernas · Glúteos · Cardio': ['Piernas potentes', 'Lower Body', 'Día de piernas'],
  'Piernas · Glúteos · Abdomen': ['Inferior activo', 'Legs & Core'],
  'Piernas · Cardio': ['Quema de piernas', 'Legs cardio'],
  'Pecho · Tríceps': ['Press & Extensión', 'Empuje superior'],
  'Espalda · Bíceps': ['Remo & Curl'],
  'Piernas · Glúteos': ['Glúteos y piernas', 'Día de sentadillas'],
  'Hombros · Abdomen': ['Hombros y core', 'Shoulders & Abs'],
  'Full body + Cardio': ['Full body', 'Cuerpo completo'],
  'Pecho · Hombros frontales': ['Press de pecho'],
  'Espalda · Hombros traseros': ['Remo pesado'],
  'Piernas A': ['Piernas A', 'Cuádriceps focus'],
  'Hombros · Bíceps · Tríceps': ['Brazos y hombros'],
  'Piernas B': ['Piernas B', 'Femoral focus'],
  'Cuerpo completo + Cardio': ['Full body cardio'],
  'Pecho · Hombros': ['Press & Raise'],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function filterExercises(groups, equipment, level) {
  const eqSet = new Set(equipment.length ? equipment : ['body']);
  return groups.flatMap(g => {
    const exs = EXERCISES[g] || [];
    const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    return exs.filter(e => {
      const hasEq = e.eq === 'body' || eqSet.has(e.eq);
      const levelOk = levelOrder[e.minLevel] <= levelOrder[level];
      return hasEq && levelOk;
    });
  });
}

function buildExercises(pool, levelConfig, goal) {
  const shuffled = shuffle(pool);
  const count = Math.min(
    levelConfig.minEx + Math.floor(Math.random() * (levelConfig.maxEx - levelConfig.minEx + 1)),
    shuffled.length
  );
  const selected = shuffled.slice(0, count);
  const setRange = levelConfig.sets;
  return selected.map((e, i) => ({
    name: e.name,
    muscle: e.musle,
    sets: setRange[0] + Math.floor(Math.random() * (setRange[1] - setRange[0] + 1)),
    reps: levelConfig.reps,
    rest: levelConfig.rest + (i === 0 ? 15 : 0),
  }));
}

function generateName(splitDay, existingNames) {
  const candidates = WORKOUT_NAMES[splitDay.focus] || [splitDay.label];
  const available = candidates.filter(n => !existingNames.includes(n));
  return available.length ? pickRandom(available) : candidates[0];
}

export function generateWorkoutPlan({ goal, level, days, equipment = [] }) {
  const splits = SPLIT_TEMPLATES[days];
  if (!splits) throw new Error(`Días no soportados: ${days}`);

  const levelConfig = LEVEL_RANGES[level] || LEVEL_RANGES.beginner;
  const goalConfig = GOAL_FOCUS[goal] || GOAL_FOCUS.general;
  const usedNames = new Set();

  const workouts = splits.map((splitDay) => {
    const pool = filterExercises(splitDay.groups, equipment, level);
    const exercises = buildExercises(pool, levelConfig, goal);
    const name = generateName(splitDay, [...usedNames]);
    usedNames.add(name);

    return {
      name,
      focus: splitDay.focus,
      duration: exercises.reduce((t, e) => t + (e.rest || 60) + (e.sets * 40), 0) + 300,
      exercises,
    };
  });

  return { workouts };
}
