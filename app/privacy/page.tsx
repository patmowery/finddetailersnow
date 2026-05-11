import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | FindDetailersNow',
  description: 'FindDetailersNow Privacy Policy — how we collect, use, and protect your information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: January 1, 2025</p>

      <div className="prose prose-gray max-w-none">
        <p>
          FindDetailersNow (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to
          protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard
          information when you visit our website finddetailersnow.com.
        </p>

        <h2>Information We Collect</h2>
        <p>We collect information in the following ways:</p>
        <ul>
          <li>
            <strong>Information you provide:</strong> When you submit a claim form or contact us,
            we collect your name, email address, and any other information you provide.
          </li>
          <li>
            <strong>Usage data:</strong> We automatically collect information about how you use
            our site, including pages visited, time spent, and referring URLs.
          </li>
          <li>
            <strong>Cookies:</strong> We use cookies and similar tracking technologies to improve
            your experience and analyze site traffic.
          </li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To operate and improve our directory service</li>
          <li>To respond to claims and inquiries</li>
          <li>To send transactional communications related to your claim</li>
          <li>To analyze usage patterns and improve the user experience</li>
        </ul>

        <h2>Information Sharing</h2>
        <p>
          We do not sell your personal information. We may share information with trusted
          third-party service providers (such as hosting and analytics providers) who assist in
          operating our website, subject to confidentiality obligations.
        </p>

        <h2>Business Listing Data</h2>
        <p>
          Business names, addresses, phone numbers, and other contact information displayed in
          our directory are sourced from public records. If you are a business owner and wish to
          update or remove your information, please contact us.
        </p>

        <h2>Data Retention</h2>
        <p>
          We retain personal data only as long as necessary to provide our services or as required
          by law. You may request deletion of your data at any time by contacting us.
        </p>

        <h2>Your Rights</h2>
        <p>You have the right to access, correct, or delete personal information we hold about you.</p>

        <h2>Contact</h2>
        <p>
          For privacy-related questions, please contact us through our{' '}
          <a href="/contact" className="text-[#ff6b35]">contact page</a>.
        </p>
      </div>
    </div>
  );
}
