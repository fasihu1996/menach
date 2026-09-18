"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { getTranslations } from "next-intl/server";

export type LoginState = {
    error?: string;
} | null;

function safeNext(next: string | null): string {
    return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function login(
    _prevState: LoginState,
    formData: FormData,
): Promise<LoginState> {
    const t = await getTranslations("Login");

    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;
    const next = formData.get("next") as string | null;

    if (!email || !password) {
        return { error: t("err-required") };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: t("err-invalid-creds") };
    }

    redirect(safeNext(next));
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
}
