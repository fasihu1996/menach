import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MediaViewer from "@/components/MediaViewer";
import ArchiveSection from "@/components/ArchiveSection";
import { getEntries, getById } from "@/utils/supabase";
import { getObjectURL } from "@/utils/s3";
import {
    getCurrentTransferForItem,
    getTransferEvents,
} from "@/utils/archive/transfer";
import type { Item, Collection, Asset, Media } from "@/lib/types";

export default async function ItemDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const itemId = Number(id);

    const item = await getById<Item>(
        "items",
        "id,title,description,date,created_at,collection",
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

    const assets = (await getEntries("assets", "item,media", {
        item: item.id,
    })) as Asset[] | null;
    const mediaIds = [...new Set((assets ?? []).map((asset) => asset.media))];
    const attachedMedia =
        ((await getEntries(
            "media",
            "id,storage_key,title,description,date,media_type,created_at",
            { id: mediaIds },
        )) as Media[] | null) ?? [];

    const activeTransfer = await getCurrentTransferForItem(item.id);
    const transferEvents =
        activeTransfer ? await getTransferEvents(activeTransfer.id) : [];

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold">
                        {item.title}
                    </h1>
                    {item.description ?
                        <p className="mt-1 text-sm text-muted-foreground">
                            {item.description}
                        </p>
                    :   null}
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                        {item.date ?
                            <span>{item.date}</span>
                        :   null}
                        {collection ?
                            <span>{collection.title}</span>
                        :   null}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        nativeButton={false}
                        render={<Link href={`/${item.id}/upload`}>Upload</Link>}
                    />
                </div>
            </div>

            <ArchiveSection
                key={activeTransfer?.id ?? "none"}
                itemId={item.id}
                hasMedia={attachedMedia.length > 0}
                initialTransfer={activeTransfer}
                initialEvents={transferEvents}
            />

            <MediaViewer
                media={attachedMedia.map((entry) => ({
                    ...entry,
                    url:
                        entry.storage_key ?
                            getObjectURL(entry.storage_key)
                        :   null,
                }))}
            />
        </div>
    );
}
