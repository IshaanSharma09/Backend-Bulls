// MedNexus Clinical System: layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { PersonaProvider } from "../lib/persona";
import { AuthProvider } from "../lib/authContext";
import { Navbar } from "../components/Navbar";
import { CUSTOM_DOMAIN } from "../lib/config";
import { Globe, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "MedNexus B2B | Rural-to-Metro Clinical Operating System",
  description:
    "Verified Pseudonymous Doctor Network, B2B Tele-Consult Ledger, Pre-Flight De-Identification, and Hospital k-Anonymity Scorecard.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text-main min-h-screen flex flex-col antialiased selection:bg-brand-accent selection:text-text-main">
        <AuthProvider>
          <PersonaProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
            <footer className="border-t border-border bg-white py-6 text-xs text-text-muted">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-main">MedNexus B2B</span>
                <span>|</span>
                <span>Rural-to-Metro Healthcare Operating System</span>
                <span>|</span>
                <span className="inline-flex items-center gap-1 font-mono text-brand-primary">
                  <Globe className="w-3 h-3" />
                  {CUSTOM_DOMAIN}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/privacy"
                  className="hover:text-brand-primary transition-colors font-medium"
                >
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link
                  href="/terms"
                  className="hover:text-brand-primary transition-colors font-medium"
                >
                  Terms and Conditions
                </Link>
                <span>•</span>
                <span className="text-text-muted">
                  NMC Verified System
                </span>
              </div>
            </div>
          </footer>
        </PersonaProvider>
      </AuthProvider>
      </body>
    </html>
  );
}
