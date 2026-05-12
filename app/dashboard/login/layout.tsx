import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In | FindDetailersNow',
  description: 'Log into your business dashboard.',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  // No DashboardShell wrapper — login page renders standalone
  return <>{children}</>;
}
