import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'LifeTwin AI – Your Digital Twin & Life Decision Simulator',
  description: 'Create your AI digital twin and simulate life decisions before you make them',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{background:'#0a0a0f',minHeight:'100vh'}}>{children}</body>
    </html>
  )
}
