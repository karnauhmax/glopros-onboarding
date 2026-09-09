import { Montserrat, Roboto } from 'next/font/google';

export const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['600'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const roboto = Roboto({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

export const fontClassName = `${montserrat.variable} ${roboto.variable}`;
