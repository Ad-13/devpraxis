import { Inter, JetBrains_Mono, Rajdhani } from 'next/font/google';

const rajdhani = Rajdhani({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rajdhani',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

/** Class list to put on <html> so all three variables are in scope. */
export const fontVariables = `${rajdhani.variable} ${inter.variable} ${jetbrainsMono.variable}`;
