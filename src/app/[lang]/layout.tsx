import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Raleway } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

const ralewayHeading = Raleway({
    subsets: ["latin"],
    variable: "--font-heading",
});

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export function generateStaticParams() {
    return routing.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Metadata");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function RootLayout({
    children,
}: LayoutProps<"/[lang]">) {
    const lang = await getLocale();

    return (
        <>
            <html
                lang={lang}
                suppressHydrationWarning
                className={cn(
                    "h-full",
                    "antialiased",
                    geistSans.variable,
                    geistMono.variable,
                    "font-sans",
                    notoSans.variable,
                    ralewayHeading.variable,
                )}
            >
                <body className="min-h-full flex flex-col">
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                    >
                        <NextIntlClientProvider>
                            <Navbar />
                            <main className="mx-auto w-full max-w-5xl flex-1">
                                {children}
                            </main>
                        </NextIntlClientProvider>
                    </ThemeProvider>
                </body>
            </html>
        </>
    );
}
