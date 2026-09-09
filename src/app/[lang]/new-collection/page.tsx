import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import NewCollectionForm from "./NewCollectionForm";
import { verifyProducerSession } from "@/lib/dal";

export default async function NewCollectionPage() {
    const session = await verifyProducerSession();
    if (!session) {
        const locale = await getLocale();
        redirect(`/${locale}/auth/login?next=/${locale}/new-collection`);
    }

    const t = await getTranslations("Collections");
    return (
        <div className="mx-auto flex max-w-xl flex-col p-4">
            <h1 className="mb-4 font-heading text-2xl font-bold">
                {t("new-collection")}
            </h1>
            <NewCollectionForm />
        </div>
    );
}
