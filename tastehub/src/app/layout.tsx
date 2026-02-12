import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostProvider } from "@/context/PostContext";
import { Navbar } from "@/components";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TasteHub - Social Media Planner",
  description: "Plan and schedule your social media content for 30 days",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <PostProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </PostProvider>
      </body>
    </html>
  );
}
