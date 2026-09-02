"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

interface SearchProps {
    className?: string;
}

export default function Search({ className }: SearchProps) {
    const t = useTranslations("Components");
    const router = useRouter();
    const searchParams = useSearchParams();

    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const term = (new FormData(e.currentTarget).get("q") as string)?.trim();
        router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
    }

    return (
        <div
            className={cn(
                "flex min-w-0 items-center justify-center",
                className,
            )}
        >
            <Link
                href="/search"
                aria-label="Search"
                className="hidden size-7 shrink-0 items-center justify-center rounded-md hover:bg-muted min-[400px]:flex sm:hidden"
            >
                <SearchIcon className="h-4 w-4" />
            </Link>
            <form
                className="relative hidden w-full min-w-0 max-w-sm sm:flex"
                onSubmit={handleSubmit}
            >
                <Input
                    key={searchParams.get("q") ?? ""}
                    name="q"
                    defaultValue={searchParams.get("q") ?? ""}
                    className="peer block w-full rounded-md ps-2 text-sm placeholder:text-gray-500"
                    placeholder={t("input-search")}
                />
                <Button
                    type="submit"
                    variant="default"
                    aria-label="Search"
                    size="icon"
                    className="absolute inset-e-0"
                >
                    <SearchIcon className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
