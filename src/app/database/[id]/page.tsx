import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MediaCard from "@/components/MediaCard";
import { getAllEntries, getById } from "@/utils/supabase";
import { getObjectURL } from "@/utils/s3";
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
            await getById<Collection>("collections", "id,title", item.collection)
        :   null;

    const assets = (await getAllEntries("assets", "item,media")) as
        | Asset[]
        | null;
    const media = (await getAllEntries(
        "media",
        "id,storage_key,title,description,date,media_type,created_at",
    )) as Media[] | null;

    const mediaIds = new Set(
        (assets ?? [])
            .filter((asset) => asset.item === item.id)
            .map((asset) => asset.media),
    );
    const attachedMedia = (media ?? []).filter((entry) =>
        mediaIds.has(entry.id),
    );

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
                        {item.date ? <span>{item.date}</span> : null}
                        {collection ? <span>{collection.title}</span> : null}
                    </div>
                </div>
                <Button
                    nativeButton={false}
                    render={
                        <Link href={`/database/${item.id}/upload`}>
                            Upload
                        </Link>
                    }
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {attachedMedia.map((entry) => (
                    <MediaCard
                        key={entry.id}
                        media={entry}
                        imageURL={
                            entry.storage_key ?
                                getObjectURL(entry.storage_key)
                            :   null
                        }
                    />
                ))}
                {attachedMedia.length === 0 ?
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                        No media attached yet.
                    </div>
                :   null}
            </div>
        </div>
    );
}
