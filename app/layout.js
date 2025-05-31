import { Inter, Poppins, Montserrat } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
// import BottomBar from "./BottomBar";
import { CartProvider } from "./context/CartContext";
import BottomBarWrapper from "./BottomBarWrapper"; // Import the new client component
import { ToastContainer } from "./components/ToastContainer";

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
  title: 'Easy2Work(T)',
  description: 'A wonderful CRM which will make work of a business, easy and fast',
  manifest: '/manifest.json'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${montserrat.variable} ${inter.className}`}>
      <ReduxProvider> 
          <CartProvider> 
            {children}
            <ToastContainer />
            <div>
              <BottomBarWrapper />
            </div>
          </CartProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}