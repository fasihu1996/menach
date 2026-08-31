import { notFound } from "next/navigation";
import Link from "next/link";
import ImageCard from "@/components/ImageCard";
import { getEntries, getById } from "@/utils/supabase";
import { getObjectURL } from "@/utils/s3";
import type { Collection, Item, Asset, Media } from "@/lib/types";

export default async function CollectionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const collectionId = Number(id);

    const collection = await getById<Collection>(
        "collections",
        "id,title,institution,city,country",
        collectionId,
    );

    if (!collection) {
        notFound();
    }

    const items = (await getEntries("items", "id,title", {
        collection: collection.id,
    })) as Item[] | null;
    const itemIds = (items ?? []).map((item) => item.id);
    const assets = (await getEntries("assets", "item,media", {
        item: itemIds,
    })) as Asset[] | null;
    const mediaIds = [...new Set((assets ?? []).map((asset) => asset.media))];
    const media = (await getEntries("media", "id,storage_key", {
        id: mediaIds,
    })) as Media[] | null;

    const resolvedItems = (items ?? []).map((item) => {
        const asset = (assets ?? []).find((entry) => entry.item === item.id);
        const mediaEntry = (media ?? []).find(
            (entry) => entry.id === asset?.media,
        );

        return {
            id: item.id,
            title: item.title,
            imageURL:
                mediaEntry?.storage_key ?
                    getObjectURL(mediaEntry.storage_key)
                :   null,
        };
    });

    return (
        <div className="flex flex-col gap-6 p-4">
            <div>
                <h1 className="font-heading text-2xl font-bold">
                    {collection.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {collection.institution}
                </p>
                <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                    <span>
                        {collection.city}, {collection.country}
                    </span>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resolvedItems.map(({ id, title, imageURL }) => (
                    <Link key={id} href={`/${id}`} className="h-full">
                        <ImageCard title={title} imageURL={imageURL} />
                    </Link>
                ))}
                {resolvedItems.length === 0 ?
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                        No items in this collection yet.
                    </div>
                :   null}
            </div>
        </div>
    );
}
