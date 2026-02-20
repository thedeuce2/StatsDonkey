import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SloPitch Pro | Scorekeeper",
  description: "Live slo-pitch scoring and stats engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
