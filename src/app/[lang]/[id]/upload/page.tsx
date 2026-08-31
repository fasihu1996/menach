import { notFound } from "next/navigation";
import { getById } from "@/utils/supabase";
import type { Item } from "@/lib/types";
import UploadForm from "./UploadForm";
import { getTranslations } from "next-intl/server";

export default async function UploadMediaPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const t = await getTranslations("UploadPage");
    const { id } = await params;
    const itemId = Number(id);

    const item = await getById<Item>("items", "id,title", itemId);
    if (!item) {
        notFound();
    }

    return (
        <div className="mx-auto flex max-w-xl flex-col p-4">
            <h1 className="mb-4 font-heading text-2xl font-bold">
                {t("upload-media")} &ldquo;{item.title}&rdquo;
            </h1>
            <UploadForm itemId={item.id} />
        </div>
    );
}
