import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about FindDetailersNow — our mission to connect car owners with the best auto detailers, ceramic coating specialists, and PPF installers across the US.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          About <span className="text-[#ff6b35]">FindDetailersNow</span>
        </h1>
        <p className="text-xl text-gray-500">
          Connecting car owners with the best auto detailing professionals across the US.
        </p>
      </div>

      <div className="prose prose-lg prose-gray max-w-none">
        <h2>Our Mission</h2>
        <p>
          FindDetailersNow was built with a simple goal: make it effortless for car owners to
          discover, compare, and contact professional auto detailers in their area.
        </p>
        <p>
          Whether you&apos;re searching for a basic wash and detail, a ceramic coating installer
          to protect your new car, or a paint protection film specialist for your track car —
          we make the search fast, transparent, and free.
        </p>

        <h2>For Car Owners</h2>
        <p>
          We index thousands of professional detailers, ceramic coating shops, and PPF installers
          across all 50 states. Every listing includes services offered, customer reviews, contact
          information, and more — so you can make an informed decision without calling around.
        </p>

        <h2>For Detailing Businesses</h2>
        <p>
          Basic listings on FindDetailersNow are always free. If you own a detailing business,{' '}
          <Link href="/claim" className="text-[#ff6b35] hover:underline font-medium">
            claim your listing
          </Link>{' '}
          to verify your information, respond to reviews, and connect with new customers.
          Premium placement options are also available for businesses that want maximum visibility.
        </p>

        <h2>What We Cover</h2>
        <ul>
          <li>Auto Detailing (interior &amp; exterior)</li>
          <li>Ceramic Coating &amp; Paint Sealants</li>
          <li>Paint Protection Film (PPF) &amp; Clear Bra</li>
          <li>Paint Correction &amp; Scratch Removal</li>
          <li>Interior Detailing &amp; Upholstery</li>
          <li>Mobile Detailing Services</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          Have questions, feedback, or want to report an inaccurate listing?{' '}
          <Link href="/contact" className="text-[#ff6b35] hover:underline font-medium">
            Reach out here
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
