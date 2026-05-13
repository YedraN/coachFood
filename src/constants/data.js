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
