// _app.js

import 'tailwindcss/tailwind.css'; // Import Tailwind CSS directly

import { Head } from 'next/document';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Add meta tags for PWA configuration */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        {/* Add other meta tags as needed */}
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;