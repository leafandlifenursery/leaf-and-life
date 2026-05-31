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
} from './cart.js';

const WHATSAPP_NUMBER = '919942093711';

// ── State ────────────────────────────────────────────────────
let cart = loadCart();

// ── DOM refs ─────────────────────────────────────────────────
const badge       = document.getElementById('cart-badge');
const cartToggle  = document.getElementById('cart-toggle');
const cartClose   = document.getElementById('cart-close');
const cartDrawer  = document.getElementById('cart-drawer');
const overlay     = document.getElementById('overlay');
const cartItems   = document.getElementById('cart-items');
const emptyMsg    = document.getElementById('cart-empty-msg');
const orderTotal  = document.getElementById('order-total');
const totalAmount = document.getElementById('total-amount');
const whatsappBtn = document.getElementById('whatsapp-btn');
const sentBanner  = document.getElementById('order-sent-banner');
const clearBtn    = document.getElementById('clear-cart-btn');

// ── Badge ─────────────────────────────────────────────────────
function updateBadge(animate = false) {
  const count = cartItemCount(cart);
  badge.textContent = count;
  badge.style.display = count === 0 ? 'none' : 'flex';
  if (animate) {
    badge.classList.remove('bounce');
    void badge.offsetWidth;
    badge.classList.add('bounce');
  }
}

// ── Drawer render ─────────────────────────────────────────────
function renderDrawer() {
  const isEmpty = cart.length === 0;
  emptyMsg.hidden = !isEmpty;
  orderTotal.hidden = isEmpty;
  whatsappBtn.disabled = isEmpty;
  whatsappBtn.title = isEmpty ? 'Add items to your cart first' : '';
  sentBanner.hidden = true;

  cartItems.querySelectorAll('.cart-item').forEach(el => el.remove());

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-size">${item.size}</div>
        <div class="cart-item-price">₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" data-action="dec" data-id="${item.id}" data-size="${item.size}" aria-label="Decrease quantity">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn" data-action="inc" data-id="${item.id}" data-size="${item.size}" aria-label="Increase quantity">+</button>
      </div>
      <button class="remove-btn" data-id="${item.id}" data-size="${item.size}">Remove</button>
    `;
    cartItems.appendChild(row);
  });

  if (!isEmpty) {
    totalAmount.textContent = `₹${cartTotal(cart)}`;
  }
}

// ── Open / close drawer ───────────────────────────────────────
function openDrawer() {
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderDrawer();
}

function closeDrawer() {
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ── Event: open / close ───────────────────────────────────────
cartToggle.addEventListener('click', openDrawer);
cartClose.addEventListener('click', closeDrawer);
overlay.addEventListener('click', closeDrawer);

// ── Event: tab filtering ──────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.setAttribute('aria-selected', 'false'));
    btn.setAttribute('aria-selected', 'true');
    const activeCategory = btn.dataset.tab;
    document.querySelectorAll('#product-grid .grid-item').forEach(item => {
      item.hidden = item.dataset.category !== activeCategory;
    });
  });
});

// ── Event: Add to Cart ────────────────────────────────────────
document.querySelectorAll('.product-card').forEach(card => {
  const btn = card.querySelector('.add-to-cart-btn');
  btn.addEventListener('click', () => {
    const sizeEl = card.querySelector('.size-select, .size-single');
    const size = sizeEl.tagName === 'SELECT' ? sizeEl.value : sizeEl.textContent.trim();
    cart = addToCart(cart, {
      id:    card.dataset.id,
      name:  card.dataset.name,
      price: Number(card.dataset.price),
      size,
    });
    saveCart(cart);
    updateBadge(true);
    btn.classList.remove('pulse');
    void btn.offsetWidth;
    btn.classList.add('pulse');
  });
});

// ── Event: quantity controls + remove (delegated) ─────────────
cartItems.addEventListener('click', e => {
  const id   = e.target.dataset.id;
  const size = e.target.dataset.size;
  if (!id) return;

  if (e.target.classList.contains('qty-btn')) {
    const current = cart.find(i => i.id === id && i.size === size);
    if (!current) return;
    const delta = e.target.dataset.action === 'inc' ? 1 : -1;
    cart = updateQuantity(cart, id, size, current.quantity + delta);
    saveCart(cart);
    updateBadge();
    renderDrawer();
  }

  if (e.target.classList.contains('remove-btn')) {
    cart = removeFromCart(cart, id, size);
    saveCart(cart);
    updateBadge();
    renderDrawer();
  }
});

// ── Event: WhatsApp send ──────────────────────────────────────
whatsappBtn.addEventListener('click', () => {
  if (cart.length === 0) return;
  const msg = buildWhatsAppMessage(cart);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  sentBanner.hidden = false;
});

// ── Event: Clear cart ─────────────────────────────────────────
clearBtn.addEventListener('click', () => {
  cart = clearCart();
  saveCart(cart);
  updateBadge();
  renderDrawer();
});

// ── Init ──────────────────────────────────────────────────────
updateBadge();

// Filter to first tab (Plastic) on load
document.querySelector('[data-tab="plastic"]').click();
