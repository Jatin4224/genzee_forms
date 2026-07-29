import type { Metadata } from "next";
import localFont from "next/font/local";
import { Gochi_Hand } from "next/font/google";
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

//hand-drawn display font for headings (stand-in for "Prickly Pear").
//to use the real Prickly Pear: drop its file in ./fonts and swap this to
//localFont({ src: "./fonts/PricklyPear.woff2", variable: "--font-heading-src" }).
const headingFont = Gochi_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading-src",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Genzee Forms",
  description: "Create and share forms",
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
