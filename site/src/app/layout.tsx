import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Vision Aid",
    description: "Assistive tools for comfortable screen use",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Navbar />
                <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
            </body>
        </html>
    );
}



