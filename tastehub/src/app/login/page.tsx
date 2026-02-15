'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="bg-[#111118] border border-[#2a2a3a] p-8 rounded-lg w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-1 mb-4">
            <span className="text-white font-bold text-2xl tracking-wider">T</span>
            <span className="text-orange-400 text-xl">⚡</span>
            <span className="text-white font-bold text-2xl tracking-wider">ST</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Sign In</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back to TasteHub</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00f0ff] text-black py-3 rounded-md font-semibold hover:bg-[#00d4e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_#00f0ff20]"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#00f0ff] hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2a3a]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#111118] text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="flex items-center justify-center px-4 py-3 border border-[#2a2a3a] rounded-md hover:border-gray-500 transition-colors"
            >
              <span className="text-sm font-medium text-gray-400">Google</span>
            </button>
            <button
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              className="flex items-center justify-center px-4 py-3 border border-[#2a2a3a] rounded-md hover:border-gray-500 transition-colors"
            >
              <span className="text-sm font-medium text-gray-400">GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
