import type { Metadata } from 'next';
import { Playfair_Display, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Swaahara — Botanical Clinical Food Almanac',
  description: 'Instant, personalized dietary safety screening against your clinical profile, allergies, and metabolic targets.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body className="bg-[#FBF6F3] text-[#3A2E2C] font-sans antialiased min-h-screen flex flex-col selection:bg-[#D9A8A0] selection:text-[#3A2E2C]">
        {/* Paper Grain Overlay */}
        <div className="paper-grain-overlay" aria-hidden="true" />

        {/* Global Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 pt-20 w-full">{children}</main>

        {/* Footer */}
        <footer className="border-t border-[#EDE0DA] bg-[#F6ECE7]/60 py-8 px-4 text-center text-xs text-[#3A2E2C]/70">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-display font-semibold text-[#3A2E2C]">
              Swaa<span className="italic font-normal text-[#C27B66]">hara</span> &copy; 2026 — Clinical Botanical Intelligence
            </p>
            <p className="tracking-wide uppercase text-[10px] text-[#3A2E2C]/60 font-medium">
              Screening against Clara M.&apos;s Profile &bull; Zero API / Hackathon Mock Mode
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
