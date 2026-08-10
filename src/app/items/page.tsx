import { client, getObjectURL } from "../../utils/s3";
import ImageCard from "@/components/ImageCard";

async function listAllObjects() {
    return await client.list();
}

export default async function ItemsPage() {
    const items = await listAllObjects();
    const contents = items.contents ?? [];

    const files = await Promise.all(
        contents.map(async (e) => {
            const key = e.key?.toString() ?? "unknown";
            const imageURL = getObjectURL(key);
            return { key, imageURL };
        }),
    );

    return (
        <div className="grid grid-cols-3 gap-4">
            {files.map(({ key, imageURL }) => (
                <ImageCard key={key} title={key} imageURL={imageURL} />
            ))}
        </div>
    );
}
