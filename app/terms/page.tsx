import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'FindDetailersNow Terms of Service — rules and guidelines for using our platform.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: January 1, 2025</p>

      <div className="prose prose-gray max-w-none">
        <p>
          By using FindDetailersNow (&ldquo;the Service&rdquo;), you agree to these Terms of Service.
          Please read them carefully.
        </p>

        <h2>Use of the Service</h2>
        <p>
          FindDetailersNow provides a directory of auto detailing businesses. You may use the
          Service to search for, compare, and contact detailing businesses. You may not use the
          Service for any unlawful purpose or in any way that could damage or impair the Service.
        </p>

        <h2>Business Listings</h2>
        <p>
          Listings on FindDetailersNow are compiled from public sources. While we strive for
          accuracy, we do not warrant that listing information is complete, accurate, or
          up-to-date. Business owners may claim their listing to update information.
        </p>

        <h2>User Content</h2>
        <p>
          By submitting reviews or other content, you grant FindDetailersNow a non-exclusive,
          worldwide, royalty-free license to use, display, and distribute your content.
          You are responsible for ensuring your content is accurate and does not violate
          any third-party rights.
        </p>

        <h2>Reviews</h2>
        <p>
          Reviews must be honest and based on genuine experiences. We reserve the right to
          remove reviews that are fraudulent, abusive, or otherwise violate our guidelines.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          FindDetailersNow is a directory service and does not endorse or guarantee the services
          of any listed business. We are not liable for any transactions between you and a
          detailing business discovered through our Service.
        </p>

        <h2>Disclaimer of Warranties</h2>
        <p>
          The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not
          guarantee uninterrupted or error-free operation of the Service.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We may modify these Terms at any time. Continued use of the Service after changes
          constitutes acceptance of the new Terms.
        </p>

        <h2>Contact</h2>
        <p>
          For questions about these Terms, please contact us through our{' '}
          <a href="/contact" className="text-[#ff6b35]">contact page</a>.
        </p>
      </div>
    </div>
  );
}
