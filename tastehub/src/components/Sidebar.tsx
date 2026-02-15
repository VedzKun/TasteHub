'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { href: '/calendar', label: 'Calendar', icon: '⊟' },
    { href: '/posts', label: 'Posts', icon: '◫' },
    { href: '/add-post', label: 'Create Post', icon: '+' },
    { href: '/analytics', label: 'Analytics', icon: '◇' },
  ];

  if (!session) return null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#0d0d14] border-r border-[#1e1e2e] flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/dashboard" className="flex items-center space-x-1">
          <span className="text-white font-bold text-2xl tracking-wider">T</span>
          <span className="text-orange-400 text-xl">⚡</span>
          <span className="text-white font-bold text-2xl tracking-wider">ST</span>
        </Link>
        <p className="text-[#555] text-xs mt-1 font-mono">v1.0</p>
      </div>

      {/* User Avatar Block */}
      <div className="mx-4 mb-4">
        <div className="h-16 bg-[#00f0ff] rounded-md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#1a1a2e] text-[#00f0ff] border-l-2 border-[#00f0ff]'
                  : 'text-gray-400 hover:text-white hover:bg-[#13131f]'
              }`}
            >
              <span className={`text-base ${isActive ? 'text-[#00f0ff]' : 'text-gray-500'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 pb-6 space-y-2">
        <Link
          href="/settings"
          className="flex items-center justify-center w-full px-4 py-3 rounded-md text-sm font-medium text-[#ff00e5] border border-[#ff00e5] hover:bg-[#ff00e510] transition-all"
        >
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center justify-center w-full px-4 py-3 rounded-md text-sm font-medium text-gray-400 border border-[#2a2a3a] hover:text-white hover:border-gray-500 transition-all"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
