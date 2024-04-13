import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import BottomBar from "./BottomBar";

const ReduxProvider = dynamic(() => import("@/redux/provider"), {
  ssr: false
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Media',
  description: 'This page is used to update rates',
  manifest: '/manifest.json'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider> {children}</ReduxProvider>
        <div className='pb-16'><BottomBar /></div>
      </body>
    </html>
  );
}