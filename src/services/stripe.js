import { supabase } from '../lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export async function createCheckoutSession() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('No hay sesión activa');

  const response = await fetch(`${API_URL}/api/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Error al crear sesión de pago');
  }
  return response.json();
}
