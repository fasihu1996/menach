import { notFound } from "next/navigation";
import Link from "next/link";
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import MediaViewer from "@/components/MediaViewer";
import ArchiveSection from "@/components/ArchiveSection";
import { getEntries, getById } from "@/utils/supabase";
import { getObjectURL } from "@/utils/s3";
import { getCurrentTransferForItem } from "@/utils/archive/transfer";
import type { Item, Collection, Asset, Media } from "@/lib/types";
import { getTranslations } from "next-intl/server";
import ItemMap from "@/components/ItemMap";
import { Suspense } from "react";

export default async function ItemDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const t = await getTranslations("Detailpage");
    const { id } = await params;
    const itemId = Number(id);

    const item = await getById<Item>(
        "items",
        "id,title,description,date,created_at,collection,latitude,longitude",
        itemId,
    );

    if (!item) {
        notFound();
    }

    const collection =
        item.collection != null ?
            await getById<Collection>(
                "collections",
                "id,title",
                item.collection,
            )
        :   null;

    const assets =
        ((await getEntries("assets", "item,media,created_at", {
            item: item.id,
        })) as Asset[] | null) ?? [];
    const mediaIds = [...new Set(assets.map((asset) => asset.media))];
    const attachedMedia =
        ((await getEntries(
            "media",
            "id,storage_key,title,description,date,media_type,created_at",
            { id: mediaIds },
        )) as Media[] | null) ?? [];

    const activeTransfer = await getCurrentTransferForItem(item.id);
    const outdatedArchive =
        activeTransfer?.status === "complete" &&
        assets.some(
            (asset) =>
                new Date(asset.created_at) >
                new Date(activeTransfer.updated_at),
        );

    return (
        <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-4">
                <h1 className="font-heading min-w-0 flex-1 truncate text-2xl font-bold">
                    {item.title}
                </h1>
                <div className="flex shrink-0 items-center gap-2">
                    <ArchiveSection
                        key={activeTransfer?.id ?? "none"}
                        itemId={item.id}
                        itemTitle={item.title}
                        hasMedia={attachedMedia.length > 0}
                        outdatedArchive={outdatedArchive}
                        initialTransfer={activeTransfer}
                    />
                    <Button
                        nativeButton={false}
                        render={
                            <Link href={`/${item.id}/upload`}>
                                <UploadIcon data-icon="inline-start" />
                                <span className="sr-only sm:not-sr-only">
                                    {t("upload")}
                                </span>
                            </Link>
                        }
                    />
                </div>
            </div>
            <Separator />
            {item.description ?
                <>
                    <p className="text-sm text-foreground py-2">
                        {item.description}
                    </p>
                    <Separator />
                </>
            :   null}
            <div className="flex flex-col gap-2 text-sm text-foreground">
                {item.date ?
                    <span>{t("date") + item.date}</span>
                :   null}
                {collection ?
                    <span>{t("collection") + collection.title}</span>
                :   null}
                {item.latitude != null && item.longitude != null ?
                    <span>
                        {t("location")} {Math.abs(item.latitude).toFixed(5)}°{" "}
                        {item.latitude >= 0 ? "N" : "S"},{" "}
                        {Math.abs(item.longitude).toFixed(5)}°{" "}
                        {item.longitude >= 0 ? "E" : "W"}
                    </span>
                :   null}
            </div>
            <MediaViewer
                media={attachedMedia.map((entry) => ({
                    ...entry,
                    url:
                        entry.storage_key ?
                            getObjectURL(entry.storage_key)
                        :   null,
                }))}
            />
            {item.latitude != null && item.longitude != null ?
                <Suspense>
                    <Separator />
                    <ItemMap
                        title={item.title}
                        latitude={item.latitude}
                        longitude={item.longitude}
                    />
                </Suspense>
            :   null}
        </div>
    );
}
