import type { Metadata } from "next";
import { Nunito, Lora } from "next/font/google";
import "./globals.css";
import { FloatingBlobs, ErrorBoundary } from "../components";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Solance - Learning that gets you",
  description: "From Python to Piano, Solance smooths out the learning curve. No rigid courses. Just an adaptive path that evolves with you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${lora.variable} min-h-screen flex flex-col relative`}>
        <FloatingBlobs />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
