import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Titanium Suplementos - Sua Loja de Suplementos Premium',
  description: 'Suplementos de alta qualidade para atletas e entusiastas do fitness. Whey protein, creatina, pré-treinos e muito mais com os melhores preços.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Titanium Suplementos',
    description: 'Sua loja de suplementos premium',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              className:
                'data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
