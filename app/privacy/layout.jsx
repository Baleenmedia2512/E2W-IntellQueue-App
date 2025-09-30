export const metadata = {
  title: 'Privacy Policy - IntellQueue',
  description: 'Privacy Policy for IntellQueue - Smart Queue Management Application',
  robots: 'index, follow',
};

export default function PrivacyLayout({ children }) {
  // This layout bypasses authentication for public privacy policy access
  return (
    <>
      {children}
    </>
  );
}