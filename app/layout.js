import { Inter, Poppins, Montserrat } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
// import BottomBar from "./BottomBar";
import { CartProvider } from "./context/CartContext";
import BottomBarWrapper from "./BottomBarWrapper"; // Import the new client component
import { ToastContainer } from "./components/ToastContainer";
import ConditionalFcmWrapper from "./ConditionalFcmWrapper";
import RequireCompanyName from "./components/RequireCompanyName";
import MobileAppProvider from "./components/MobileAppProvider"; // Mobile app initialization
import ErrorBoundary from "./components/ErrorBoundary"; // Error boundary for mobile
import TrailingSlash from "./components/TrailingSlash";

const ReduxProvider = dynamic(() => import("@/redux/provider"), {
  ssr: false
});

const inter = Inter({ subsets: ["latin"] });

const poppins = Poppins({
  weight: ['400', '700'],  // Choose the weights you want
  subsets: ['latin'],      // Choose the subsets you need
  variable: '--font-poppins',  // Variable for custom CSS
});

const montserrat = Montserrat({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata = {
  title: 'IntellQueue',
  description: 'Intelligent Queue Management System - Making queue management easy and efficient',
  manifest: '/manifest.json'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${montserrat.variable} ${inter.className}`}>
        <ErrorBoundary>
          <ReduxProvider> 
            <CartProvider> 
              <MobileAppProvider>
                <TrailingSlash />
                <ConditionalFcmWrapper />
                <RequireCompanyName>
                  {children}
                </RequireCompanyName>
                <ToastContainer />
                <div>
                  <BottomBarWrapper />
                </div>
              </MobileAppProvider>
            </CartProvider>
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}