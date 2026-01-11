import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BookFlow - Sistema de Reservas Profesional",
  description: "Sistema de reservas y citas para profesionales independientes",
  keywords: ["reservas", "citas", "booking", "calendario", "profesionales"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="relative min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}