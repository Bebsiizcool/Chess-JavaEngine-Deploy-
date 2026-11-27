import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlayChess - Master the Game of Kings",
  description: "Web-based chess application featuring an authoritative Java 21 OOP chess engine and Minimax AI with Alpha-Beta Pruning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Cinzel+Decorative:wght@700;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-neutral-100 antialiased selection:bg-gold-500/30 selection:text-gold-200">
        {children}
      </body>
    </html>
  );
}
