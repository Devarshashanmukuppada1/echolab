import type { Metadata } from 'next'
import { Providers } from './providers'
import { SidebarProvider } from '@/contexts/sidebar-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'EchoLab - AI Voice Cloning & Text-to-Speech Platform',
  description: 'Advanced AI voice cloning and text-to-speech platform with real-time audio processing',
  keywords: ['voice cloning', 'text-to-speech', 'AI voices', 'audio processing'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  )
}