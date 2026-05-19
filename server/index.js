import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { generateWorkoutPlan as localWorkoutGen } from './workoutGenerator.js';
import { generateRecipesLocally } from './recipeGenerator.js';

dotenv.config();

const REQUIRED_ENV = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('Missing required env vars:', missing.join(', '));
  process.exit(1);
}
if (!process.env['SUPABASE_SERVICE_ROLE_KEY']) {
  console.warn('⚠ SUPABASE_SERVICE_ROLE_KEY no está configurada. Webhooks de Stripe y operaciones admin no funcionarán.');
}
process.on('unhandledRejection', (reason) => { console.error('Unhandled Rejection:', reason); });
process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); });

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = process.env['SUPABASE_SERVICE_ROLE_KEY']
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { realtime: { transport: ws } })
  : null;

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://10.0.2.2:3000'];

app.use(cors({ origin: ALLOWED_ORIGINS }));

const checkoutLimiter = rateLimit({ windowMs: 60_000, max: 5, standardHeaders: true, legacyHeaders: false });

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    const resp = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY },
    });
    if (!resp.ok) return res.status(401).json({ error: 'Token inválido' });
    req.user = await resp.json();
    next();
  } catch (err) {
    console.error('requireAuth error:', err.message);
    res.status(500).json({ error: 'Error de autenticación' });
  }
}

// Webhook needs raw body — register before express.json()
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (!supabaseAdmin) {
    console.warn('Webhook ignorado: SUPABASE_SERVICE_ROLE_KEY no configurada');
    return res.json({ received: true });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (!userId) return res.json({ received: true });

      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

      await supabaseAdmin.from('profiles').update({
        is_premium: true,
        premium_expires_at: expiresAt,
        stripe_customer_id: session.customer,
      }).eq('id', userId);
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      if (!invoice.subscription) return res.json({ received: true });

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', invoice.customer)
        .single();

      if (profile) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
        await supabaseAdmin.from('profiles').update({
          is_premium: true,
          premium_expires_at: expiresAt,
        }).eq('id', profile.id);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', subscription.customer)
        .single();

      if (profile) {
        await supabaseAdmin.from('profiles').update({
          is_premium: false,
          premium_expires_at: null,
        }).eq('id', profile.id);
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  res.json({ received: true });
});

app.use(express.json());

// ── Stripe checkout session ──────────────────────────────────────────────────
app.post('/api/create-checkout-session', checkoutLimiter, requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: 'coachfood://premium/success',
      cancel_url: 'coachfood://premium/cancel',
      metadata: { userId },
      locale: 'es',
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'No se pudo crear la sesión de pago' });
  }
});

// ── Recipe generation (local, no AI needed) ─────────────────────
app.post('/api/generate-recipes', requireAuth, async (req, res) => {
  try {
    const { pantry, user } = req.body;

    if (!user || !pantry || pantry.length === 0) {
      return res.status(400).json({ error: 'Se necesita usuario y despensa con ingredientes' });
    }

    const result = generateRecipesLocally({ pantry, user });
    res.json(result);
  } catch (error) {
    console.error('Error generando recetas:', error);
    res.status(500).json({ error: `Error al generar recetas: ${error.message}` });
  }
});

// ── Workout plan generation (local, no OpenAI needed) ──────────

app.post('/api/generate-workout', requireAuth, async (req, res) => {
  try {
    const { goal, level, days, equipment } = req.body;

    if (!goal || !level || !days) {
      return res.status(400).json({ error: 'Faltan datos: goal, level, days' });
    }

    const { workouts } = localWorkoutGen({ goal, level, days, equipment });

    const mapped = workouts.map((w, i) => ({
      id: `gen-${Date.now()}-${i}`,
      name: w.name,
      focus: w.focus,
      duration: Math.round(w.duration / 5) * 5,
      exercises: (w.exercises || []).map((e, j) => ({
        id: `ex-${j}`,
        name: e.name,
        muscle: e.muscle,
        sets: e.sets,
        reps: e.reps,
        rest: e.rest,
      })),
    }));

    res.json({ workouts: mapped });
  } catch (error) {
    console.error('Error generando workout:', error);
    res.status(500).json({ error: `Error al generar workout: ${error.message}` });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
server.on('error', (err) => {
  console.error('Error al iniciar servidor:', err.message);
  process.exit(1);
});
