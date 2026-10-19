import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Team Task Tracker Tool | Team Task Tracker with Role-Based Permissions & Activity Timeline',
  description: 'Collaborate with teams, assign tasks, enforce Admin/Member roles, and track real-time activity timelines.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white"
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
