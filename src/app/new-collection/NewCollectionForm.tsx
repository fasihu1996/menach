"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCollection } from "./actions";

export default function NewCollectionForm() {
    const [state, formAction, isPending] = useActionState(
        createCollection,
        null,
    );

    return (
        <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="institution">Institution</Label>
                <Input id="institution" name="institution" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" required />
            </div>

            {state?.error ?
                <p className="text-sm text-destructive" aria-live="polite">
                    {state.error}
                </p>
            :   null}

            <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create collection"}
            </Button>
        </form>
    );
}
