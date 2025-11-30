import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HR Automation Suite | Automação de RH com IA",
  description: "Plataforma SaaS de automação de Recursos Humanos com agentes de IA especializados. Reduza 90% do tempo em tarefas operacionais de RH.",
  keywords: ["RH", "Recursos Humanos", "IA", "Automação", "SaaS", "HR Tech"],
  authors: [{ name: "HR Automation Suite" }],
  openGraph: {
    title: "HR Automation Suite",
    description: "Automatize seu RH com agentes de IA especializados",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${syne.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
