"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";
import { useTranslations } from "next-intl";

export default function LoginForm({ next }: { next?: string }) {
    const t = useTranslations("Login");
    const [state, formAction, isPending] = useActionState(login, null);

    return (
        <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="next" value={next ?? ""} />

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" name="email" type="email" required />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                />
            </div>

            {state?.error ?
                <p className="text-sm text-destructive" aria-live="polite">
                    {state.error}
                </p>
            :   null}

            <Button type="submit" disabled={isPending}>
                {isPending ? t("signing-in") : t("submit")}
            </Button>
        </form>
    );
}
