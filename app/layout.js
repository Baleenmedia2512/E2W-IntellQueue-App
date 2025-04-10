import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
// import BottomBar from "./BottomBar";
import BottomBarWrapper from "./BottomBarWrapper"; // Import the new client component

const ReduxProvider = dynamic(() => import("@/redux/provider"), {
  ssr: false
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Easy2Work(T)',
  description: 'A wonderful CRM which will make work of a business, easy and fast',
  manifest: '/manifest.json'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          {children}
          <BottomBarWrapper /> {/* Use the client component for conditional rendering */}
        </ReduxProvider>
      </body>
    </html>
  );
}