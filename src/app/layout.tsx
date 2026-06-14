import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xeno AI-Native CRM | Intelligent Marketing Automation",
  description: "Identify high-value segments with natural language, generate AI campaign copies with Gemini 2.5 Flash, and simulate omni-channel marketing campaigns in real-time.",
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground font-sans transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
