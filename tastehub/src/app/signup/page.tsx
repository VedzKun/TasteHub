'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Registration successful, but login failed. Please try signing in.');
        setIsLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
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
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join TasteHub today</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-md text-white placeholder-gray-600 focus:ring-1 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#00f0ff] hover:underline font-medium">
              Sign In
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
