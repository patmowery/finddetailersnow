import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing – Grow Your Detailing Business',
  description:
    'Choose the right plan to get more customers. Free listing, Pro visibility, or Featured placement on FindDetailersNow.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
