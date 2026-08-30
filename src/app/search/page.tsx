import Fuse from "fuse.js";
import Link from "next/link";
import ImageCard from "@/components/ImageCard";
import CollectionCard from "@/components/CollectionCard";
import { getEntries } from "@/utils/supabase";
import { getObjectURL } from "@/utils/s3";
import type { Item, Collection, Asset, Media } from "@/lib/types";

type ItemDoc = Pick<Item, "id" | "title" | "description" | "external_id"> & {
    kind: "item";
};
type CollectionDoc = Pick<
    Collection,
    "id" | "title" | "institution" | "city" | "country"
> & { kind: "collection" };

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const query = (q ?? "").trim();

    const items = (await getEntries(
        "items",
        "id,title,description,external_id",
    )) as Item[] | null;
    const collections = (await getEntries(
        "collections",
        "id,title,institution,city,country",
    )) as Collection[] | null;

    const docs: (ItemDoc | CollectionDoc)[] = [
        ...(items ?? []).map((item) => ({ ...item, kind: "item" as const })),
        ...(collections ?? []).map((collection) => ({
            ...collection,
            kind: "collection" as const,
        })),
    ];

    const fuse = new Fuse(docs, {
        keys: ["title", "description", "institution", "city", "country"],
        threshold: 0.4,
        ignoreLocation: true,
    });

    const results = query ? fuse.search(query).map((r) => r.item) : docs;
    const itemResults = results.filter(
        (doc): doc is ItemDoc => doc.kind === "item",
    );
    const collectionResults = results.filter(
        (doc): doc is CollectionDoc => doc.kind === "collection",
    );

    const itemIds = itemResults.map((item) => item.id);
    const assets = (await getEntries("assets", "item,media", {
        item: itemIds,
    })) as Asset[] | null;
    const mediaIds = [...new Set((assets ?? []).map((asset) => asset.media))];
    const media = (await getEntries("media", "id,storage_key", {
        id: mediaIds,
    })) as Media[] | null;

    const resolvedItems = itemResults.map((item) => {
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

    const collectionIds = collectionResults.map((collection) => collection.id);
    const collectionItems = (await getEntries("items", "id,collection", {
        collection: collectionIds,
    })) as Item[] | null;

    const resolvedCollections = collectionResults.map((collection) => ({
        id: collection.id,
        title: collection.title,
        institution: collection.institution,
        city: collection.city,
        country: collection.country,
        itemCount: (collectionItems ?? []).filter(
            (item) => item.collection === collection.id,
        ).length,
    }));

    return (
        <div className="flex flex-col gap-8 p-4">
            <h1 className="font-heading text-2xl font-bold">
                {query ? `Search results for "${query}"` : "All items and collections"}
            </h1>

            <section className="flex flex-col gap-4">
                <h2 className="font-heading text-lg font-semibold">Items</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {resolvedItems.map(({ id, title, imageURL }) => (
                        <Link key={id} href={`/${id}`} className="h-full">
                            <ImageCard title={title} imageURL={imageURL} />
                        </Link>
                    ))}
                    {resolvedItems.length === 0 ?
                        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                            No matching items.
                        </div>
                    :   null}
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="font-heading text-lg font-semibold">
                    Collections
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {resolvedCollections.map(
                        ({ id, title, institution, city, country, itemCount }) => (
                            <Link
                                key={id}
                                href={`/collections/${id}`}
                                className="h-full"
                            >
                                <CollectionCard
                                    title={title}
                                    institution={institution}
                                    city={city}
                                    country={country}
                                    itemCount={itemCount}
                                />
                            </Link>
                        ),
                    )}
                    {resolvedCollections.length === 0 ?
                        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                            No matching collections.
                        </div>
                    :   null}
                </div>
            </section>
        </div>
    );
}
