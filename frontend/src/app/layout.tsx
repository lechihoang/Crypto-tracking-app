import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatBubble from "@/components/ChatBubble";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

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
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <ChatBubble />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#1f2937', // dark-800
                color: '#f9fafb', // gray-50
                borderRadius: '0.75rem',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                border: '1px solid #4b5563', // gray-600
                cursor: 'pointer',
                maxWidth: '400px',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#1E2026',
                  color: '#16C784',
                  border: '1px solid #16C784',
                },
                iconTheme: {
                  primary: '#16C784',
                  secondary: '#1E2026',
                },
              },
              error: {
                duration: 3000,
                style: {
                  background: '#1E2026',
                  color: '#EA3943',
                  border: '1px solid #EA3943',
                },
                iconTheme: {
                  primary: '#EA3943',
                  secondary: '#1E2026',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
