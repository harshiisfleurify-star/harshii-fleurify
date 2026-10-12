```javascript
// ===== PRODUCT DATA LAYER =====
// Harshii's Fleurify
// Shared Supabase database + authenticated admin requests.
// Never put a service_role/secret key in frontend code.

// ===== CATEGORY MAP =====
const CATEGORY_LABELS = {
  bouquet: 'Bouquet',
  birthday: 'Birthday Special',
  wedding: 'Special Occasion',
  festival: 'Festival'
};

// ===== DEFAULT PRODUCTS =====
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

// ===== SUPABASE CONFIGURATION =====
const PRODUCTS_BACKEND = 'supabase';
const SUPABASE_URL = 'https://cfehtdlsranapckfdpig.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wJwYnSbJdODrkEqXqwr2fA_NhVnhDcB';
const PRODUCTS_KEY = 'fleurify_products';

// Supabase Auth browser storage key for this project.
const SUPABASE_AUTH_STORAGE_KEY =
  'sb-cfehtdlsranapckfdpig-auth-token';

// ===== LOCAL STORAGE HELPERS =====
function _lsGetProducts() {
  const data = localStorage.getItem(PRODUCTS_KEY);

  if (!data) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS.map(p => ({ ...p }));
  }

  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : DEFAULT_PRODUCTS;
  } catch (_) {
    return DEFAULT_PRODUCTS;
  }
}

function _lsSaveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function _supabaseReady() {
  return (
    PRODUCTS_BACKEND === 'supabase' &&
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY)
  );
}

// ===== AUTH SESSION HELPERS =====
function _readStoredSession() {
  try {
    const raw = localStorage.getItem(SUPABASE_AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Supabase JS normally stores { access_token, refresh_token, ... }.
    if (parsed && parsed.access_token) return parsed;
    if (parsed && parsed.currentSession) return parsed.currentSession;

    return null;
  } catch (_) {
    return null;
  }
}

function _saveStoredSession(session) {
  if (!session || !session.access_token) {
    throw new Error('Supabase ne valid login session return nahi kiya.');
  }

  localStorage.setItem(
    SUPABASE_AUTH_STORAGE_KEY,
    JSON.stringify(session)
  );
}

function _clearStoredSession() {
  localStorage.removeItem(SUPABASE_AUTH_STORAGE_KEY);
}

async function _refreshSessionIfNeeded() {
  let session = _readStoredSession();

  if (!session) return null;

  // Refresh if the token is expired or will expire within 30 seconds.
  const expiresAt = Number(session.expires_at || 0);
  const shouldRefresh =
    expiresAt > 0 && expiresAt * 1000 < Date.now() + 30000;

  if (!shouldRefresh) return session;

  if (!session.refresh_token) {
    _clearStoredSession();
    return null;
  }

  const response = await fetch(
    SUPABASE_URL.replace(/\/$/, '') +
      '/auth/v1/token?grant_type=refresh_token',
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: session.refresh_token
      })
    }
  );

  if (!response.ok) {
    _clearStoredSession();
    return null;
  }

  const refreshed = await response.json();

  if (!refreshed.access_token) {
    _clearStoredSession();
    return null;
  }

  if (!refreshed.expires_at && refreshed.expires_in) {
    refreshed.expires_at =
      Math.floor(Date.now() / 1000) + refreshed.expires_in;
  }

  _saveStoredSession(refreshed);
  return refreshed;
}

// ===== SUPABASE AUTH API =====
// Call ProductStore.signIn(email, password) from the admin login form.
// This creates a real Supabase Auth session; a typed user ID is not needed.
async function _signIn(email, password) {
  if (!email || !password) {
    throw new Error('Email aur password dono enter karo.');
  }

  const response = await fetch(
    SUPABASE_URL.replace(/\/$/, '') +
      '/auth/v1/token?grant_type=password',
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim(),
        password
      })
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.access_token) {
    throw new Error(
      result.msg ||
      result.message ||
      result.error_description ||
      result.error ||
      'Login failed. Email/password check karo.'
    );
  }

  if (!result.expires_at && result.expires_in) {
    result.expires_at =
      Math.floor(Date.now() / 1000) + result.expires_in;
  }

  _saveStoredSession(result);

  // Check that the signed-in account is listed in admin_users.
  const userId = result.user && result.user.id;

  if (!userId) {
    _clearStoredSession();
    throw new Error('Login user ID nahi mila.');
  }

  try {
    const admins = await _sbRequest(
      'admin_users?select=user_id&user_id=eq.' +
        encodeURIComponent(userId),
      { method: 'GET' }
    );

    if (!Array.isArray(admins) || admins.length === 0) {
      _clearStoredSession();
      throw new Error(
        'Is account ko admin access nahi hai. Admin user ID database mein verify karo.'
      );
    }
  } catch (error) {
    _clearStoredSession();
    throw error;
  }

  return result.user;
}

async function _signOut() {
  const session = _readStoredSession();

  try {
    if (session && session.access_token) {
      await fetch(
        SUPABASE_URL.replace(/\/$/, '') + '/auth/v1/logout',
        {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: 'Bearer ' + session.access_token
          }
        }
      );
    }
  } finally {
    _clearStoredSession();
  }
}

// ===== SHARED SUPABASE REQUEST =====
async function _sbRequest(path, options = {}) {
  if (!_supabaseReady()) {
    throw new Error('Supabase URL/key configure nahi hain.');
  }

  const session = await _refreshSessionIfNeeded();

  // Public SELECT can use the publishable key. Protected operations
  // must use a genuine signed-in user's access token.
  const method = String(options.method || 'GET').toUpperCase();
  const isWrite = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);

  if (isWrite && !session?.access_token) {
    throw new Error(
      'Admin Supabase session missing hai. Logout karke email/password se dobara login karo.'
    );
  }

  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: 'Bearer ' +
      (session?.access_token || SUPABASE_ANON_KEY),
    ...(options.body !== undefined
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(options.headers || {})
  };

  const response = await fetch(
    SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/' + path,
    {
      ...options,
      headers
    }
  );

  if (!response.ok) {
    const detail = await response.text();

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        'Supabase access denied (' + response.status + '): ' + detail
      );
    }

    throw new Error(
      'Database request failed (' + response.status + '): ' + detail
    );
  }

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ===== SUPABASE PRODUCT HELPERS =====
async function _sbGetProducts() {
  return _sbRequest(
    'products?select=*&order=created_at.desc'
  );
}

// ===== PUBLIC PRODUCT API =====
const ProductStore = {
  // Authentication helpers for admin.html.
  signIn: function(email, password) {
    return _signIn(email, password);
  },

  signOut: function() {
    return _signOut();
  },

  getCurrentUser: async function() {
    const session = await _refreshSessionIfNeeded();
    if (!session || !session.access_token) return null;

    const response = await fetch(
      SUPABASE_URL.replace(/\/$/, '') + '/auth/v1/user',
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: 'Bearer ' + session.access_token
        }
      }
    );

    if (!response.ok) return null;
    return response.json();
  },

  isAdmin: async function() {
    const user = await this.getCurrentUser();
    if (!user || !user.id) return false;

    try {
      const rows = await _sbRequest(
        'admin_users?select=user_id&user_id=eq.' +
          encodeURIComponent(user.id)
      );
      return Array.isArray(rows) && rows.length > 0;
    } catch (_) {
      return false;
    }
  },

  getAll: function() {
    if (_supabaseReady()) return _sbGetProducts();
    return _lsGetProducts();
  },

  getById: function(id) {
    if (_supabaseReady()) {
      return _sbRequest(
        'products?id=eq.' + encodeURIComponent(id) + '&select=*&limit=1'
      ).then(rows => rows[0] || null);
    }

    return _lsGetProducts().find(p => p.id === id) || null;
  },

  add: async function(product) {
    const item = {
      ...product,
      id: 'prod_' + Date.now() + '_' +
        Math.random().toString(36).slice(2, 7),
      created_at: new Date().toISOString()
    };

    if (_supabaseReady()) {
      const rows = await _sbRequest('products', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(item)
      });

      return rows && rows[0] ? rows[0] : item;
    }

    const products = _lsGetProducts();
    products.push(item);
    _lsSaveProducts(products);
    return item;
  },

  update: async function(id, updates) {
    if (_supabaseReady()) {
      const rows = await _sbRequest(
        'products?id=eq.' + encodeURIComponent(id),
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(updates)
        }
      );

      return rows && rows[0] ? rows[0] : null;
    }

    const products = _lsGetProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    products[idx] = { ...products[idx], ...updates };
    _lsSaveProducts(products);
    return products[idx];
  },

  delete: async function(id) {
    if (_supabaseReady()) {
      return _sbRequest(
        'products?id=eq.' + encodeURIComponent(id),
        { method: 'DELETE' }
      );
    }

    _lsSaveProducts(_lsGetProducts().filter(p => p.id !== id));
  },

  getByCategory: function(category) {
    const result = this.getAll();

    const filter = products =>
      category === 'all'
        ? products.filter(p => p.available)
        : products.filter(
            p => p.category === category && p.available
          );

    return result && typeof result.then === 'function'
      ? result.then(filter)
      : filter(result);
  },

  getAvailable: function() {
    const result = this.getAll();
    const filter = products => products.filter(p => p.available);

    return result && typeof result.then === 'function'
      ? result.then(filter)
      : filter(result);
  },

  resetToDefaults: async function() {
    if (_supabaseReady()) {
      await _sbRequest('products?id=not.is.null', {
        method: 'DELETE'
      });

      return _sbRequest('products', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(DEFAULT_PRODUCTS)
      });
    }

    _lsSaveProducts(DEFAULT_PRODUCTS);
  }
};
```
