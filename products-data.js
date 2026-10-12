
(() => {
  'use strict';

  // Supabase public/publishable key only. Never use service_role here.
  const SUPABASE_URL = 'https://cfehtdlsranapckfdpig.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_wJwYnSbJdODrkEqXqwr2fA_NhVnhDcB';
  const PRODUCTS_KEY = 'fleurify_products';

  window.CATEGORY_LABELS = {
    bouquet: 'Bouquet',
    birthday: 'Birthday Special',
    wedding: 'Special Occasion',
    festival: 'Festival'
  };

  window.DEFAULT_PRODUCTS = [
    {
      id: 'prod_1',
      name: 'Handmade Rose Bouquet',
      description: 'Beautiful wool roses handcrafted with love, wrapped in elegant craft paper.',
      price: 999, original_price: 1499,
      image: 'images/rose-bouquet.jpg',
      category: 'bouquet', badge: 'Bestseller',
      available: true, created_at: new Date().toISOString()
    },
    {
      id: 'prod_2',
      name: 'Midnight Elegance Bouquet',
      description: 'Stunning handmade wool roses in black matte wrapping with satin ribbon.',
      price: 2499, original_price: 3499,
      image: 'images/premium.jpg',
      category: 'bouquet', badge: 'Premium',
      available: true, created_at: new Date().toISOString()
    },
    {
      id: 'prod_3',
      name: 'Exotic Orchid & Lily Vase',
      description: 'Handcrafted wool orchids and lilies in a premium glass vase.',
      price: 1799, original_price: 2299,
      image: 'images/exotic.jpg',
      category: 'bouquet', badge: '',
      available: true, created_at: new Date().toISOString()
    },
    {
      id: 'prod_4',
      name: 'Birthday Sunshine Gift Box',
      description: 'Vibrant handmade flowers in a premium gift box with personalized card.',
      price: 1299, original_price: 1799,
      image: 'images/birthday.jpg',
      category: 'birthday', badge: 'Popular',
      available: true, created_at: new Date().toISOString()
    },
    {
      id: 'prod_5',
      name: 'Custom Celebration Package',
      description: 'Bespoke handmade wool flower arrangements for your special moments.',
      price: 2500, original_price: 0,
      image: 'images/wedding.jpg',
      category: 'wedding', badge: 'Custom',
      available: true, created_at: new Date().toISOString()
    },
    {
      id: 'prod_6',
      name: 'Festival Special Gift Set',
      description: 'Handmade flower arrangements perfect for Diwali, Navratri and festive gifting.',
      price: 599, original_price: 899,
      image: 'images/festival.jpg',
      category: 'festival', badge: 'Festive',
      available: true, created_at: new Date().toISOString()
    },
    {
      id: 'prod_7',
      name: 'Garden Fresh Flower Basket',
      description: 'Mixed handmade wool flowers in a beautiful handwoven basket.',
      price: 1199, original_price: 1599,
      image: 'images/basket.jpg',
      category: 'bouquet', badge: '',
      available: true, created_at: new Date().toISOString()
    },
    {
      id: 'prod_8',
      name: 'Grand Celebration Bouquet',
      description: 'A luxurious handmade mix of wool roses, peonies and lilies.',
      price: 2999, original_price: 3999,
      image: 'images/hero.jpg',
      category: 'birthday', badge: 'Grand',
      available: true, created_at: new Date().toISOString()
    }
  ];

  // Fail clearly if the Supabase CDN script was not loaded first.
  if (!window.supabase || !window.supabase.createClient) {
    console.error(
      'Supabase library missing. Load @supabase/supabase-js v2 before products-data.js.'
    );
    window.ProductStoreError = 'Supabase library missing';
    return;
  }

  // One shared client for authentication and database requests.
  window.fleurifySupabase = window.fleurifySupabase ||
    window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

  const db = window.fleurifySupabase;

  async function requireLogin() {
    const { data, error } = await db.auth.getSession();

    if (error) throw error;
    if (!data.session) {
      throw new Error('Please log in with your Supabase admin email and password again.');
    }

    return data.session;
  }

  async function getAll() {
    const { data, error } = await db
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async function getById(id) {
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async function add(product) {
    await requireLogin();

    const item = {
      ...product,
      id: 'prod_' + Date.now() + '_' +
        Math.random().toString(36).slice(2, 7),
      created_at: new Date().toISOString()
    };

    const { data, error } = await db
      .from('products')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function update(id, changes) {
    await requireLogin();

    const { data, error } = await db
      .from('products')
      .update(changes)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async function remove(id) {
    await requireLogin();

    const { error } = await db
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  function localGet() {
    try {
      const saved = localStorage.getItem(PRODUCTS_KEY);
      return saved ? JSON.parse(saved) : window.DEFAULT_PRODUCTS;
    } catch (_) {
      return window.DEFAULT_PRODUCTS;
    }
  }

  function localSave(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }

  // Public API used by admin.html and the website.
  window.ProductStore = {
    getAll,

    getById,

    add,

    update,

    delete: remove,

    getByCategory(category) {
      return getAll().then(products =>
        products.filter(p =>
          p.available &&
          (category === 'all' || p.category === category)
        )
      );
    },

    getAvailable() {
      return getAll().then(products =>
        products.filter(p => p.available)
      );
    },

    // Local reset only; intentionally does not delete live database products.
    resetToDefaults() {
      localSave(window.DEFAULT_PRODUCTS);
      return window.DEFAULT_PRODUCTS;
    }
  };

  console.log('Fleurify ProductStore loaded successfully.');
})();
