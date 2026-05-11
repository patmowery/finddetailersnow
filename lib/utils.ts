import { US_STATES, type StateInfo } from '@/types';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function toTitleCase(str: string): string {
  return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getStateBySlug(slug: string): StateInfo | undefined {
  return US_STATES.find((s) => s.slug === slug);
}

export function getStateByCode(code: string): StateInfo | undefined {
  return US_STATES.find((s) => s.code === code.toUpperCase());
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function buildListingUrl(listing: {
  state_code: string;
  city: string;
  slug: string;
}): string {
  const state = getStateByCode(listing.state_code);
  const stateSlug = state?.slug ?? slugify(listing.state_code);
  const citySlug = slugify(listing.city);
  return `/${stateSlug}/${citySlug}/${listing.slug}`;
}

export function buildCityUrl(city: string, stateCode: string): string {
  const state = getStateByCode(stateCode);
  const stateSlug = state?.slug ?? slugify(stateCode);
  const citySlug = slugify(city);
  return `/${stateSlug}/${citySlug}`;
}

export function buildStateUrl(stateCode: string): string {
  const state = getStateByCode(stateCode);
  return `/${state?.slug ?? slugify(stateCode)}`;
}

export function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://finddetailersnow.com');
  return `${base}${path}`;
}
