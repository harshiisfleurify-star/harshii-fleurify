// ===== PRODUCT DATA LAYER =====
// Products can use browser-local storage or a shared Supabase database.

// ===== CATEGORY MAP =====
const CATEGORY_LABELS = {
  bouquet: 'Bouquet',
  birthday: 'Birthday Special',
  wedding: 'Special Occasion',
  festival: 'Festival'
};

// ===== DEFAULT PRODUCTS (seeded on first load) =====
const DEFAULT_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Handmade Rose Bouquet',
    description: 'Beautiful wool roses handcrafted with love, wrapped in elegant craft paper.',
    price: 999,
    original_price: 1499,
    image: 'images/rose-bouquet.jpg',
    category: 'bouquet',
    badge: 'Bestseller',
    available: true,
    created_at: Date.now()
  },
  {
    id: 'prod_2',
    name: 'Midnight Elegance Bouquet',
    description: 'Stunning handmade wool roses in black matte wrapping with satin ribbon.',
    price: 2499,
    original_price: 3499,
    image: 'images/premium.jpg',
    category: 'bouquet',
    badge: 'Premium',
    available: true,
    created_at: Date.now()
  },
  {
    id: 'prod_3',
    name: 'Exotic Orchid & Lily Vase',
    description: 'Handcrafted wool orchids and lilies in a premium glass vase.',
    price: 1799,
    original_price: 2299,
    image: 'images/exotic.jpg',
    category: 'bouquet',
    badge: '',
    available: true,
    created_at: Date.now()
  },
  {
    id: 'prod_4',
    name: 'Birthday Sunshine Gift Box',
    description: 'Vibrant handmade flowers in a premium gift box with personalized card.',
    price: 1299,
    original_price: 1799,
    image: 'images/birthday.jpg',
    category: 'birthday',
    badge: 'Popular',
    available: true,
    created_at: Date.now()
  },
  {
    id: 'prod_5',
    name: 'Custom Celebration Package',
    description: 'Bespoke handmade wool flower arrangements for your special moments.',
    price: 2500,
    original_price: 0,
    image: 'images/wedding.jpg',
    category: 'wedding',
    badge: 'Custom',
    available: true,
    created_at: Date.now()
  },
  {
    id: 'prod_6',
    name: 'Festival Special Gift Set',
    description: 'Handmade flower arrangements perfect for Diwali, Navratri and festive gifting.',
    price: 599,
    original_price: 899,
    image: 'images/festival.jpg',
    category: 'festival',
    badge: 'Festive',
    available: true,
    created_at: Date.now()
  },
  {
    id: 'prod_7',
    name: 'Garden Fresh Flower Basket',
    description: 'Mixed handmade wool flowers in a beautiful handwoven basket.',
    price: 1199,
    original_price: 1599,
    image: 'images/basket.jpg',
    category: 'bouquet',
    badge: '',
    available: true,
    created_at: Date.now()
  },
  {
    id: 'prod_8',
    name: 'Grand Celebration Bouquet',
    description: 'A luxurious handmade mix of wool roses, peonies and lilies.',
    price: 2999,
    original_price: 3999,
    image: 'images/hero.jpg',
    category: 'birthday',
    badge: 'Grand',
    available: true,
    created_at: Date.now()
  }
];

// ===== SHARED DATABASE CONFIGURATION =====
// Set these two values after creating a Supabase project. Never use a service_role key here.
const PRODUCTS_BACKEND = 'supabase'; // Shared Supabase database enabled.
const SUPABASE_URL = 'https://cfehtdlsranapckfdpig.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wJwYnSbJdODrkEqXqwr2fA_NhVnhDcB';
const PRODUCTS_KEY = 'fleurify_products';

function _lsGetProducts() {
  const data = localStorage.getItem(PRODUCTS_KEY);
  if (!data) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  try { return JSON.parse(data); } catch (_) { return DEFAULT_PRODUCTS; }
}
function _lsSaveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}
function _supabaseReady() {
  return PRODUCTS_BACKEND === 'supabase' && SUPABASE_URL && SUPABASE_ANON_KEY;
}
async function _sbRequest(path, options = {}) {
  if (!_supabaseReady()) throw new Error('Shared database is not configured. Add the Supabase URL and anon key in products-data.js.');
  const response = await fetch(SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/' + path, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error('Database request failed (' + response.status + '): ' + detail);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
async function _sbGetProducts() {
  return await _sbRequest('products?select=*&order=created_at.desc');
}

// PUBLIC PRODUCT API. Supabase mode is shared across all devices; local mode is browser-only.
const ProductStore = {
  getAll: function() {
    if (_supabaseReady()) return _sbGetProducts();
    return _lsGetProducts();
  },
  getById: function(id) {
    if (_supabaseReady()) return _sbRequest('products?id=eq.' + encodeURIComponent(id) + '&select=*&limit=1').then(rows => rows[0] || null);
    return _lsGetProducts().find(p => p.id === id) || null;
  },
  add: function(product) {
    const item = { ...product, id: 'prod_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), created_at: Date.now() };
    if (_supabaseReady()) return _sbRequest('products', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(item) }).then(rows => rows[0] || item);
    const products = _lsGetProducts(); products.push(item); _lsSaveProducts(products); return item;
  },
  update: function(id, updates) {
    if (_supabaseReady()) return _sbRequest('products?id=eq.' + encodeURIComponent(id), { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(updates) }).then(rows => rows[0] || null);
    const products = _lsGetProducts(); const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updates }; _lsSaveProducts(products); return products[idx];
  },
  delete: function(id) {
    if (_supabaseReady()) return _sbRequest('products?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
    _lsSaveProducts(_lsGetProducts().filter(p => p.id !== id));
  },
  getByCategory: function(category) {
    const get = this.getAll();
    const filter = products => category === 'all' ? products.filter(p => p.available) : products.filter(p => p.category === category && p.available);
    return get && typeof get.then === 'function' ? get.then(filter) : filter(get);
  },
  getAvailable: function() {
    const get = this.getAll();
    const filter = products => products.filter(p => p.available);
    return get && typeof get.then === 'function' ? get.then(filter) : filter(get);
  },
  resetToDefaults: function() {
    if (_supabaseReady()) return _sbRequest('products?id=not.is.null', { method: 'DELETE' }).then(() => _sbRequest('products', { method: 'POST', body: JSON.stringify(DEFAULT_PRODUCTS), headers: { Prefer: 'return=minimal' } }));
    _lsSaveProducts(DEFAULT_PRODUCTS);
  }
};
