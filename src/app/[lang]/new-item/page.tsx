import { getEntries } from "@/utils/supabase";
import type { Collection } from "@/lib/types";
import NewItemForm from "./NewItemForm";

export default async function NewItemPage() {
    const collections = (await getEntries("collections", "id,title")) as
        | Collection[]
        | null;

    return (
        <div className="mx-auto flex max-w-md flex-col p-4">
            <h1 className="mb-4 font-heading text-2xl font-bold">New item</h1>
            <NewItemForm collections={collections ?? []} />
        </div>
    );
}
