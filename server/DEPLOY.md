# Deployment - Railway o Render

## Opción 1: Railway (recomendado)

1. Crear cuenta en railway.app
2. New Project → Deploy from GitHub repo
3. Añadir variables de entorno en Railway dashboard:

```
OPENAI_API_KEY=sk-proj-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_1TWNY42M99RmRwfgCj7Qbbic
SUPABASE_URL=https://rdwbycwsivmgpdptqlxo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PORT=3000
```

4. Railway detectará el Dockerfile automáticamente
5. Obtener la URL de producción del servidor

## Opción 2: Render

1. Crear cuenta en render.com
2. New → Web Service
3. Conectar repo de GitHub
4. Build command: `npm install`
5. Start command: `node index.js`
6. Añadir las mismas variables de entorno
7. Obtener la URL de producción

## Después del deploy

Actualizar `C:\Users\FDCV\Documents\coachFood\.env`:

```
EXPO_PUBLIC_API_URL=https://tu-backend-production.railway.app
```

## Verificar

```bash
curl https://tu-backend-production.railway.app/health
# Debe responder: {"status":"ok"}
```