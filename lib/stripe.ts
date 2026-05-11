import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Basic listing with business name & address',
      'Appear in city search results',
      'Business hours & contact info',
      'Up to 3 service categories',
    ],
    notIncluded: [
      'Priority placement in results',
      'Verified badge',
      'Photo gallery',
      'Lead notifications',
      'Premium profile page',
      'Featured placement',
    ],
  },
  pro: {
    name: 'Pro',
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Everything in Free',
      'Priority placement in search results',
      'Verified business badge ✓',
      'Photo gallery (up to 20 photos)',
      'Instant lead notifications via email',
      'Customer review highlights',
      'Up to 10 service categories',
      'Direct website link',
    ],
    notIncluded: [
      'Top-of-page featured placement',
      'Featured badge',
      'Priority lead routing',
    ],
  },
  featured: {
    name: 'Featured',
    price: 99,
    priceId: process.env.STRIPE_FEATURED_PRICE_ID!,
    features: [
      'Everything in Pro',
      'Top-of-page featured placement',
      '⭐ Featured business badge',
      'Premium profile with full branding',
      'Priority lead routing',
      'Unlimited service categories',
      'Competitor insights dashboard',
      'Monthly performance report',
      'Dedicated support',
    ],
    notIncluded: [],
  },
} as const;
