import { getTranslations } from "next-intl/server";
import NewCollectionForm from "./NewCollectionForm";

export default async function NewCollectionPage() {
    const t = await getTranslations("Collections");
    return (
        <div className="mx-auto flex max-w-md flex-col p-4">
            <h1 className="mb-4 font-heading text-2xl font-bold">
                {t("new-collection")}
            </h1>
            <NewCollectionForm />
        </div>
    );
}
