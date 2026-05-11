import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogPost, getAllBlogPosts } from '@/data/blog-posts';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.metaDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  // Simple markdown-ish rendering (handles ## headings, **bold**, |tables|, - lists, [links])
  const renderContent = (content: string) => {
    const lines = content.trim().split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let isHeader = true;
    let key = 0;

    const processInline = (text: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      const regex = /\*\*(.*?)\*\*|\[(.*?)\]\((.*?)\)|`(.*?)`/g;
      let lastIdx = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIdx) {
          parts.push(text.slice(lastIdx, match.index));
        }
        if (match[1]) {
          parts.push(<strong key={`b-${match.index}`}>{match[1]}</strong>);
        } else if (match[2] && match[3]) {
          parts.push(
            <Link key={`l-${match.index}`} href={match[3]} className="text-[#ff6b35] hover:underline">
              {match[2]}
            </Link>
          );
        } else if (match[4]) {
          parts.push(
            <code key={`c-${match.index}`} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">
              {match[4]}
            </code>
          );
        }
        lastIdx = match.index + match[0].length;
      }
      if (lastIdx < text.length) parts.push(text.slice(lastIdx));
      return parts;
    };

    const flushTable = () => {
      if (tableRows.length === 0) return;
      elements.push(
        <div key={`t-${key++}`} className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {tableRows[0]?.map((cell, ci) => (
                  <th key={ci} className="border border-gray-200 px-4 py-2 text-left font-semibold text-[#1e3a5f]">
                    {processInline(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-gray-200 px-4 py-2">
                      {processInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      isHeader = true;
    };

    for (const line of lines) {
      const trimmed = line.trim();

      // Table row
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.slice(1, -1).split('|');
        // Skip separator rows
        if (cells.every((c) => /^[\s-:]+$/.test(c))) {
          isHeader = false;
          continue;
        }
        if (!inTable) inTable = true;
        tableRows.push(cells);
        continue;
      } else if (inTable) {
        inTable = false;
        flushTable();
      }

      if (trimmed === '') {
        continue;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-2xl font-bold text-[#1e3a5f] mt-10 mb-4">
            {trimmed.slice(3)}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className="text-xl font-bold text-[#1e3a5f] mt-8 mb-3">
            {trimmed.slice(4)}
          </h3>
        );
      } else if (trimmed.startsWith('- ')) {
        elements.push(
          <li key={key++} className="ml-6 mb-1 text-gray-700 list-disc">
            {processInline(trimmed.slice(2))}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        elements.push(
          <li key={key++} className="ml-6 mb-1 text-gray-700 list-decimal">
            {processInline(trimmed.replace(/^\d+\.\s/, ''))}
          </li>
        );
      } else {
        elements.push(
          <p key={key++} className="text-gray-700 leading-relaxed mb-4">
            {processInline(trimmed)}
          </p>
        );
      }
    }
    if (inTable) flushTable();
    return elements;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#ff6b35]">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/blog" className="hover:text-[#ff6b35]">Blog</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700">{post.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <span className="inline-block bg-[#1e3a5f] text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e3a5f] mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readTime}</span>
        </div>
      </div>

      {/* Content */}
      <article className="prose-custom">
        {renderContent(post.content)}
      </article>

      {/* CTA */}
      <div className="mt-16 bg-[#1e3a5f] text-white rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Find a Detailer Near You</h2>
        <p className="text-gray-300 mb-6">
          Browse verified auto detailing professionals in your area.
        </p>
        <Link
          href="/states"
          className="inline-block bg-[#ff6b35] hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl transition-all"
        >
          Browse Detailers
        </Link>
      </div>

      {/* Back to blog */}
      <div className="mt-10 text-center">
        <Link href="/blog" className="text-[#ff6b35] hover:underline font-semibold">
          ← Back to all articles
        </Link>
      </div>
    </div>
  );
}
