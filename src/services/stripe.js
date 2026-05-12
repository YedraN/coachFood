const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export async function createCheckoutSession(userId) {
  const response = await fetch(`${API_URL}/api/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Error al crear sesión de pago');
  }
  return response.json();
}
