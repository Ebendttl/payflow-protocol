import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductTour from '../components/ui/ProductTour';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata: Metadata = {
  title: 'PayFlow Protocol | Decentralized Streaming & Escrows',
  description:
    'Real-time payment streaming and milestone escrow platform built on Stellar Soroban.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              })()
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-dark-900 text-white">
        <ThemeProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(17, 24, 39, 0.9)',
                color: '#f3f4f6',
                border: '1px solid rgba(13, 148, 136, 0.3)',
                backdropFilter: 'blur(12px)',
              },
            }}
          />
          <Navbar />
          {children}
          <Footer />
          <ProductTour />
        </ThemeProvider>
      </body>
    </html>
  );
}
