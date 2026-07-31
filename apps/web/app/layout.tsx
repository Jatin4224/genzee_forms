import type { Metadata } from "next";
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

//elegant display serif for headings (Nuraform-style editorial feel).
const headingFont = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading-src",
  display: "swap",
});

const description =
  "Build a form, publish it, and share one link. Collect responses and watch the results roll in — all without writing a single line of code.";

export const metadata: Metadata = {
  title: {
    default: "Genzee Forms — forms with a cool vibe",
    template: "%s · Genzee Forms",
  },
  description,
  applicationName: "Genzee Forms",
  keywords: ["forms", "form builder", "surveys", "no-code", "Genzee Forms"],
  openGraph: {
    title: "Genzee Forms — forms with a cool vibe",
    description,
    siteName: "Genzee Forms",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Genzee Forms — forms with a cool vibe",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${headingFont.variable}`}
      >
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
