const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export async function generateRecipes(pantry, user) {
  if (!user || !pantry || pantry.length === 0) {
    throw new Error('Se necesita usuario y despensa con ingredientes');
  }

  try {
    const response = await fetch(`${API_URL}/api/generate-recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pantry, user }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al generar recetas');
    }

    const data = await response.json();
    return data.recipes;
  } catch (error) {
    console.error('Error generando recetas con IA:', error);
    throw new Error(`Error al generar recetas: ${error.message}`);
  }
}
