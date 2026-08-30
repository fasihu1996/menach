import NewCollectionForm from "./NewCollectionForm";

export default async function NewCollectionPage() {
    return (
        <div className="mx-auto flex max-w-md flex-col p-4">
            <h1 className="mb-4 font-heading text-2xl font-bold">
                New collection
            </h1>
            <NewCollectionForm />
        </div>
    );
}
