import { notFound, redirect } from "next/navigation";
import { getById } from "@/utils/supabase";
import type { Item } from "@/lib/types";
import UploadForm from "./UploadForm";
import { getTranslations, getLocale } from "next-intl/server";
import { verifyProducerSession } from "@/lib/dal";

export default async function UploadMediaPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const session = await verifyProducerSession();
    if (!session) {
        const locale = await getLocale();
        redirect(`/${locale}/auth/login?next=/${locale}/${id}/upload`);
    }

    const t = await getTranslations("UploadPage");
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
