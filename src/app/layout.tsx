import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI YouTube Micro-Drama Network",
  description: "Autonomous AI system for generating viral YouTube micro-dramas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-900 text-white">
        {children}
      </body>
    </html>
  );
}
