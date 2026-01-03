import './globals.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Inter } from 'next/font/google';
import LayoutWrapper from '../components/LayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Star FM Admin',
  description: 'Star FM Radio Administration Panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
