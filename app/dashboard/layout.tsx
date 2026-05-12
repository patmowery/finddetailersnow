import type { Metadata } from 'next';
import DashboardShell from '@/components/DashboardShell';

export const metadata: Metadata = {
  title: 'Business Dashboard | FindDetailersNow',
  description: 'Manage your auto detailing business listing.',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
