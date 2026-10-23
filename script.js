// ===== HARSHII'S FLEURIFY - MAIN JS =====
let cart = JSON.parse(localStorage.getItem('hf_cart') || '[]');
let selectedPayment = 'Pay on Delivery';
let selectedPaymentScreenshot = null;

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFloatingElements();
  renderProducts();
  initScrollReveal();
  initProductFilter();
  initScrollTop();
  initWishlist();
  updateCartUI();
});

// Payment screenshot picker: separate camera and gallery/file options.
document.addEventListener('DOMContentLoaded', () => {
  ['paymentScreenshotCamera', 'paymentScreenshotGallery'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.addEventListener('change', previewPaymentScreenshot);
  });
});

function previewPaymentScreenshot(event) {
  const input = event && event.target;
  const file = input && input.files && input.files[0];
  const wrap = document.getElementById('paymentScreenshotPreviewWrap');
  const img = document.getElementById('paymentScreenshotPreview');
  const help = document.getElementById('paymentShareHelp');
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(file.type)) {
    input.value = '';
    alert('Please choose a JPG, PNG or WebP image.');
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    input.value = '';
    alert('Image must be smaller than 8 MB.');
    return;
  }
  // Keep one chosen file regardless of whether it came from camera or gallery.
  selectedPaymentScreenshot = file;
  ['paymentScreenshotCamera', 'paymentScreenshotGallery'].forEach((id) => {
    const other = document.getElementById(id);
    if (other && other !== input) other.value = '';
  });
  const reader = new FileReader();
  reader.onload = () => { if (img) img.src = reader.result; if (wrap) wrap.hidden = false; };
  reader.readAsDataURL(file);
  if (help) help.textContent = 'Image attached: ' + file.name;
}

function clearPaymentScreenshot() {
  ['paymentScreenshotCamera', 'paymentScreenshotGallery'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
  selectedPaymentScreenshot = null;
  const wrap = document.getElementById('paymentScreenshotPreviewWrap');
  const img = document.getElementById('paymentScreenshotPreview');
  const help = document.getElementById('paymentShareHelp');
  if (img) img.removeAttribute('src');
  if (wrap) wrap.hidden = true;
  if (help) help.textContent = '';
}

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  });
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
    const s = navToggle.querySelectorAll('span');
    if (navToggle.classList.contains('active')) {
      s[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      s[1].style.opacity = '0';
      s[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      s[0].style.transform = 'none';
      s[1].style.opacity = '1';
      s[2].style.transform = 'none';
    }
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      navToggle.classList.remove('active');
      const s = navToggle.querySelectorAll('span');
      s[0].style.transform = 'none';
      s[1].style.opacity = '1';
      s[2].style.transform = 'none';
    });
  });
}

// ===== FLOATING FLOWERS =====
function initFloatingElements() {
  const container = document.getElementById('floatingPetals');
  if (!container) return;
  const flowers = ['\uD83C\uDF38', '\uD83C\uDF3A', '\uD83C\uDF3B', '\uD83C\uDF3C', '\uD83C\uDF37', '\uD83C\uDF39', '\uD83C\uDF3F', '\uD83C\uDF40', '\u2728', '\uD83E\uDDF6'];
  function create() {
    const el = document.createElement('span');
    el.className = 'petal';
    el.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.fontSize = (Math.random() * 16 + 12) + 'px';
    el.style.animationDuration = (Math.random() * 12 + 10) + 's';
    el.style.animationDelay = (Math.random() * 6) + 's';
    el.style.filter = 'drop-shadow(0 2px 4px rgba(214,51,132,0.15))';
    container.appendChild(el);
    el.addEventListener('animationend', () => { el.remove(); create(); });
  }
  for (let i = 0; i < 25; i++) setTimeout(() => create(), i * 400);

  // Also add flowers to body background
  initBodyFlowers();
}

// Floating flowers across entire page
function initBodyFlowers() {
  const bgContainer = document.createElement('div');
  bgContainer.id = 'bgFlowers';
  bgContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;';
  document.body.appendChild(bgContainer);
  const flowers = ['\uD83C\uDF38', '\uD83C\uDF3A', '\uD83C\uDF3B', '\uD83C\uDF3C', '\uD83C\uDF37', '\uD83C\uDF39', '\uD83E\uDDF6'];
  function createBg() {
    const el = document.createElement('span');
    el.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    el.style.cssText = 'position:absolute;opacity:0.15;animation:floatPetal ' + (Math.random() * 15 + 15) + 's linear infinite;left:' + (Math.random() * 100) + '%;font-size:' + (Math.random() * 20 + 10) + 'px;animation-delay:' + (Math.random() * 10) + 's;';
    bgContainer.appendChild(el);
    el.addEventListener('animationend', () => { el.remove(); createBg(); });
  }
  for (let i = 0; i < 12; i++) setTimeout(() => createBg(), i * 800);
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ===== RENDER PRODUCTS FROM DATA =====
async function renderProducts(filterCategory) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const filter = filterCategory || 'all';
  let products = (filter === 'all') ? ProductStore.getAvailable() : ProductStore.getByCategory(filter);
  products = await Promise.resolve(products);

  grid.innerHTML = '';

  products.forEach(p => {
    const catLabel = CATEGORY_LABELS[p.category] || p.category;
    const encodedName = encodeURIComponent(p.name);
    const priceFormatted = '\u20B9' + p.price.toLocaleString('en-IN');
    const originalHTML = p.original_price > 0 ? ' <span class="original">\u20B9' + p.original_price.toLocaleString('en-IN') + '</span>' : '';
    const badgeHTML = p.badge ? '<span class="product-badge">' + p.badge + '</span>' : '';
    const waText = 'Hi!%20I%20want%20to%20buy%20' + encodedName + '%20(' + encodeURIComponent('\u20B9' + p.price) + ')';

    const card = document.createElement('div');
    card.className = 'product-card reveal active';
    card.setAttribute('data-category', p.category);
    card.innerHTML =
      '<div class="product-image-wrapper">' +
        '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" decoding="async">' +
        badgeHTML +
        '<button class="product-wishlist" aria-label="Wishlist">\u2661</button>' +
      '</div>' +
      '<div class="product-info">' +
        '<p class="product-category-tag">' + catLabel + '</p>' +
        '<h3 class="product-name">' + p.name + '</h3>' +
        '<p class="product-desc">' + p.description + '</p>' +
        '<div class="product-footer">' +
          '<span class="product-price">' + priceFormatted + originalHTML + '</span>' +
          '<div class="product-actions">' +
            '<button class="product-cart-btn" data-id="' + p.id + '">+ Cart</button>' +
            '<a href="https://wa.me/919509307773?text=' + waText + '" class="product-order-btn" target="_blank">Buy \u2192</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Tap/click product image or title to open a larger preview.
    const openPreview = () => showProductPreview(p);
    const previewImage = card.querySelector('.product-image-wrapper img');
    const previewTitle = card.querySelector('.product-name');
    previewImage.style.cursor = 'zoom-in';
    previewTitle.style.cursor = 'pointer';
    previewImage.addEventListener('click', openPreview);
    previewTitle.addEventListener('click', openPreview);

    // Cart button click
    card.querySelector('.product-cart-btn').addEventListener('click', function() {
      addToCart(p.name, p.price, p.image, this, p.id);
    });

    // Wishlist button
    card.querySelector('.product-wishlist').addEventListener('click', function(e) {
      e.preventDefault();
      if (this.classList.contains('wishlisted')) {
        this.classList.remove('wishlisted');
        this.textContent = '\u2661';
        this.style.color = 'var(--color-magenta)';
      } else {
        this.classList.add('wishlisted');
        this.textContent = '\u2665';
        this.style.color = '#ef4444';
      }
    });

    grid.appendChild(card);
  });
}

// ===== PRODUCT PREVIEW MODAL =====
let previewProduct = null;
function showProductPreview(product) {
  previewProduct = product;
  const modal = document.getElementById('productPreviewModal');
  if (!modal) return;
  document.getElementById('productPreviewImage').src = product.image || '';
  document.getElementById('productPreviewImage').alt = product.name || 'Product preview';
  document.getElementById('productPreviewTitle').textContent = product.name || '';
  document.getElementById('productPreviewCategory').textContent = CATEGORY_LABELS[product.category] || product.category || '';
  document.getElementById('productPreviewDescription').textContent = product.description || '';
  document.getElementById('productPreviewPrice').textContent = '₹' + Number(product.price || 0).toLocaleString('en-IN');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('preview-open');
}
function closeProductPreview() {
  const modal = document.getElementById('productPreviewModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('preview-open');
}
document.addEventListener('click', function(event) {
  if (event.target.closest('[data-preview-close]')) closeProductPreview();
});
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') closeProductPreview();
});
document.addEventListener('DOMContentLoaded', function() {
  const addButton = document.getElementById('productPreviewAdd');
  if (addButton) addButton.addEventListener('click', function() {
    if (!previewProduct) return;
    addToCart(previewProduct.name, previewProduct.price, previewProduct.image, null, previewProduct.id);
    closeProductPreview();
  });
});

// ===== PRODUCT FILTER =====
function initProductFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.getAttribute('data-filter');
      renderProducts(f);
    });
  });

  // Background sync listener: refresh grid smoothly when background query updates
  window.addEventListener('fleurify:products-updated', () => {
    const activeBtn = document.querySelector('.filter-btn.active');
    const f = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
    renderProducts(f);
  });
}

// ===== SCROLL TOP =====
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== WISHLIST =====
function initWishlist() {
  document.querySelectorAll('.product-wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (btn.classList.contains('wishlisted')) {
        btn.classList.remove('wishlisted');
        btn.innerHTML = '\u2661';
        btn.style.color = 'var(--color-magenta)';
      } else {
        btn.classList.add('wishlisted');
        btn.innerHTML = '\u2665';
        btn.style.color = '#ef4444';
        btn.style.animation = 'pulse 0.3s ease';
      }
    });
  });
}

function scrollToProducts(category) {
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      if (btn.getAttribute('data-filter') === category) btn.click();
    });
  }, 800);
}

// Optional: set the shop's verified UPI ID here to enable direct UPI-app launch.
// Example format: "shopname@bank". Do not put a phone number here unless it is the actual UPI ID.
const FLEURIFY_UPI_ID = '';
function updateUpiAppLink() {
  const link = document.getElementById('openUpiApp');
  if (!link) return;
  if (!FLEURIFY_UPI_ID || !FLEURIFY_UPI_ID.includes('@')) {
    link.hidden = true;
    return;
  }
  const total = getCartTotal() + 50;
  const params = new URLSearchParams({
    pa: FLEURIFY_UPI_ID,
    pn: "Harshii's Fleurify",
    am: total.toFixed(2),
    cu: 'INR',
    tn: 'Harshii Fleurify order'
  });
  link.href = 'upi://pay?' + params.toString();
  link.hidden = false;
}

// ===== CART SYSTEM =====
function addToCart(name, price, image, btnEl, productId) {
  const existing = cart.find(item => (productId && item.id === productId) || (!productId && item.name === name));
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId || null, name, price, image, qty: 1 });
  }
  saveCart();
  updateCartUI();

  // Button feedback
  if (btnEl) {
    btnEl.classList.add('added');
    btnEl.textContent = 'Added!';
    setTimeout(() => {
      btnEl.classList.remove('added');
      btnEl.textContent = '+ Cart';
    }, 1500);
  }

  // Bump animation on cart count
  const countEl = document.getElementById('cartCount');
  countEl.classList.remove('bump');
  void countEl.offsetWidth;
  countEl.classList.add('bump');
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function updateQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function saveCart() {
  localStorage.setItem('hf_cart', JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  countEl.textContent = totalItems;
  countEl.style.display = totalItems > 0 ? 'flex' : 'none';

  const footer = document.getElementById('cartFooter');
  const empty = document.getElementById('cartEmpty');
  if (cart.length > 0) {
    footer.style.display = 'block';
    if (empty) empty.style.display = 'none';
  } else {
    footer.style.display = 'none';
    if (empty) empty.style.display = 'block';
  }

  document.getElementById('cartTotal').textContent = '\u20B9' + getCartTotal().toLocaleString('en-IN');
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const emptyHTML = '<div class="cart-empty" id="cartEmpty" style="' + (cart.length > 0 ? 'display:none' : '') + '"><span class="cart-empty-icon">\uD83D\uDED2</span>Your cart is empty!<br><small>Add some beautiful handmade bouquets</small></div>';

  let html = emptyHTML;
  cart.forEach((item, i) => {
    html += '<div class="cart-item">' +
      '<img class="cart-item-img" src="' + item.image + '" alt="' + item.name + '">' +
      '<div class="cart-item-info">' +
      '<div class="cart-item-name">' + item.name + '</div>' +
      '<div class="cart-item-price">\u20B9' + item.price.toLocaleString('en-IN') + '</div>' +
      '<div class="cart-item-qty">' +
      '<button onclick="updateQty(' + i + ',-1)">\u2212</button>' +
      '<span>' + item.qty + '</span>' +
      '<button onclick="updateQty(' + i + ',1)">+</button>' +
      '</div>' +
      '</div>' +
      '<button class="cart-item-remove" onclick="removeFromCart(' + i + ')">\u2715</button>' +
      '</div>';
  });
  container.innerHTML = html;
  updateCartUI();
}

async function syncCartWithProducts() {
  // Keep the cart in sync with the current product catalogue.
  // If the catalogue request fails, keep the cart rather than deleting items blindly.
  try {
    const products = await ProductStore.getAll();
    const byId = new Map(products.map(p => [String(p.id), p]));
    const byName = new Map(products.map(p => [p.name, p]));
    const removed = [];
    cart = cart.filter(item => {
      const live = item.id ? byId.get(String(item.id)) : byName.get(item.name);
      if (!live || live.available === false || live.available === 'false') {
        removed.push(item.name);
        return false;
      }
      item.id = live.id;
      item.name = live.name;
      item.price = Number(live.price);
      item.image = live.image;
      return true;
    });
    saveCart();
    if (removed.length) alert('Cart updated: unavailable/removed products were taken out: ' + removed.join(', '));
  } catch (error) {
    console.warn('Could not refresh product availability; keeping cart unchanged.', error);
  }
}

async function toggleCart() {
  const overlay = document.getElementById('cartOverlay');
  const sidebar = document.getElementById('cartSidebar');
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    overlay.classList.remove('open');
    sidebar.classList.remove('open');
    document.body.style.overflow = '';
  } else {
    await syncCartWithProducts();
    renderCartItems();
    overlay.classList.add('open');
    sidebar.classList.add('open');
    document.body.style.overflow = 'hidden';
    const checkout = document.getElementById('checkoutForm');
    if (checkout) checkout.classList.remove('show');
  }
}

function showCheckout() {
  document.getElementById('checkoutForm').classList.toggle('show');
}

function selectPayment(el, method) {
  selectedPayment = method;
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  const panel = document.getElementById('upiPaymentPanel');
  if (panel) panel.hidden = method !== 'Online UPI';
  updateUpiAppLink();
}

// ===== PLACE ORDER VIA WHATSAPP =====
async function placeOrder() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();

  if (!name || !phone || !address) {
    alert('Please fill in all delivery details!');
    return;
  }

  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  let paymentScreenshot = null;
  if (selectedPayment === 'Online UPI') {
    paymentScreenshot = selectedPaymentScreenshot;
    if (!paymentScreenshot) {
      alert('Please attach a screenshot of your successful payment before confirming the order.');
      document.querySelector('.payment-source-button')?.focus();
      return;
    }
  }

  // Refresh availability immediately before submitting the order.
  // Do not submit items which were removed or marked unavailable after being added to cart.
  try {
    const liveProducts = await ProductStore.getAll();
    const byId = new Map(liveProducts.map(p => [String(p.id), p]));
    const byName = new Map(liveProducts.map(p => [p.name, p]));
    const invalid = cart.filter(item => {
      const p = item.id ? byId.get(String(item.id)) : byName.get(item.name);
      return !p || p.available === false || p.available === 'false';
    });
    if (invalid.length) {
      await syncCartWithProducts();
      renderCartItems();
      alert('Some products are no longer available and were removed from your cart. Please review your cart.');
      return;
    }
  } catch (error) {
    alert('Could not verify product availability. Please try again in a moment.');
    return;
  }

  // Build a plain-text receipt first, then URL-encode it safely for WhatsApp.
  let receipt = 'NEW ORDER - Harshii\'s Fleurify\n\n';
  receipt += 'ORDER DETAILS\n';
  cart.forEach((item, i) => {
    receipt += (i + 1) + '. ' + item.name + ' x' + item.qty + ' = ₹' + (item.price * item.qty).toLocaleString('en-IN') + '\n';
  });

  const deliveryCharge = 50;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryCharge;
  receipt += '\nSubtotal: ₹' + subtotal.toLocaleString('en-IN');
  receipt += '\nDelivery: ₹' + deliveryCharge;
  receipt += '\nTOTAL: ₹' + total.toLocaleString('en-IN');
  receipt += '\n\nCUSTOMER DETAILS';
  receipt += '\nName: ' + name;
  receipt += '\nPhone: ' + phone;
  receipt += '\nAddress: ' + address;
  receipt += '\n\nPayment: ' + selectedPayment;
  if (selectedPayment === 'Online UPI') {
    const utr = document.getElementById('upiReference').value.trim();
    if (utr) receipt += '\nUPI Reference/UTR: ' + utr;
    receipt += '\nPayment Status: Screenshot provided — pending owner verification';
    receipt += '\nPlease verify payment manually before confirming the order.';
  }
  receipt += '\n\nPlease confirm my order. Thank you!';
  const url = 'https://wa.me/919509307773?text=' + encodeURIComponent(receipt);

  // On browsers that support sharing files, let the customer share the screenshot and
  // receipt text, then choose the owner's WhatsApp contact. WhatsApp click-to-chat
  // itself cannot pre-attach a local file, so fall back to a prefilled chat + clear prompt.
  if (selectedPayment === 'Online UPI' && paymentScreenshot && navigator.share && navigator.canShare) {
    const shareData = { title: 'Harshii’s Fleurify order receipt', text: receipt, files: [paymentScreenshot] };
    if (navigator.canShare({ files: [paymentScreenshot] })) {
      try {
        await navigator.share(shareData);
        const help = document.getElementById('paymentShareHelp');
        if (help) help.textContent = 'Share sheet opened. Choose WhatsApp, then select the shop owner and send the receipt + screenshot.';
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        window.open(url, '_blank', 'noopener');
        alert('WhatsApp receipt opened. Please attach your selected payment screenshot in that chat before sending.');
        return;
      }
    } else {
      window.open(url, '_blank', 'noopener');
      alert('WhatsApp receipt opened. Please attach your selected payment screenshot in that chat before sending.');
      return;
    }
  } else {
    window.open(url, '_blank', 'noopener');
    if (selectedPayment === 'Online UPI') {
      alert('WhatsApp receipt opened. Please attach your selected payment screenshot in that chat before sending.');
      return;
    }
  }

  // Clear cart after the customer has proceeded to share/send the order.
  cart = [];
  saveCart();
  updateCartUI();
  toggleCart();
}

// ===== CONTACT FORM =====
function handleFormSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const occasion = document.getElementById('occasion').value;
  const message = document.getElementById('message').value;
  let msg = 'Hi! I\'m ' + name + '.%0A';
  msg += 'Phone: ' + phone + '%0A';
  if (occasion) msg += 'Occasion: ' + occasion + '%0A';
  if (message) msg += 'Message: ' + message;
  // Save a local copy so the admin inbox can display this review on this browser.
  try {
    const savedReviews = JSON.parse(localStorage.getItem('hf_reviews') || '[]');
    savedReviews.push({
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      name: name,
      message: review,
      rating: selectedRating,
      date: new Date().toLocaleString()
    });
    localStorage.setItem('hf_reviews', JSON.stringify(savedReviews.slice(-200)));
  } catch (e) {
    console.warn('Could not save review locally', e);
  }

  window.open('https://wa.me/919509307773?text=' + msg, '_blank');
}

function handleNewsletter(event) {
  event.preventDefault();
  alert('Thank you for subscribing! We will keep you updated.');
  event.target.querySelector('input').value = '';
}

// ===== STAR RATING =====
let selectedRating = 0;
const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'];

document.addEventListener('DOMContentLoaded', () => {
  const stars = document.querySelectorAll('.star-input');
  if (!stars.length) return;

  stars.forEach(star => {
    // Hover preview
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.getAttribute('data-value'));
      stars.forEach(s => {
        const sv = parseInt(s.getAttribute('data-value'));
        if (sv <= val) {
          s.classList.add('hover-preview');
          s.innerHTML = '&#9733;';
        } else {
          s.classList.remove('hover-preview');
          if (!s.classList.contains('active')) s.innerHTML = '&#9734;';
        }
      });
      document.getElementById('starRatingText').textContent = ratingLabels[val];
    });

    // Mouse leave - restore
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => {
        s.classList.remove('hover-preview');
        const sv = parseInt(s.getAttribute('data-value'));
        if (sv <= selectedRating) {
          s.innerHTML = '&#9733;';
          s.classList.add('active');
        } else {
          s.innerHTML = '&#9734;';
          s.classList.remove('active');
        }
      });
      document.getElementById('starRatingText').textContent =
        selectedRating > 0 ? ratingLabels[selectedRating] + ' - ' + selectedRating + '/5' : 'Tap to rate';
    });

    // Click to select
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.getAttribute('data-value'));
      stars.forEach(s => {
        const sv = parseInt(s.getAttribute('data-value'));
        if (sv <= selectedRating) {
          s.innerHTML = '&#9733;';
          s.classList.add('active');
        } else {
          s.innerHTML = '&#9734;';
          s.classList.remove('active');
        }
      });
      document.getElementById('starRatingText').textContent =
        ratingLabels[selectedRating] + ' - ' + selectedRating + '/5';
    });
  });
});

function submitReview() {
  const name = document.getElementById('reviewerName').value.trim();
  const review = document.getElementById('reviewText').value.trim();

  if (selectedRating === 0) {
    alert('Please select a star rating!');
    return;
  }
  if (!name) {
    alert('Please enter your name!');
    return;
  }

  let stars = '';
  for (let i = 0; i < selectedRating; i++) stars += '\u2B50';

  let msg = '*New Review for Harshii\'s Fleurify*%0A%0A';
  msg += 'Rating: ' + stars + ' (' + selectedRating + '/5)%0A';
  msg += 'Name: ' + name + '%0A';
  if (review) msg += 'Review: ' + review + '%0A';
  msg += '%0AThank you for your feedback!';

  // Save a local copy so the admin inbox can display this review on this browser.
  try {
    const savedReviews = JSON.parse(localStorage.getItem('hf_reviews') || '[]');
    savedReviews.push({
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      name: name,
      message: review,
      rating: selectedRating,
      date: new Date().toLocaleString()
    });
    localStorage.setItem('hf_reviews', JSON.stringify(savedReviews.slice(-200)));
  } catch (e) {
    console.warn('Could not save review locally', e);
  }

  window.open('https://wa.me/919509307773?text=' + msg, '_blank');

  // Reset form
  selectedRating = 0;
  document.querySelectorAll('.star-input').forEach(s => {
    s.innerHTML = '&#9734;';
    s.classList.remove('active');
  });
  document.getElementById('starRatingText').textContent = 'Tap to rate';
  document.getElementById('reviewerName').value = '';
  document.getElementById('reviewText').value = '';
  alert('Thank you for your review!');
}


// ===== ADMIN-EDITABLE HOME CATEGORY CARDS =====
(function applyHomeCategorySettings() {
  function applyCards(categories) {
    if (!Array.isArray(categories) || categories.length !== 4) return;
    const cards = document.querySelectorAll('#categories .category-card');
    if (!cards.length) return;
    categories.forEach((cat, i) => {
      const card = cards[i];
      if (!card) return;
      const img = card.querySelector('img');
      const emoji = card.querySelector('.category-icon');
      const title = card.querySelector('.category-name');
      const subtitle = card.querySelector('.category-count');
      if (img && cat.image) {
        img.src = cat.image;
        img.alt = cat.title || 'Flower category';
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
      }
      if (emoji) emoji.textContent = cat.emoji || '';
      if (title) title.textContent = cat.title || '';
      if (subtitle) subtitle.textContent = cat.subtitle || '';
    });
  }

  function apply() {
    // 1. Instant render from local cache
    try {
      const local = JSON.parse(localStorage.getItem('hf_home_categories') || 'null');
      if (Array.isArray(local) && local.length === 4) applyCards(local);
    } catch (_) {}

    // 2. Background sync from shared Supabase database
    if (window.ProductStore && window.ProductStore.getHomeCategories) {
      window.ProductStore.getHomeCategories().then(applyCards).catch(() => {});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
