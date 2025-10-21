// Footer year
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('y');
  if (el) el.textContent = new Date().getFullYear();
});

// Live Stripe links (also set as hrefs for no-JS fallback)
const checkoutLinks = {
  day:     'https://buy.stripe.com/3cI3cuagi9oW2Xp79jafS00',
  weekend: 'https://buy.stripe.com/8x2aEWbkm0Sq69BbpzafS01',
  monthly: 'https://buy.stripe.com/cNi5kCfAC58G2Xp8dnafS02',
};

document.querySelectorAll('[data-checkout]').forEach(a => {
  const key = a.getAttribute('data-checkout');
  if (checkoutLinks[key]) a.setAttribute('href', checkoutLinks[key]); // no-JS fallback already set in HTML too
  a.addEventListener('click', (e) => {
    const k = e.currentTarget.getAttribute('data-checkout');
    const url = checkoutLinks[k];
    if (!url) return;
    // allow normal navigation (hosted Stripe checkout)
  });
});
