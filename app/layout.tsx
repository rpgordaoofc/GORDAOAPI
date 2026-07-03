import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'RP GORDAO - Dashboard Administrativa',
  description: 'RP GORDAO API - Plataforma completa para gerenciamento de licenças, autenticação e controle de acesso.',
  generator: 'rpgordao',
  icons: {
    icon: [
      { url: '/RG.png', type: 'image/png' },
    ],
    apple: '/RG.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
