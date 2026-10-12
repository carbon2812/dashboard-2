import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Expense Tracker - Modern corporate and personal expense management with VPS receipt storage and custom category intelligence.',
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
          <AuthProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
