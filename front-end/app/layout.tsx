import type { Metadata } from "next";
import { Sora, DM_Mono, Rubik } from "next/font/google";
import "./globals.css";
import MiniKitProvider from "@/components/minikit-provider";
import dynamic from "next/dynamic";
import NextAuthProvider from "@/components/next-auth-provider";
import { WalletProvider } from "@/context/WalletContext";
import "@worldcoin/mini-apps-ui-kit-react/styles.css";
import { FooterTabs } from "@/components/FooterTabs";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "WorldAgg",
  description: "World aggregator, Claim your rewards and complete missions",
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body
        className={`
        ${sora.variable} 
        ${dmMono.variable} 
        ${rubik.variable} 
        bg-gray-50 
        text-gray-900 
        min-h-screen 
        flex 
        flex-col
        pb-24
      `}
      >
        <NextAuthProvider>
          <ErudaProvider>
            <MiniKitProvider>
              <WalletProvider>
                {children}
                <FooterTabs />
              </WalletProvider>
            </MiniKitProvider>
          </ErudaProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
