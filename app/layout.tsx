import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { MultiplayerProvider } from '@/context/MultiplayerContext'
import CustomCursor from '@/components/ui/CustomCursor'
import BackgroundWrapper from '@/components/ui/BackgroundWrapper'
import './globals.css'
import { Suspense } from 'react'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'AgroInsight - Smart Agricultural Dashboard',
  description: 'Real-time agricultural monitoring dashboard with crop health tracking, soil analysis, and intelligent farming insights.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'AgroInsight - Smart Agricultural Dashboard',
    description: 'Monitor your farm operations in real-time with advanced analytics and insights.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-background text-foreground custom-cursor-active">
        <CustomCursor />
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <MultiplayerProvider>
                <BackgroundWrapper>
                  {children}
                </BackgroundWrapper>
                <Toaster theme="dark" position="top-right" />
              </MultiplayerProvider>
            </Suspense>
          </CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
