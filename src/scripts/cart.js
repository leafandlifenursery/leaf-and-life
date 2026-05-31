const STORAGE_KEY = 'leaf-and-life-cart';

export function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function addToCart(cart, { id, name, size, price }) {
  const existing = cart.find(item => item.id === id && item.size === size);
  if (existing) {
    return cart.map(item =>
      item.id === id && item.size === size
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  }
  return [...cart, { id, name, size, price, quantity: 1 }];
}

export function removeFromCart(cart, id, size) {
  return cart.filter(item => !(item.id === id && item.size === size));
}

export function updateQuantity(cart, id, size, quantity) {
  if (quantity <= 0) return removeFromCart(cart, id, size);
  return cart.map(item =>
    item.id === id && item.size === size ? { ...item, quantity } : item
  );
}

export function clearCart() {
  localStorage.removeItem(STORAGE_KEY);
  return [];
}

export function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartItemCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function buildWhatsAppMessage(cart) {
  const lines = cart.map((item, i) =>
    `${i + 1}. ${item.name} – ${item.size} – ₹${item.price} x ${item.quantity}`
  );
  const totalItems = cartItemCount(cart);
  const total = cartTotal(cart);
  return [
    'Hello Leaf & Life! 🌿',
    '',
    "I'd like to order the following:",
    '',
    ...lines,
    '',
    `Total items: ${totalItems}`,
    `Total: ₹${total}`,
    '',
    'Please confirm availability and delivery details.',
  ].join('\n');
}
