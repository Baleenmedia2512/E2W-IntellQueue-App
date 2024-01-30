import { Inter } from 'next/font/google'
import './globals.css'
import BottomBar from './BottomBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Rates Validation',
  description: 'This page is used to update rates',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}
      <div className='pb-10'><BottomBar /></div>
      
      </body>
    </html>
  )
}
