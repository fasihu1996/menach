import ImageCard from "@/components/ImageCard";
import { Button } from "@/components/ui/button";
import { getAllEntries } from "@/utils/supabase";
import { getObjectURL } from "@/utils/s3";
import type { Item, Asset, Media } from "@/lib/types";
import Link from "next/link";

export default async function DatabasePage() {
    const items = (await getAllEntries("items", "id,title")) as
        | Item[]
        | null;
    const assets = (await getAllEntries("assets", "item,media")) as
        | Asset[]
        | null;
    const media = (await getAllEntries("media", "id,storage_key")) as
        | Media[]
        | null;

    const resolvedEntries = (items ?? []).map((item) => {
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
        <div className="p-4">
            <div className="mb-4 flex justify-end">
                <Button
                    nativeButton={false}
                    render={<Link href="/database/new">New item</Link>}
                />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resolvedEntries.map(({ id, title, imageURL }) => (
                    <Link key={id} href={`/database/${id}`}>
                        <ImageCard title={title} imageURL={imageURL} />
                    </Link>
                ))}
                {resolvedEntries.length === 0 ?
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                        No items found.
                    </div>
                :   null}
            </div>
        </div>
    );
}
