export type ServiceType =
  | 'detailing'
  | 'ceramic_coating'
  | 'ppf'
  | 'paint_correction'
  | 'interior'
  | 'mobile'
  | 'tinting'
  | 'wash'
  | 'commercial'
  | 'rv_boat';

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface Listing {
  id: string;
  business_name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  services: ServiceType[];
  address: string | null;
  city: string;
  state: string;
  state_code: string;
  zip: string | null;
  lat: number | null;
  lng: number | null;
  logo_url: string | null;
  cover_image_url: string | null;
  is_claimed: boolean;
  is_premium: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  price_range: PriceRange | null;
  years_in_business: number | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  listing_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  state_code: string;
  population: number | null;
  lat: number | null;
  lng: number | null;
}

export interface Claim {
  id: string;
  listing_id: string;
  user_email: string;
  status: ClaimStatus;
  created_at: string;
}

export interface StateInfo {
  name: string;
  code: string;
  slug: string;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  detailing: 'Auto Detailing',
  ceramic_coating: 'Ceramic Coating',
  ppf: 'Paint Protection Film',
  paint_correction: 'Paint Correction',
  interior: 'Interior Detailing',
  mobile: 'Mobile Detailing',
  tinting: 'Window Tinting',
  wash: 'Car Wash',
  commercial: 'Commercial/Fleet',
  rv_boat: 'RV & Boat Detailing',
};

export const SERVICE_COLORS: Record<ServiceType, string> = {
  detailing: 'bg-blue-100 text-blue-800',
  ceramic_coating: 'bg-purple-100 text-purple-800',
  ppf: 'bg-green-100 text-green-800',
  paint_correction: 'bg-red-100 text-red-800',
  interior: 'bg-yellow-100 text-yellow-800',
  mobile: 'bg-orange-100 text-orange-800',
  tinting: 'bg-indigo-100 text-indigo-800',
  wash: 'bg-cyan-100 text-cyan-800',
  commercial: 'bg-emerald-100 text-emerald-800',
  rv_boat: 'bg-teal-100 text-teal-800',
};

export const US_STATES: StateInfo[] = [
  { name: 'Alabama', code: 'AL', slug: 'alabama' },
  { name: 'Alaska', code: 'AK', slug: 'alaska' },
  { name: 'Arizona', code: 'AZ', slug: 'arizona' },
  { name: 'Arkansas', code: 'AR', slug: 'arkansas' },
  { name: 'California', code: 'CA', slug: 'california' },
  { name: 'Colorado', code: 'CO', slug: 'colorado' },
  { name: 'Connecticut', code: 'CT', slug: 'connecticut' },
  { name: 'Delaware', code: 'DE', slug: 'delaware' },
  { name: 'Florida', code: 'FL', slug: 'florida' },
  { name: 'Georgia', code: 'GA', slug: 'georgia' },
  { name: 'Hawaii', code: 'HI', slug: 'hawaii' },
  { name: 'Idaho', code: 'ID', slug: 'idaho' },
  { name: 'Illinois', code: 'IL', slug: 'illinois' },
  { name: 'Indiana', code: 'IN', slug: 'indiana' },
  { name: 'Iowa', code: 'IA', slug: 'iowa' },
  { name: 'Kansas', code: 'KS', slug: 'kansas' },
  { name: 'Kentucky', code: 'KY', slug: 'kentucky' },
  { name: 'Louisiana', code: 'LA', slug: 'louisiana' },
  { name: 'Maine', code: 'ME', slug: 'maine' },
  { name: 'Maryland', code: 'MD', slug: 'maryland' },
  { name: 'Massachusetts', code: 'MA', slug: 'massachusetts' },
  { name: 'Michigan', code: 'MI', slug: 'michigan' },
  { name: 'Minnesota', code: 'MN', slug: 'minnesota' },
  { name: 'Mississippi', code: 'MS', slug: 'mississippi' },
  { name: 'Missouri', code: 'MO', slug: 'missouri' },
  { name: 'Montana', code: 'MT', slug: 'montana' },
  { name: 'Nebraska', code: 'NE', slug: 'nebraska' },
  { name: 'Nevada', code: 'NV', slug: 'nevada' },
  { name: 'New Hampshire', code: 'NH', slug: 'new-hampshire' },
  { name: 'New Jersey', code: 'NJ', slug: 'new-jersey' },
  { name: 'New Mexico', code: 'NM', slug: 'new-mexico' },
  { name: 'New York', code: 'NY', slug: 'new-york' },
  { name: 'North Carolina', code: 'NC', slug: 'north-carolina' },
  { name: 'North Dakota', code: 'ND', slug: 'north-dakota' },
  { name: 'Ohio', code: 'OH', slug: 'ohio' },
  { name: 'Oklahoma', code: 'OK', slug: 'oklahoma' },
  { name: 'Oregon', code: 'OR', slug: 'oregon' },
  { name: 'Pennsylvania', code: 'PA', slug: 'pennsylvania' },
  { name: 'Rhode Island', code: 'RI', slug: 'rhode-island' },
  { name: 'South Carolina', code: 'SC', slug: 'south-carolina' },
  { name: 'South Dakota', code: 'SD', slug: 'south-dakota' },
  { name: 'Tennessee', code: 'TN', slug: 'tennessee' },
  { name: 'Texas', code: 'TX', slug: 'texas' },
  { name: 'Utah', code: 'UT', slug: 'utah' },
  { name: 'Vermont', code: 'VT', slug: 'vermont' },
  { name: 'Virginia', code: 'VA', slug: 'virginia' },
  { name: 'Washington', code: 'WA', slug: 'washington' },
  { name: 'West Virginia', code: 'WV', slug: 'west-virginia' },
  { name: 'Wisconsin', code: 'WI', slug: 'wisconsin' },
  { name: 'Wyoming', code: 'WY', slug: 'wyoming' },
];
