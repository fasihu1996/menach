"use client";

import * as React from "react";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface SearchProps {
    className: string;
}

export default function Search({ className }: SearchProps) {
    function handleSearch(term: string) {
        console.log(term);
    }

    return (
        <div className={cn("relative flex", className)}>
            <Input
                className="peer block w-full rounded-md placeholder:text-gray-500 pl-2 text-sm"
                placeholder="Input search term..."
                onChange={(e) => {
                    handleSearch(e.target.value);
                }}
            />
            <Button
                type="button"
                variant="default"
                aria-label="Search"
                size="icon"
                className="absolute right-0"
            >
                <SearchIcon className="h-4 w-4" />
            </Button>
        </div>
    );
}
