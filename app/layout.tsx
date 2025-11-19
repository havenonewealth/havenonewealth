import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"
import { ToastProvider } from "@/components/ui/toast-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "Haven One Wealth",
  description: "Track your royalties, residuals, and income sources.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundColor: "#f8f9fa",
          color: "#0A1E2D",
          fontFamily: "Lato, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
