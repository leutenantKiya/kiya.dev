import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Shell } from "@/components/shell/Shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kiya —Portfolio",
  description:
    "Product engineer building complete products: interfaces, systems, and the complexity hidden in between.",
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('kiya.dev:theme');
    var theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var active = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', active);
    document.documentElement.classList.add(active);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const portraitSrc = fs.existsSync(
    path.join(process.cwd(), "public", "me.png"),
  )
    ? "/me.png"
    : null;

  const jetSrc = fs.existsSync(path.join(process.cwd(), "public", "jet.png"))
    ? "/jet.png"
    : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <Shell portraitSrc={portraitSrc} jetSrc={jetSrc}>
              {children}
            </Shell>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

