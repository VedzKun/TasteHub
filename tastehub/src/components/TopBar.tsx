'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface TopBarProps {
  title: string;
  subtitle: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { data: session } = useSession();

  return (
    <header className="h-20 border-b border-[#1e1e2e] bg-[#0d0d14] flex items-center justify-between px-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="flex items-center space-x-4">
        <Link
          href="/settings"
          className="flex items-center space-x-2 px-4 py-2 border border-[#2a2a3a] rounded-md text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-all"
        >
          <span>⚙</span>
          <span>Settings</span>
        </Link>
        <div className="w-10 h-10 bg-[#00f0ff] rounded-md flex items-center justify-center">
          <span className="text-black text-lg">👤</span>
        </div>
      </div>
    </header>
  );
}
