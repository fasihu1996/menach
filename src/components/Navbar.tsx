"use client";

import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import Search from "./Search";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav
            className={`bg-background/95  sticky top-0 z-50 w-full border-b backdrop-blur`}
        >
            <div className="mx-auto grid h-12 max-w-5xl grid-cols-3 items-center px-2 sm:h-16 sm:px-4">
                <div className="flex items-center">
                    <Link
                        href="/"
                        className="text-primary p-2 text-4xl font-bold sm:p-4 sm:text-2xl lg:text-4xl"
                    >
                        MENACH
                    </Link>
                </div>
                <Search className="flex justify-center" />
                <div className="flex items-center justify-end gap-1 sm:gap-4">
                    <Button
                        variant="ghost"
                        nativeButton={false}
                        render={<Link href="/">Items</Link>}
                    />
                    <Button
                        variant="ghost"
                        nativeButton={false}
                        render={<Link href="/collections">Collections</Link>}
                    />
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}
