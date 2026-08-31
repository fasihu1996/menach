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
import { useTranslations } from "next-intl";

interface NewItemFormProps {
    collections: Collection[];
}

export default function NewItemForm({ collections }: NewItemFormProps) {
    const t = useTranslations("ItemForm");
    const [state, formAction, isPending] = useActionState(createItem, null);
    const collectionItems = Object.fromEntries(
        collections.map((collection) => [
            String(collection.id),
            collection.title,
        ]),
    );

    return (
        <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">{t("title")}</Label>
                <Input id="title" name="title" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">{t("desc")}</Label>
                <Textarea id="description" name="description" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="date">{t("date")}</Label>
                <Input id="date" name="date" type="date" />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="collection">{t("collection")}</Label>
                <Select name="collection" items={collectionItems}>
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
                {isPending ? t("creating") : t("create")}
            </Button>
        </form>
    );
}
