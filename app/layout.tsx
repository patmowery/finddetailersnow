import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'FindDetailersNow – Find Auto Detailers Near You',
    template: '%s | FindDetailersNow',
  },
  description:
    'Find the best auto detailers, ceramic coating specialists, PPF installers, and mobile detailers near you. Browse thousands of verified listings across the US.',
  keywords: [
    'auto detailing',
    'car detailing',
    'ceramic coating',
    'paint protection film',
    'PPF',
    'mobile detailing',
    'paint correction',
    'find detailers',
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://finddetailersnow.com'
  ),
  openGraph: {
    type: 'website',
    siteName: 'FindDetailersNow',
    title: 'FindDetailersNow – Find Auto Detailers Near You',
    description:
      'Find the best auto detailers, ceramic coating specialists, and PPF installers near you.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50 antialiased`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
