import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.use(cors());

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

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (!userId) return res.json({ received: true });

      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

      await supabase.from('profiles').update({
        is_premium: true,
        premium_expires_at: expiresAt,
        stripe_customer_id: session.customer,
      }).eq('id', userId);
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      if (!invoice.subscription) return res.json({ received: true });

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', invoice.customer)
        .single();

      if (profile) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
        await supabase.from('profiles').update({
          is_premium: true,
          premium_expires_at: expiresAt,
        }).eq('id', profile.id);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', subscription.customer)
        .single();

      if (profile) {
        await supabase.from('profiles').update({
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
app.post('/api/create-checkout-session', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId requerido' });

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

// ── AI recipe generation ─────────────────────────────────────────────────────
app.post('/api/generate-recipes', async (req, res) => {
  try {
    const { pantry, user } = req.body;

    if (!user || !pantry || pantry.length === 0) {
      return res.status(400).json({ error: 'Se necesita usuario y despensa con ingredientes' });
    }

    const ingredientsList = pantry
      .map((item) => `${item.name} (${item.qty}, ${item.kcal}kcal, ${item.protein}g prot)`)
      .join('\n');

    const prompt = `Eres un nutricionista experto. Basándote en los ingredientes disponibles y los objetivos macronutricionales del usuario, genera exactamente 3 recetas personalizadas y equilibradas.

INGREDIENTES DISPONIBLES:
${ingredientsList}

OBJETIVOS DEL USUARIO:
- Calorías objetivo: ${user.kcalTarget} kcal/día
- Proteína objetivo: ${user.proteinTarget}g/día
- Objetivo: ${user.goal === 'lose' ? 'Perder peso' : user.goal === 'gain' ? 'Ganar músculo' : 'Mantener peso'}

Responde SOLO con un JSON válido (sin markdown, sin explicaciones) con este formato exacto:
{
  "recipes": [
    {
      "title": "nombre de la receta",
      "subtitle": "tipo · porciones",
      "time": 20,
      "kcal": 420,
      "p": 35,
      "c": 42,
      "f": 12,
      "tag": "Desayuno|Comida|Cena",
      "why": "una frase corta explicando por qué es buena para el usuario",
      "ingredients": [
        {"name": "ingrediente", "qty": "100g", "have": true}
      ],
      "steps": ["paso 1", "paso 2"]
    }
  ]
}

REGLAS: Usa SOLO ingredientes de la lista. Genera exactamente 3 recetas diferentes.`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return res.status(500).json({ error: 'Respuesta inesperada de la API' });
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'No se encontró JSON válido en la respuesta' });
    }

    const data = JSON.parse(jsonMatch[0]);
    const recipes = (data.recipes || []).map((r, i) => ({
      id: `ai-recipe-${Date.now()}-${i}`,
      title: r.title,
      subtitle: r.subtitle || 'Receta IA',
      time: r.time || 20,
      kcal: r.kcal || 400,
      p: r.p || 20,
      c: r.c || 40,
      f: r.f || 15,
      tag: r.tag || 'Comida',
      match: { uses: pantry.length, total: pantry.length },
      img: { hue: Math.floor(Math.random() * 360), sat: 20 },
      why: r.why || 'Receta personalizada generada con IA',
      ingredients: r.ingredients || [],
      steps: r.steps || ['Preparar', 'Cocinar', 'Servir'],
      isAI: true,
    }));

    res.json({ recipes });
  } catch (error) {
    console.error('Error generando recetas con IA:', error);
    res.status(500).json({ error: `Error al generar recetas: ${error.message}` });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
