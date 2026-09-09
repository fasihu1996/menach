import { redirect } from "next/navigation";
import { getEntries } from "@/utils/supabase";
import type { Collection } from "@/lib/types";
import NewItemForm from "./NewItemForm";
import { getTranslations, getLocale } from "next-intl/server";
import { verifyProducerSession } from "@/lib/dal";

export default async function NewItemPage() {
    const session = await verifyProducerSession();
    if (!session) {
        const locale = await getLocale();
        redirect(`/${locale}/auth/login?next=/${locale}/new-item`);
    }

    const t = await getTranslations("DatabasePage");
    const collections = (await getEntries("collections", "id,title")) as
        | Collection[]
        | null;

    return (
        <div className="mx-auto flex max-w-xl flex-col p-4">
            <h1 className="mb-4 font-heading text-2xl font-bold">
                {t("new-item")}
            </h1>
            <NewItemForm collections={collections ?? []} />
        </div>
    );
}
