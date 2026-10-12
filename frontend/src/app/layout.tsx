import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Expense Tracker - Modern corporate and personal expense management with Cloudinary receipt cloud storage and custom category intelligence.',
  icons: {
    icon: 'data:,',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
