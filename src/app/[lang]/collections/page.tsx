import CollectionCard from "@/components/CollectionCard";
import { Button } from "@/components/ui/button";
import { getEntries } from "@/utils/supabase";
import type { Collection, Item } from "@/lib/types";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function CollectionsPage() {
    const t = await getTranslations("Collections");
    const collections = (await getEntries(
        "collections",
        "id,title,institution,city,country",
    )) as Collection[] | null;
    const items = (await getEntries("items", "id,collection")) as Item[] | null;

    const resolvedEntries = (collections ?? []).map((collection) => ({
        id: collection.id,
        title: collection.title,
        institution: collection.institution,
        city: collection.city,
        country: collection.country,
        itemCount: (items ?? []).filter(
            (item) => item.collection === collection.id,
        ).length,
    }));

    return (
        <div className="p-4">
            <div className="mb-4 flex justify-end">
                <Button
                    nativeButton={false}
                    render={
                        <Link href="/new-collection">
                            {t("new-collection")}
                        </Link>
                    }
                />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resolvedEntries.map(
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
                {resolvedEntries.length === 0 ?
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                        {t("no-found")}
                    </div>
                :   null}
            </div>
        </div>
    );
}
