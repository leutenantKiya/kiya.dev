import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SeasonalProvider } from "@/components/providers/SeasonalProvider";
import { Shell } from "@/components/shell/Shell";
import { SeasonalLayer } from "@/components/seasonal/SeasonalLayer";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kiya — Portfolio",
  description:
    "Product engineer building complete products: interfaces, systems, and the complexity hidden in between.",
  icons: {
    icon: "/me.png",
    shortcut: "/me.png",
    apple: "/me.png",
  },
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
  try {
    // Holiday window: Nov 15 – Jan 6, in the viewer's local time. A saved choice wins.
    var d = new Date(), m = d.getMonth(), day = d.getDate();
    var inSeason = (m === 10 && day >= 15) || m === 11 || (m === 0 && day <= 6);
    var saved = null;
    try { saved = localStorage.getItem('kiya.dev:season'); } catch (e) {}
    if (saved === 'on' || (saved !== 'off' && inSeason)) {
      document.documentElement.setAttribute('data-season', 'christmas');
    }
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
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <SeasonalProvider>
              <Shell portraitSrc={portraitSrc} jetSrc={jetSrc}>
                {children}
              </Shell>
              <SeasonalLayer />
            </SeasonalProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

