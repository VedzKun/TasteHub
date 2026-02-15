'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your content empire at a glance' },
  '/calendar': { title: 'Content Calendar', subtitle: 'Plan and visualize your social content strategy' },
  '/posts': { title: 'Posts', subtitle: 'Manage all your scheduled and published content' },
  '/add-post': { title: 'Create Post', subtitle: 'Schedule content for your social media platforms' },
  '/analytics': { title: 'Analytics', subtitle: 'Track engagement and performance across platforms' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account and preferences' },
};

const publicPages = ['/', '/login', '/signup'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isPublic = publicPages.includes(pathname);

  // Public pages: no sidebar
  if (isPublic || !session) {
    return <>{children}</>;
  }

  const meta = pageMeta[pathname] || { title: '', subtitle: '' };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[240px]">
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <main className="px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
