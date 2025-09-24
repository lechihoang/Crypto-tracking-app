import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatBubble from "@/components/ChatBubble";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crypto Tracker - Theo dõi giá tiền điện tử",
  description: "Ứng dụng theo dõi giá tiền điện tử real-time với tính năng tìm kiếm, so sánh và thông tin chi tiết các đồng coin hàng đầu",
  keywords: ["crypto", "cryptocurrency", "bitcoin", "ethereum", "price tracker", "crypto news"],
  authors: [{ name: "Crypto Tracker Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ChatBubble />
      </body>
    </html>
  );
}
