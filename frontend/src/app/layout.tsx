import type { Metadata } from "next";
import { Nunito, Lora, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';
import { FloatingBlobs, ErrorBoundary, SolanceHeader } from "../components";
import { ModelModeProvider } from "../contexts";

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

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      <body className={`${nunito.variable} ${lora.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} min-h-screen flex flex-col relative`}>
        <ModelModeProvider>
          <FloatingBlobs />
          <SolanceHeader />
          <ErrorBoundary>
            <main>
              {children}
            </main>
          </ErrorBoundary>
        </ModelModeProvider>
      </body>
    </html>
  );
}
