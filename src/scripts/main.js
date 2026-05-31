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

const cartUIReady = badge && cartToggle && cartClose && cartDrawer && overlay && cartItems && whatsappBtn;

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

    const info = document.createElement('div');
    info.className = 'cart-item-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'cart-item-name';
    nameEl.textContent = item.name;

    const sizeEl = document.createElement('div');
    sizeEl.className = 'cart-item-size';
    sizeEl.textContent = item.size;

    const priceEl = document.createElement('div');
    priceEl.className = 'cart-item-price';
    priceEl.textContent = `₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}`;

    info.append(nameEl, sizeEl, priceEl);

    const controls = document.createElement('div');
    controls.className = 'qty-controls';

    const decBtn = document.createElement('button');
    decBtn.className = 'qty-btn';
    decBtn.dataset.action = 'dec';
    decBtn.dataset.id = item.id;
    decBtn.dataset.size = item.size;
    decBtn.setAttribute('aria-label', 'Decrease quantity');
    decBtn.textContent = '−';

    const qtyVal = document.createElement('span');
    qtyVal.className = 'qty-value';
    qtyVal.textContent = item.quantity;

    const incBtn = document.createElement('button');
    incBtn.className = 'qty-btn';
    incBtn.dataset.action = 'inc';
    incBtn.dataset.id = item.id;
    incBtn.dataset.size = item.size;
    incBtn.setAttribute('aria-label', 'Increase quantity');
    incBtn.textContent = '+';

    controls.append(decBtn, qtyVal, incBtn);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.dataset.id = item.id;
    removeBtn.dataset.size = item.size;
    removeBtn.textContent = 'Remove';

    row.append(info, controls, removeBtn);
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

// ── Event: tab filtering ──────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.setAttribute('aria-selected', 'false'));
    btn.setAttribute('aria-selected', 'true');
    const activeCategory = btn.dataset.tab;
    let visibleCount = 0;
    document.querySelectorAll('#product-grid .grid-item').forEach(item => {
      item.hidden = item.dataset.category !== activeCategory;
      if (!item.hidden) visibleCount++;
    });
    const emptyState = document.getElementById('empty-state');
    if (emptyState) emptyState.hidden = visibleCount > 0;
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

if (cartUIReady) {
  // ── Event: open / close ─────────────────────────────────────
  cartToggle.addEventListener('click', openDrawer);
  cartClose.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // ── Event: quantity controls + remove (delegated) ───────────
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

  // ── Event: WhatsApp send ────────────────────────────────────
  whatsappBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    const msg = buildWhatsAppMessage(cart);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    sentBanner.hidden = false;
  });

  // ── Event: Clear cart ───────────────────────────────────────
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      cart = clearCart();
      saveCart(cart);
      updateBadge();
      renderDrawer();
    });
  }

  // ── Init ────────────────────────────────────────────────────
  updateBadge();
} else {
  console.warn('Leaf & Life: cart UI elements missing, cart disabled');
}

// Filter to first tab (Plastic) on load
document.querySelector('[data-tab="plastic"]').click();
