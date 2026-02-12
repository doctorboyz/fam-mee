import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "FamMee - Family Finance Together",
  description: "Simple family finance management app",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
          <Providers>
          {children}
          </Providers>
      </body>
    </html>
  );
}
