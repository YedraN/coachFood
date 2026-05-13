import { supabase } from '../lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('No hay sesión activa');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export async function generateRecipes(pantry, user) {
  if (!user || !pantry || pantry.length === 0) {
    throw new Error('Se necesita usuario y despensa con ingredientes');
  }

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/generate-recipes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ pantry, user }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al generar recetas');
  }

  const data = await response.json();
  return data.recipes;
}
