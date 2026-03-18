import type { Metadata } from "next";
import { EB_Garamond, IBM_Plex_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin", "latin-ext", "vietnamese"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Truy Xu\u1EA5t D\u1EEF Li\u1EC7u Ch\u1EE9ng Kho\u00E1n",
  description: "Truy xu\u1EA5t d\u1EEF li\u1EC7u l\u1ECBch s\u1EED giao d\u1ECBch ch\u1EE9ng kho\u00E1n Vi\u1EC7t Nam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${ebGaramond.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} ${newsreader.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
