// src/app/layout.tsx

import '../../styles/globals.css';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/app/components/Header";
import Footer from "./components/Footer";
import { ThemeProvider } from 'next-themes';
import { RoleProvider } from '@/app/components/role-context';
import ClientLayoutWrapper from '@/app/components/ClientLayoutWrapper';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resume AI",
  description: "AI-powered resume analysis",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RoleProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <ClientLayoutWrapper>
              <Header />
              <main className="max-w-5xl mx-auto px-4 py-6 pt-3">
                {children}
              </main>
              <Footer />
            </ClientLayoutWrapper>
          </ThemeProvider>
        </RoleProvider>
      </body>
    </html>
  );
}