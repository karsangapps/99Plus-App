import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: '99Plus — Surgical CUET Selection Engine',
    template: '%s — 99Plus',
  },
  description: '99Plus: India\'s surgical CUET prep platform. Score → Diagnosis → Drill → Seat.',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

