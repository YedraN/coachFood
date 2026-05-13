# CoachFood — Setup & Build Guide

## Requisitos previos

- Node.js v18+ y npm
- Expo CLI: `npm install -g expo-cli`
- EAS CLI para builds: `npm install -g eas-cli` (opcional, solo para publicar en tiendas)
- Cuenta en [OpenAI Platform](https://platform.openai.com) para API key

## Setup Local

### 1. Instalar dependencias

#### App (React Native/Expo)
```bash
npm install
```

#### Backend (servidor Node.js)
```bash
cd server
npm install
cp .env.example .env
```

Edita `server/.env` y añade tu API key de OpenAI:
```
OPENAI_API_KEY=sk-proj-xxx...
PORT=3000
```

Obtén tu clave aquí: https://platform.openai.com/api-keys

### 2. Configurar variables de entorno de la app
```bash
cp .env.example .env
```

Deja `EXPO_PUBLIC_API_URL=http://localhost:3000` para desarrollo local.

### 3. Ejecutar la app y el servidor

#### En Terminal 1: Inicia el servidor backend
```bash
cd server
npm run dev
```

Deberías ver:
```
Servidor corriendo en puerto 3000
Health check: http://localhost:3000/health
```

#### En Terminal 2: Inicia la app Expo
```bash
npm start
```

Luego:
- Presiona `w` para abrir en navegador (web)
- Presiona `i` para abrir en simulador iOS
- Presiona `a` para abrir en simulador Android
- O escanea el QR con la app Expo Go en tu teléfono real

## Testing en el MVP

### Flujos principales para probar:

1. **Onboarding**: Completar los 4 pasos, ver que se calculan macros correctamente
2. **HomeScreen**: 
   - Fecha y día deben ser hoy
   - Comidas deben coincidir con el plan del día actual
   - Marcar comidas como hecha debe actualizar los rings
3. **Scan & Pantry**:
   - Escanear un código de barras (ej: cualquier producto de supermercado)
   - Ver que aparece en la despensa
4. **Recetas IA**:
   - Con productos escaneados, ir a Recetas
   - Ver botón "Generar con IA"
   - Hacer click → debería mostrar paywall
5. **Paywall**:
   - Hacer click "Probar 7 días gratis"
   - Volver a Recetas y generar recetas con IA
   - Ver recetas con badge "✨ IA"
6. **Logout**:
   - Ir a Perfil → Cerrar sesión
   - Confirmar que vuelve a Onboarding

## Build para publicar

### Android (APK para testing)

```bash
# Instalar EAS CLI si aún no lo hiciste
npm install -g eas-cli

# Inicializar proyecto (solo primera vez)
eas build:configure

# Build para testing (APK)
eas build --platform android --profile preview

# Build para Google Play Store
eas build --platform android --profile production
```

El APK se descargará a tu computadora. Puedes instalarlo en un teléfono Android sin Google Play.

### iOS (requiere macOS y cuenta Apple Developer)

```bash
# Build para TestFlight
eas build --platform ios --profile preview

# Build para App Store
eas build --platform ios --profile production
```

Requiere:
- Apple Developer Account (€99/año)
- Provisioning profiles configurados en Expo

## Variables de entorno en builds

### App (Expo)
Para que los builds de la app tengan acceso a `EXPO_PUBLIC_API_URL` (URL del backend en producción):

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL
# Ingresa: https://tu-backend-produccion.com
```

### Backend (Node.js)
El backend necesita `OPENAI_API_KEY` en el servidor de producción. Guárdalo como variable de entorno en tu servicio de hosting (Heroku, Vercel, Railway, etc.)

**Nunca commitees `.env` con credenciales reales a git.**

## Deploy a tiendas

### Google Play Store
1. Crear cuenta Google Play Developer ($25 one-time)
2. Crear proyecto en Google Play Console
3. Crear signing key
4. Hacer build con EAS
5. Subir a Play Store Console

### App Store
1. Apple Developer Account ($99/year)
2. Crear app en App Store Connect
3. Hacer build con EAS
4. Subir a App Store Connect
5. Hacer review

## Troubleshooting

### Error: "Cannot connect to API" o recetas no se generan
- Verifica que el servidor backend está corriendo: `cd server && npm run dev`
- Verifica que `EXPO_PUBLIC_API_URL` en `.env` es correcto (debe ser `http://localhost:3000` para desarrollo)
- Verifica que `server/.env` tiene `OPENAI_API_KEY` configurado
- Abre http://localhost:3000/health en el navegador para confirmar que el servidor responde

### Error: "Camera permission denied"
- iOS: Verifica que `NSCameraUsageDescription` en `app.json` es correcto
- Android: La app debe tener `android.permission.CAMERA` en el manifest

### Build falla con "JavaScript syntax error"
- Revisa que todos los `import` son correctos
- Ejecuta `npx tsc --noEmit` para verificar tipos

## Stack técnico

- **Framework**: React Native + Expo
- **UI**: Componentes custom con StyleSheet
- **State**: Context API + AsyncStorage
- **IA**: OpenAI API (gpt-4o-mini)
- **Camera**: expo-camera (escaneo de códigos)
- **Auth**: Local (AsyncStorage) — sin backend real en MVP
- **Versión**: 1.0.0 (MVP)

## Licencia

Privado — No distribuir sin permiso.
