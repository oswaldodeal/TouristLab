import './globals.css';

export const metadata = {
  title: 'TouristLab · Discover What\'s Around You',
  description: 'TouristLab — Find local businesses within 1km of your location in Manchester.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
