"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createItem } from "./actions";
import type { Collection } from "@/lib/types";

interface NewItemFormProps {
    collections: Collection[];
}

export default function NewItemForm({ collections }: NewItemFormProps) {
    const [state, formAction, isPending] = useActionState(createItem, null);

    return (
        <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="collection">Collection</Label>
                <Select name="collection">
                    <SelectTrigger id="collection" className="w-full">
                        <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                        {collections.map((collection) => (
                            <SelectItem
                                key={collection.id}
                                value={String(collection.id)}
                            >
                                {collection.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {state?.error ?
                <p className="text-sm text-destructive" aria-live="polite">
                    {state.error}
                </p>
            :   null}

            <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create item"}
            </Button>
        </form>
    );
}
