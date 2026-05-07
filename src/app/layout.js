import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Spass mit Deutsch Benin | Plateforme de Résultats",
  description: "Plateforme officielle de consultation des résultats d'examen pour le centre de formation Spass mit Deutsch au Bénin.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

import { Providers } from "./providers";
import { CookieConsent } from "@/components/CookieConsent";

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="font-sans">
        <Providers>
          <Toaster position="top-right" />
          <CookieConsent />
          {children}
        </Providers>
      </body>
    </html>
  );
}
