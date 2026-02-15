'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const authenticatedNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/calendar', label: 'Calendar', icon: '📅' },
    { href: '/add-post', label: 'Add Post', icon: '➕' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
  ];

  const publicNavItems = [
    { href: '/', label: 'Home', icon: '🏠' },
  ];

  const navItems = session ? authenticatedNavItems : publicNavItems;

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href={session ? '/dashboard' : '/'} className="flex items-center space-x-2">
              <span className="text-2xl">🍽️</span>
              <span className="text-white font-bold text-xl">TasteHub</span>
            </Link>
          </div>
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  pathname === item.href
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            
            {status === 'loading' ? (
              <div className="px-4 py-2 text-white">Loading...</div>
            ) : session ? (
              <div className="flex items-center space-x-2 ml-4">
                <span className="text-white text-sm hidden md:inline">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  href="/login"
                  className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
