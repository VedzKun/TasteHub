import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#1e1e2e]">
        <Link href="/" className="flex items-center space-x-1">
          <span className="text-white font-bold text-2xl tracking-wider">T</span>
          <span className="text-orange-400 text-xl">⚡</span>
          <span className="text-white font-bold text-2xl tracking-wider">ST</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-gray-400 hover:text-white px-4 py-2 text-sm transition-colors">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-[#00f0ff] text-black px-5 py-2 rounded-md text-sm font-medium hover:bg-[#00d4e0] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00f0ff08] to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your Content Empire,{' '}
            <span className="text-[#00f0ff] neon-cyan">Simplified</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Plan, schedule, and analyze your social media content across Instagram, Facebook, and Twitter — all in one dark, sleek dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-[#00f0ff] text-black px-8 py-4 rounded-md font-semibold text-lg hover:bg-[#00d4e0] transition-colors shadow-[0_0_20px_#00f0ff30]"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="border border-[#2a2a3a] text-white px-8 py-4 rounded-md font-semibold text-lg hover:border-[#00f0ff] hover:text-[#00f0ff] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Powerful Features to Grow Your Brand
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#111118] border border-[#2a2a3a] p-8 rounded-lg hover:border-[#00f0ff60] transition-all">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-white mb-3">Content Calendar</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Plan and organize your posts up to 30 days in advance with an intuitive visual calendar</p>
            </div>
            <div className="bg-[#111118] border border-[#2a2a3a] p-8 rounded-lg hover:border-[#ff00e560] transition-all">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">Analytics Dashboard</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Track engagement, reach, and performance metrics across all your social platforms</p>
            </div>
            <div className="bg-[#111118] border border-[#2a2a3a] p-8 rounded-lg hover:border-[#00ff8860] transition-all">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Suggestions</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Get AI-powered content suggestions and best practices tailored for each platform</p>
            </div>
            <div className="bg-[#111118] border border-[#2a2a3a] p-8 rounded-lg hover:border-[#ff880060] transition-all">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Platform</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Manage Instagram Reels, Facebook posts, and Twitter tweets all in one place</p>
            </div>
            <div className="bg-[#111118] border border-[#2a2a3a] p-8 rounded-lg hover:border-[#00f0ff60] transition-all">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold text-white mb-3">Schedule Posts</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Schedule content automatically at optimal times for maximum engagement</p>
            </div>
            <div className="bg-[#111118] border border-[#2a2a3a] p-8 rounded-lg hover:border-[#ff00e560] transition-all">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-white mb-3">Content Insights</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Discover what performs best and replicate success with data-driven insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 border-t border-[#1e1e2e]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of content creators and businesses who trust TasteHub
          </p>
          <Link
            href="/signup"
            className="inline-block bg-[#ff00e5] text-white px-10 py-4 rounded-md font-semibold text-lg hover:bg-[#d400c0] transition-colors shadow-[0_0_20px_#ff00e530]"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2e] py-8 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 text-sm">© 2026 TasteHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
