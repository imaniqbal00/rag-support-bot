import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BotBase — RAG Support Bot Builder',
  description: 'Upload your docs and get an embeddable AI support chatbot in minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
