// Footer year (optional)
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('y');
  if (el) el.textContent = new Date().getFullYear();
});

// Replace with your LIVE Stripe payment links:
const checkoutLinks = {
  day:    'https://buy.stripe.com/REPLACE_WITH_LIVE_DAY_LINK',
  weekend:'https://buy.stripe.com/REPLACE_WITH_LIVE_WEEKEND_LINK',
  monthly:'https://buy.stripe.com/REPLACE_WITH_LIVE_MONTHLY_LINK'
};

// Attach click handlers
document.querySelectorAll('[data-checkout]').forEach(a => {
  a.addEventListener('click', (e) => {
    const key = e.currentTarget.getAttribute('data-checkout');
    const url = checkoutLinks[key] || '#';
    if (url === '#') {
      alert('Connect Stripe payment link in app.js');
    } else {
      window.location.href = url;
    }
  });
});
