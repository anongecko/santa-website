import { Metadata } from 'next'
import { Providers } from '@/app/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Santa Chat - Magical AI Christmas Conversations',
  description: 'Have a magical chat with Santa Claus powered by AI. Share your Christmas wishes and get personalized responses!',
  keywords: ['Santa Chat', 'Christmas', 'AI Santa', 'Kids Chat', 'Holiday Magic'],
  authors: [{ name: 'Santa Chat Team' }],
  creator: 'Santa Chat',
  publisher: 'Santa Chat',
  robots: 'index, follow',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
