"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCollection } from "./actions";
import { useTranslations } from "next-intl";

export default function NewCollectionForm() {
    const t = useTranslations("CollectionsForm");
    const [state, formAction, isPending] = useActionState(
        createCollection,
        null,
    );

    return (
        <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">{t("title")}</Label>
                <Input id="title" name="title" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="institution">{t("institution")}</Label>
                <Input id="institution" name="institution" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">{t("city")}</Label>
                <Input id="city" name="city" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="country">{t("country")}</Label>
                <Input id="country" name="country" required />
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
