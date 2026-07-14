import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NuruLife Production Studio',
  description: 'In-house production management platform for NuruLife Productions — Shining Light, Transforming Lives.',
  icons: { icon: '/logo/nurulife-logo.png' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}