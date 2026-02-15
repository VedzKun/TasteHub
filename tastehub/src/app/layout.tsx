import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PostProvider } from "@/context/PostContext";
import AuthProvider from "@/components/AuthProvider";
import AppShell from "@/components/AppShell";

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
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0f] text-gray-200 min-h-screen`}>
        <AuthProvider>
          <PostProvider>
            <AppShell>{children}</AppShell>
          </PostProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
