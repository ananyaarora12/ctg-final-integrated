import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Samarthanam - Volunteer Platform',
  description: 'A platform for volunteers to engage with events and activities organized by Samarthanam Trust',
  icons: {
    icon: '/favicon-samarthanam.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
