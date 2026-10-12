import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'Nova | Fintech Expense Management Dashboard',
  description: 'Modern, high-performance corporate expense management with Google Drive bill synchronization and custom category intelligence.',
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
