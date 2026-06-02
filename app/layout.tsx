import type { Metadata } from "next";
import { Bebas_Neue, Archivo_Black, Inter, Playfair_Display } from "next/font/google";
import { TopBar } from "@/components/TopBar";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const archivo = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "World Cup 26 Wallchart",
  description:
    "A vintage-inspired wallchart for the 2026 FIFA World Cup. Track fixtures, enter your own predictions, watch the bracket unfold.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${archivo.variable} ${playfair.variable} ${inter.variable}`}
    >
      <body className="min-h-screen antialiased">
        <TopBar />
        {children}
      </body>
    </html>
  );
}
