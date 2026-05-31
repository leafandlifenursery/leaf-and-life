import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCart,
  saveCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  cartTotal,
  cartItemCount,
  buildWhatsAppMessage,
} from '../src/scripts/cart.js';

const STORAGE_KEY = 'leaf-and-life-cart';

beforeEach(() => {
  localStorage.clear();
});

describe('loadCart', () => {
  it('returns empty array when nothing stored', () => {
    expect(loadCart()).toEqual([]);
  });
  it('returns stored cart', () => {
    const cart = [{ id: 'a', name: 'A', size: '5"', price: 100, quantity: 1 }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    expect(loadCart()).toEqual(cart);
  });
});

describe('addToCart', () => {
  it('adds new item to empty cart', () => {
    const cart = addToCart([], { id: 'a', name: 'A', size: '5"', price: 100 });
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
  });
  it('increments quantity when same id+size already in cart', () => {
    let cart = addToCart([], { id: 'a', name: 'A', size: '5"', price: 100 });
    cart = addToCart(cart, { id: 'a', name: 'A', size: '5"', price: 100 });
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });
  it('adds separate item for same id but different size', () => {
    let cart = addToCart([], { id: 'a', name: 'A', size: '5"', price: 100 });
    cart = addToCart(cart, { id: 'a', name: 'A', size: '6"', price: 120 });
    expect(cart).toHaveLength(2);
  });
});

describe('removeFromCart', () => {
  it('removes item by id+size key', () => {
    let cart = addToCart([], { id: 'a', name: 'A', size: '5"', price: 100 });
    cart = removeFromCart(cart, 'a', '5"');
    expect(cart).toHaveLength(0);
  });
});

describe('updateQuantity', () => {
  it('updates quantity', () => {
    let cart = addToCart([], { id: 'a', name: 'A', size: '5"', price: 100 });
    cart = updateQuantity(cart, 'a', '5"', 3);
    expect(cart[0].quantity).toBe(3);
  });
  it('removes item when quantity set to 0', () => {
    let cart = addToCart([], { id: 'a', name: 'A', size: '5"', price: 100 });
    cart = updateQuantity(cart, 'a', '5"', 0);
    expect(cart).toHaveLength(0);
  });
});

describe('cartTotal', () => {
  it('sums price * quantity across all items', () => {
    let cart = addToCart([], { id: 'a', name: 'A', size: '5"', price: 100 });
    cart = addToCart(cart, { id: 'b', name: 'B', size: '6"', price: 200 });
    cart = updateQuantity(cart, 'a', '5"', 2);
    expect(cartTotal(cart)).toBe(400);
  });
});

describe('cartItemCount', () => {
  it('sums quantity across all items', () => {
    let cart = addToCart([], { id: 'a', name: 'A', size: '5"', price: 100 });
    cart = addToCart(cart, { id: 'b', name: 'B', size: '6"', price: 200 });
    cart = updateQuantity(cart, 'b', '6"', 3);
    expect(cartItemCount(cart)).toBe(4);
  });
});

describe('buildWhatsAppMessage', () => {
  it('formats order message correctly', () => {
    const cart = [
      { id: 'a', name: 'Round Planter', size: '7cm', price: 149, quantity: 2 },
      { id: 'b', name: 'Square Planter', size: '10"', price: 299, quantity: 1 },
    ];
    const msg = buildWhatsAppMessage(cart);
    expect(msg).toContain('Hello Leaf & Life');
    expect(msg).toContain('Round Planter');
    expect(msg).toContain('₹149 x 2');
    expect(msg).toContain('Square Planter');
    expect(msg).toContain('₹299 x 1');
    expect(msg).toContain('Total: ₹597');
  });
});
