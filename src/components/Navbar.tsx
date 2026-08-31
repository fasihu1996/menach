"use client";

import { Suspense } from "react";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import Search from "./Search";
import Link from "next/link";
import LanguageSelector from "./LanguageSelector";
import { ButtonGroup } from "./ui/button-group";
import { useTranslations } from "next-intl";

export default function Navbar() {
    const t = useTranslations("Navbar");
    return (
        <nav className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur">
            <div className="mx-auto flex h-12 max-w-5xl items-center gap-2 px-2 sm:h-16 sm:px-4">
                <Link
                    href="/"
                    className="text-primary shrink-0 p-2 text-xl font-bold sm:p-4 sm:text-2xl lg:text-4xl"
                >
                    MENACH
                </Link>
                <Suspense fallback={<div className="min-w-0 flex-1" />}>
                    <Search className="min-w-0 flex-1" />
                </Suspense>
                <div className="flex shrink-0 items-center gap-1 sm:gap-4">
                    <Button
                        variant="ghost"
                        nativeButton={false}
                        render={<Link href="/">{t("items")}</Link>}
                    />
                    <Button
                        variant="ghost"
                        nativeButton={false}
                        render={
                            <Link href="/collections">{t("collections")}</Link>
                        }
                    />
                    <ButtonGroup>
                        <LanguageSelector />
                        <ThemeToggle />
                    </ButtonGroup>
                </div>
            </div>
        </nav>
    );
}
