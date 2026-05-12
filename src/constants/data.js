export const TICKET_ITEMS = [
  { name: 'Pechuga de pollo',     qty: '1 kg',   price: 6.49, cat: 'protein',  emoji: '🍗' },
  { name: 'Salmón fresco',        qty: '400 g',  price: 8.20, cat: 'protein',  emoji: '🐟' },
  { name: 'Huevos camperos',      qty: '12 ud',  price: 3.15, cat: 'protein',  emoji: '🥚' },
  { name: 'Yogur griego natural', qty: '4×125g', price: 2.40, cat: 'dairy',    emoji: '🥛' },
  { name: 'Queso fresco batido',  qty: '500 g',  price: 1.95, cat: 'dairy',    emoji: '🧀' },
  { name: 'Brócoli',              qty: '500 g',  price: 1.49, cat: 'veg',      emoji: '🥦' },
  { name: 'Espinacas baby',       qty: '200 g',  price: 1.89, cat: 'veg',      emoji: '🥬' },
  { name: 'Tomates en rama',      qty: '1 kg',   price: 2.30, cat: 'veg',      emoji: '🍅' },
  { name: 'Aguacate',             qty: '3 ud',   price: 2.97, cat: 'veg',      emoji: '🥑' },
  { name: 'Pimiento rojo',        qty: '2 ud',   price: 1.40, cat: 'veg',      emoji: '🫑' },
  { name: 'Cebolla',              qty: '1 kg',   price: 0.99, cat: 'veg',      emoji: '🧅' },
  { name: 'Arroz integral',       qty: '1 kg',   price: 1.85, cat: 'grain',    emoji: '🍚' },
  { name: 'Quinoa',               qty: '500 g',  price: 3.20, cat: 'grain',    emoji: '🌾' },
  { name: 'Pasta integral',       qty: '500 g',  price: 1.10, cat: 'grain',    emoji: '🍝' },
  { name: 'Pan integral semillas',qty: '500 g',  price: 2.20, cat: 'grain',    emoji: '🍞' },
  { name: 'Aceite de oliva V.E.', qty: '750 ml', price: 7.95, cat: 'pantry',   emoji: '🫒' },
  { name: 'Almendras crudas',     qty: '200 g',  price: 3.45, cat: 'pantry',   emoji: '🥜' },
  { name: 'Avena copos',          qty: '500 g',  price: 1.40, cat: 'grain',    emoji: '🌾' },
  { name: 'Plátanos',             qty: '1 kg',   price: 1.69, cat: 'fruit',    emoji: '🍌' },
  { name: 'Arándanos',            qty: '125 g',  price: 2.49, cat: 'fruit',    emoji: '🫐' },
  { name: 'Limones',              qty: '500 g',  price: 1.20, cat: 'fruit',    emoji: '🍋' },
  { name: 'Garbanzos cocidos',    qty: '400 g',  price: 0.89, cat: 'protein',  emoji: '🫘' },
];

export const TICKET_TOTAL = TICKET_ITEMS.reduce((a, b) => a + b.price, 0);

export const CAT_LABELS = {
  protein: 'Proteína', dairy: 'Lácteos', veg: 'Verdura',
  grain: 'Cereales', fruit: 'Fruta', pantry: 'Despensa',
};

export const RECIPES = [
  {
    id: 'r1',
    title: 'Bowl de salmón con quinoa',
    subtitle: 'Cena · 1 ración',
    time: 25, kcal: 540, p: 38, c: 42, f: 22,
    tag: 'Cena',
    match: { uses: 7, total: 8 },
    img: { hue: 18, sat: 24 },
    why: 'Equilibrado en macros y usa 7 de los ingredientes que compraste hoy.',
    ingredients: [
      { name: 'Salmón fresco',     qty: '180 g',  have: true },
      { name: 'Quinoa',            qty: '60 g',   have: true },
      { name: 'Aguacate',          qty: '½ ud',   have: true },
      { name: 'Espinacas baby',    qty: '50 g',   have: true },
      { name: 'Pimiento rojo',     qty: '½ ud',   have: true },
      { name: 'Limón',             qty: '½ ud',   have: true },
      { name: 'Aceite de oliva',   qty: '1 cda',  have: true },
      { name: 'Sésamo tostado',    qty: '1 cdta', have: false },
    ],
    steps: [
      'Cuece la quinoa en agua con sal 12 minutos, escurre y reserva.',
      'Marca el salmón a la plancha 3 min por lado con un poco de aceite.',
      'Mezcla en un bol espinacas, pimiento en tiras y aguacate laminado.',
      'Monta: base de quinoa, verduras, salmón encima, ralladura de limón.',
      'Termina con sésamo y un hilo de aceite de oliva.',
    ],
  },
  {
    id: 'r2',
    title: 'Avena con yogur y arándanos',
    subtitle: 'Desayuno · 1 ración',
    time: 8, kcal: 380, p: 22, c: 48, f: 11,
    tag: 'Desayuno',
    match: { uses: 5, total: 5 },
    img: { hue: 35, sat: 18 },
    why: 'Rápido, alto en proteína y usa solo lo que compraste.',
    ingredients: [
      { name: 'Avena copos',         qty: '50 g',  have: true },
      { name: 'Yogur griego',        qty: '150 g', have: true },
      { name: 'Arándanos',           qty: '60 g',  have: true },
      { name: 'Plátano',             qty: '½ ud',  have: true },
      { name: 'Almendras laminadas', qty: '15 g',  have: true },
    ],
    steps: [
      'Cuece la avena con agua o leche 4 minutos hasta cremosa.',
      'Pasa a un bol y deja templar un par de minutos.',
      'Añade el yogur por encima en cucharadas.',
      'Corona con arándanos, plátano laminado y almendras.',
    ],
  },
  {
    id: 'r3',
    title: 'Pollo al limón con brócoli',
    subtitle: 'Comida · 2 raciones',
    time: 30, kcal: 470, p: 45, c: 28, f: 18,
    tag: 'Comida',
    match: { uses: 6, total: 7 },
    img: { hue: 78, sat: 14 },
    why: 'Alto en proteína y bajo en grasa, ideal para tu objetivo de definición.',
    ingredients: [
      { name: 'Pechuga de pollo', qty: '300 g', have: true },
      { name: 'Brócoli',          qty: '300 g', have: true },
      { name: 'Arroz integral',   qty: '120 g', have: true },
      { name: 'Limón',            qty: '1 ud',  have: true },
      { name: 'Ajo',              qty: '2 dientes', have: false },
      { name: 'Aceite de oliva',  qty: '2 cdas', have: true },
      { name: 'Pimentón',         qty: '1 cdta', have: true },
    ],
    steps: [
      'Hierve el arroz integral 25 minutos en agua con sal.',
      'Cuece al vapor el brócoli en floretes 6-8 minutos.',
      'Saltea el pollo en tiras con ajo, pimentón y zumo de limón.',
      'Sirve el arroz con el brócoli y el pollo encima.',
      'Ralla limón sobre el plato antes de servir.',
    ],
  },
  {
    id: 'r4',
    title: 'Tortilla de espinacas y queso',
    subtitle: 'Cena · 1 ración',
    time: 12, kcal: 320, p: 28, c: 6, f: 20,
    tag: 'Cena',
    match: { uses: 4, total: 5 },
    img: { hue: 95, sat: 16 },
    why: 'Cena ligera, rica en proteína y baja en carbohidratos.',
    ingredients: [
      { name: 'Huevos',         qty: '3 ud',   have: true },
      { name: 'Espinacas baby', qty: '80 g',   have: true },
      { name: 'Queso fresco',   qty: '40 g',   have: true },
      { name: 'Aceite de oliva',qty: '1 cdta', have: true },
      { name: 'Pimienta negra', qty: 'al gusto', have: false },
    ],
    steps: [
      'Saltea las espinacas 1 minuto en una sartén caliente.',
      'Bate los huevos con sal y pimienta.',
      'Añade el huevo a la sartén, mueve el centro 30 segundos.',
      'Añade queso fresco desmenuzado y dobla.',
      'Sirve inmediatamente, aún jugosa por dentro.',
    ],
  },
  {
    id: 'r5',
    title: 'Pasta integral con garbanzos',
    subtitle: 'Comida · 2 raciones',
    time: 20, kcal: 510, p: 24, c: 72, f: 14,
    tag: 'Comida',
    match: { uses: 6, total: 6 },
    img: { hue: 28, sat: 22 },
    why: 'Combina dos fuentes vegetales para proteína completa.',
    ingredients: [
      { name: 'Pasta integral',   qty: '160 g', have: true },
      { name: 'Garbanzos cocidos',qty: '200 g', have: true },
      { name: 'Tomates en rama',  qty: '300 g', have: true },
      { name: 'Cebolla',          qty: '½ ud',  have: true },
      { name: 'Aceite de oliva',  qty: '2 cdas', have: true },
      { name: 'Albahaca fresca',  qty: '4 hojas', have: false },
    ],
    steps: [
      'Hierve la pasta al dente según paquete.',
      'Pocha cebolla picada en aceite 4 minutos.',
      'Añade tomates en cubos y cuece 8 minutos.',
      'Incorpora garbanzos y la pasta escurrida.',
      'Termina con albahaca y un hilo de aceite.',
    ],
  },
  {
    id: 'r6',
    title: 'Tostada de aguacate y huevo',
    subtitle: 'Desayuno · 1 ración',
    time: 10, kcal: 410, p: 20, c: 32, f: 22,
    tag: 'Desayuno',
    match: { uses: 5, total: 6 },
    img: { hue: 80, sat: 20 },
    why: 'Buenas grasas y proteína para empezar el día con energía.',
    ingredients: [
      { name: 'Pan integral',     qty: '2 reb.', have: true },
      { name: 'Aguacate',         qty: '½ ud',   have: true },
      { name: 'Huevo',            qty: '1 ud',   have: true },
      { name: 'Tomate',           qty: '1 ud',   have: true },
      { name: 'Aceite de oliva',  qty: '1 cdta', have: true },
      { name: 'Copos de chile',   qty: 'al gusto', have: false },
    ],
    steps: [
      'Tuesta el pan hasta que esté crujiente.',
      'Aplasta el aguacate con sal y unas gotas de limón.',
      'Pocha o fríe el huevo a tu gusto.',
      'Monta: pan, aguacate, tomate en rodajas, huevo encima.',
      'Termina con aceite y copos de chile.',
    ],
  },
];

export const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const MEALS = ['Desayuno', 'Comida', 'Snack', 'Cena'];

export const MEAL_PLAN = [
  ['r2', 'r3', 'snack-yogur',    'r4'],
  ['r6', 'r5', 'snack-fruta',    'r1'],
  ['r2', 'r1', 'snack-almendra', 'r4'],
  ['r6', 'r3', 'snack-yogur',    'r5'],
  ['r2', 'r5', 'snack-fruta',    'r1'],
  ['r6', 'r1', 'snack-almendra', 'r4'],
  ['r2', 'r3', 'snack-yogur',    'r5'],
];

export const SNACKS = {
  'snack-yogur':    { title: 'Yogur con arándanos', kcal: 160, time: 2, tag: 'Snack' },
  'snack-fruta':    { title: 'Plátano + almendras', kcal: 210, time: 1, tag: 'Snack' },
  'snack-almendra': { title: 'Puñado de almendras', kcal: 170, time: 1, tag: 'Snack' },
};

export const WORKOUT_WEEK = [
  { day: 'Lun', name: 'Empuje',    focus: 'Pecho · Hombro · Tríceps', duration: 55, exercises: 6, done: true },
  { day: 'Mar', name: 'Descanso',  focus: 'Movilidad · 20 min',       duration: 20, exercises: 0, rest: true, done: true },
  { day: 'Mié', name: 'Tirón',     focus: 'Espalda · Bíceps',         duration: 55, exercises: 6, done: true },
  { day: 'Jue', name: 'Pierna',    focus: 'Cuádriceps · Glúteo',      duration: 60, exercises: 6, today: true },
  { day: 'Vie', name: 'Full body', focus: 'Compuestos · Core',        duration: 50, exercises: 5 },
  { day: 'Sáb', name: 'Cardio',    focus: 'LISS 35 min · Z2',         duration: 35, exercises: 1 },
  { day: 'Dom', name: 'Descanso',  focus: 'Paseo + estiramientos',    duration: 20, exercises: 0, rest: true },
];

export const TODAY_WORKOUT = {
  name: 'Pierna',
  focus: 'Cuádriceps · Glúteo',
  duration: 60,
  exercises: [
    { id: 'e1', name: 'Sentadilla con barra',  sets: 4, reps: '8-10', rest: 120, weight: '60 kg', muscle: 'Cuádriceps' },
    { id: 'e2', name: 'Peso muerto rumano',    sets: 4, reps: '10',   rest: 90,  weight: '50 kg', muscle: 'Femoral' },
    { id: 'e3', name: 'Prensa de piernas 45º', sets: 3, reps: '12',  rest: 90,  weight: '120 kg', muscle: 'Cuádriceps' },
    { id: 'e4', name: 'Hip thrust',            sets: 3, reps: '12',   rest: 90,  weight: '70 kg', muscle: 'Glúteo' },
    { id: 'e5', name: 'Curl femoral tumbado',  sets: 3, reps: '12-15',rest: 60, weight: '25 kg', muscle: 'Femoral' },
    { id: 'e6', name: 'Elevación de gemelos',  sets: 4, reps: '15',   rest: 45,  weight: '40 kg', muscle: 'Gemelo' },
  ],
};

export const EXERCISE_DETAIL = {
  e1: {
    name: 'Sentadilla con barra',
    muscle: 'Cuádriceps · Glúteo · Core',
    equipment: 'Barra olímpica · Soporte',
    cues: [
      'Barra apoyada en el trapecio, no en la nuca.',
      'Pies a la anchura de hombros, puntas ligeramente abiertas.',
      'Inicia el movimiento llevando la cadera hacia atrás.',
      'Baja hasta romper paralela manteniendo torso firme.',
      'Empuja el suelo con todo el pie al subir.',
    ],
    history: [
      { date: '03 may', weight: 55, reps: 10 },
      { date: '06 may', weight: 57.5, reps: 10 },
      { date: '08 may', weight: 60, reps: 8 },
    ],
  },
};

export const USER = {
  name: 'Andrea',
  goal: 'lose',
  weight: 68.4,
  weightStart: 72.1,
  weightTarget: 64.0,
  height: 168,
  age: 29,
  sex: 'Mujer',
  activity: 'Moderada',
  streak: 12,
  kcalTarget: 1850,
  kcalToday: 1280,
  proteinTarget: 130,
  proteinToday: 92,
  waterTarget: 8,
  waterToday: 5,
  stepsToday: 7842,
  stepsTarget: 10000,
};
