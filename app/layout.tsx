import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import MiniKitProvider from "@/components/minikit-provider";
import dynamic from "next/dynamic";
import NextAuthProvider from "@/components/next-auth-provider";
import "@worldcoin/mini-apps-ui-kit-react/styles.css";

const sora = Sora({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WLD101",
  description: "Template mini app for Worldcoin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ErudaProvider = dynamic(
    () => import("../components/Eruda").then((c) => c.ErudaProvider),
    {
      ssr: false,
    }
  );
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:ital@0;1&family=Rubik:ital,wght@0,300..900;1,300..900&family=Sora:wght@600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={sora.className}>
        <NextAuthProvider>
          <ErudaProvider>
            <MiniKitProvider>
              {children}
            </MiniKitProvider>
          </ErudaProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
