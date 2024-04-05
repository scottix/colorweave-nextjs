import type { Metadata } from 'next';

import Header from './header';

import './globals.css';

export const metadata: Metadata = {
  title: 'ColorWeave',
  description: 'Generate new color schemes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <Header />
        <div className='max-w-7xl mx-auto border-x border-gray-600'>
          {children}
        </div>
      </body>
    </html>
  );
}
