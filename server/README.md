# Backend Server - CoachFood

API backend Node.js/Express para generar recetas con OpenAI.

## Descripción

Este servidor maneja las llamadas a la API de OpenAI para la generación de recetas personalizadas. Se comunica con la app mobile React Native/Expo mediante REST API.

## Por qué existe

La app mobile (React Native/Expo) no puede usar directamente las SDK de Node.js porque React Native no tiene acceso a APIs de Node.js. El servidor encapsula toda la lógica de IA en el backend y permite escalar la generación de recetas sin cargar la app mobile.

## Setup

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` y añade tu API key de OpenAI (obtén una en https://platform.openai.com/api-keys):
```
OPENAI_API_KEY=sk-proj-xxx...
PORT=3000
```

### 3. Ejecutar el servidor

**Desarrollo** (con auto-reload):
```bash
npm run dev
```

**Producción**:
```bash
npm start
```

Deberías ver:
```
Servidor corriendo en puerto 3000
Health check: http://localhost:3000/health
```

## Endpoints

### POST `/api/generate-recipes`

Genera recetas personalizadas basadas en ingredientes y objetivos del usuario.

**Request:**
```json
{
  "pantry": [
    { "name": "Pollo", "qty": "500g", "kcal": 165, "protein": 31 },
    { "name": "Arroz", "qty": "200g", "kcal": 130, "protein": 2.7 }
  ],
  "user": {
    "kcalTarget": 2000,
    "proteinTarget": 150,
    "goal": "gain"
  }
}
```

**Response:**
```json
{
  "recipes": [
    {
      "id": "ai-recipe-1234567890-0",
      "title": "Pollo al Horno con Arroz",
      "subtitle": "Proteína · 1 porción",
      "time": 30,
      "kcal": 450,
      "p": 42,
      "c": 35,
      "f": 8,
      "tag": "Comida",
      "match": { "uses": 2, "total": 2 },
      "img": { "hue": 120, "sat": 20 },
      "why": "Alto en proteína para ganar músculo",
      "ingredients": [],
      "steps": [],
      "isAI": true
    }
  ]
}
```

### GET `/health`

Health check para verificar que el servidor está activo.

**Response:**
```json
{ "status": "ok" }
```

## Deploy

### Railway (recomendado)
1. Conectar repo en Railway
2. Añadir variable de entorno `OPENAI_API_KEY`
3. Deploy automático

### Heroku
```bash
git push heroku main
```

## Estructura

```
server/
├── index.js          # Servidor Express y endpoints
├── package.json      # Dependencias
├── .env.example      # Variables de entorno (plantilla)
└── README.md         # Este archivo
```

## Troubleshooting

**Error: "Cannot find module 'openai'"**
- Ejecuta `npm install`

**Error: "OPENAI_API_KEY is not defined"**
- Verifica que `server/.env` existe y tiene la variable configurada
- Verifica que estás en el directorio `server/` antes de ejecutar

**Error: "Port 3000 already in use"**
- Usa un puerto diferente: `PORT=3001 npm run dev`

**API returns 500 error**
- Revisa la consola para ver el error específico
- Verifica que la API key es válida en https://platform.openai.com/api-keys
