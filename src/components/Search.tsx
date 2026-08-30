"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface SearchProps {
    className: string;
}

export default function Search({ className }: SearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const term = (new FormData(e.currentTarget).get("q") as string)?.trim();
        router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
    }

    return (
        <form
            className={cn("relative flex", className)}
            onSubmit={handleSubmit}
        >
            <Input
                key={searchParams.get("q") ?? ""}
                name="q"
                defaultValue={searchParams.get("q") ?? ""}
                className="peer block w-full rounded-md pl-2 text-sm placeholder:text-gray-500"
                placeholder="Input search term..."
            />
            <Button
                type="submit"
                variant="default"
                aria-label="Search"
                size="icon"
                className="absolute right-0"
            >
                <SearchIcon className="h-4 w-4" />
            </Button>
        </form>
    );
}
