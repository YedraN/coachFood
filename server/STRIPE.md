# Configuración de Stripe

## 1. Obtener credenciales

1. Ve a [Dashboard de Stripe](https://dashboard.stripe.com/apikeys)
2. Copia **Secret Key** (pk_live_...) → `STRIPE_SECRET_KEY` en server/.env

## 2. Verificar/crear producto

1. Ve a [Products](https://dashboard.stripe.com/products)
2. Si no existe, crear nuevo:
   - Name: "CoachFood Premium"
   - Price: $9.99/month (o el precio que quieras)
   - Recurring: Monthly
3. Copia el **Price ID** (price_xxx) → `STRIPE_PRICE_ID` en server/.env
   - Ya configurado: `price_1TWNY42M99RmRwfgCj7Qbbic`

## 3. Configurar Webhook

1. Ve a [Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint:
   - URL: `https://<tu-backend>/api/webhook`
   - Events a seleccionar:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.deleted`
3. Click en el webhook creado → Reveal secret
4. Copia el signing secret → `STRIPE_WEBHOOK_SECRET` en server/.env

## 4. Testing local (Stripe CLI)

```bash
# Instalar Stripe CLI
winget install stripe.stripe-cli

# Login
stripe login

# Reenviar webhooks a localhost
stripe listen --forward-to localhost:3000/api/webhook

# Copiar el webhook secret que muestra (whsec_xxx)
# Usar ese valor para STRIPE_WEBHOOK_SECRET en desarrollo
```

## 5. Testing con tarjetas

Tarjetas de test de Stripe:
- **Aprobado**: 4242 4242 4242 4242
- **Rechazado**: 4000 0000 0000 0002
- **Requiere autenticación**: 4000 0025 0000 3155

Fecha futura cualquier fecha (12/28), CVC cualquier 3 dígitos.

## 6. URLs de deep link

El checkout usa:
- Success: `coachfood://premium/success`
- Cancel: `coachfood://premium/cancel`

Asegúrate de que estén configurados en app.json.

## 7. Verificar funcionamiento

```bash
# Con Stripe CLI escuchando
stripe listen --forward-to localhost:3000/api/webhook

# Hacer una compra de test desde la app
# Ver los eventos en la terminal
```