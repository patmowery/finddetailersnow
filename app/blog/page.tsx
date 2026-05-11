import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Auto Detailing Blog | FindDetailersNow',
  description:
    'Tips, guides, and industry insights for auto detailing, ceramic coating, PPF, and keeping your car looking its best.',
  alternates: { canonical: '/blog' },
};

const POSTS = [
  {
    slug: 'ceramic-coating-vs-ppf',
    title: 'Ceramic Coating vs. Paint Protection Film: Which Is Right for Your Car?',
    excerpt:
      "Both ceramic coating and PPF protect your car's paint, but they work differently. Here's a breakdown of the pros and cons of each option to help you decide.",
    date: 'December 10, 2024',
    category: 'Ceramic Coating',
    readTime: '5 min read',
  },
  {
    slug: 'how-often-detail-your-car',
    title: 'How Often Should You Detail Your Car? A Complete Guide',
    excerpt:
      "There's no one-size-fits-all answer. Your detailing schedule depends on where you live, how you drive, and how much you care about your car's appearance.",
    date: 'November 28, 2024',
    category: 'Auto Detailing',
    readTime: '4 min read',
  },
  {
    slug: 'paint-correction-guide',
    title: 'Paint Correction Explained: Levels, Costs, and What to Expect',
    excerpt:
      'Paint correction is one of the most transformative detailing services. Learn what it involves, how much it costs, and how to find a qualified professional.',
    date: 'November 15, 2024',
    category: 'Paint Correction',
    readTime: '6 min read',
  },
  {
    slug: 'mobile-detailing-pros-cons',
    title: 'Mobile Detailing: Is It Worth It? (Pros, Cons, and What to Look For)',
    excerpt:
      'Mobile detailing brings professional results to your door. But is the convenience worth the cost? We break down what you need to know before booking.',
    date: 'October 30, 2024',
    category: 'Mobile Detailing',
    readTime: '4 min read',
  },
  {
    slug: 'interior-detailing-tips',
    title: '10 Interior Detailing Tips the Pros Use (That You Can Do at Home)',
    excerpt:
      'Want a showroom-clean interior? These are the techniques professional detailers use — and most of them work great as DIY maintenance between full details.',
    date: 'October 12, 2024',
    category: 'Interior Detailing',
    readTime: '7 min read',
  },
  {
    slug: 'ppf-installation-cost',
    title: 'How Much Does PPF Installation Cost in 2025?',
    excerpt:
      'Paint protection film prices vary widely depending on coverage, film brand, and installer. Here is what to expect and how to get the best value.',
    date: 'September 25, 2024',
    category: 'PPF',
    readTime: '5 min read',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Ceramic Coating': 'bg-purple-100 text-purple-800',
  'Auto Detailing': 'bg-blue-100 text-blue-800',
  'Paint Correction': 'bg-red-100 text-red-800',
  'Mobile Detailing': 'bg-orange-100 text-orange-800',
  'Interior Detailing': 'bg-yellow-100 text-yellow-800',
  PPF: 'bg-green-100 text-green-800',
};

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#1e3a5f]">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Blog</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">Auto Detailing Blog</h1>
        <p className="mt-3 text-lg text-gray-500">
          Expert tips, guides, and insights for keeping your car looking its best.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {POSTS.map((post) => (
          <article
            key={post.slug}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Placeholder image */}
            <div className="h-44 bg-gradient-to-br from-[#1e3a5f] to-[#2a4d7a] relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/20 text-6xl font-black">
                  {post.category[0]}
                </span>
              </div>
              <span
                className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-700'
                }`}
              >
                {post.category}
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span>{post.date}</span>
                <span>&middot;</span>
                <span>{post.readTime}</span>
              </div>

              <Link href={`/blog/${post.slug}`}>
                <h2 className="font-bold text-gray-900 text-lg leading-snug hover:text-[#1e3a5f] transition-colors mb-2">
                  {post.title}
                </h2>
              </Link>

              <p className="text-sm text-gray-500 line-clamp-3">{post.excerpt}</p>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[#ff6b35] hover:text-orange-600 transition-colors"
              >
                Read more
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
