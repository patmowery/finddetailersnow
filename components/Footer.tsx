import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1e3a5f] text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-white font-bold text-xl">
              <span className="text-[#ff6b35]">Find</span>DetailersNow
            </Link>
            <p className="mt-3 text-sm text-gray-400 max-w-xs">
              The #1 directory for finding professional auto detailers, ceramic coating
              specialists, and PPF installers near you.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Browse
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/states" className="hover:text-[#ff6b35] transition-colors">All States</Link></li>
              <li><Link href="/blog" className="hover:text-[#ff6b35] transition-colors">Blog</Link></li>
              <li><Link href="/statistics" className="hover:text-[#ff6b35] transition-colors">Industry Statistics</Link></li>
              <li><Link href="/claim" className="hover:text-[#ff6b35] transition-colors">List Your Business</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-[#ff6b35] transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-[#ff6b35] transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-[#ff6b35] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#ff6b35] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-sm text-gray-500 text-center">
          &copy; {year} FindDetailersNow.com &mdash; All rights reserved.
        </div>
      </div>
    </footer>
  );
}
