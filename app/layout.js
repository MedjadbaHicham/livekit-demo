import "./globals.css";

export const metadata = {
  title: "Live video room",
  description: "A browser video room built with Next.js and LiveKit. No install needed.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
