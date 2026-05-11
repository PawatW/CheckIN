import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "TimeCheck – GPS Attendance",
  description: "Smart attendance tracking with GPS geofencing and Face ID",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1D9E75",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
