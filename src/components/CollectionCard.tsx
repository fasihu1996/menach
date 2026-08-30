import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from "@/components/ui/card";

interface CollectionCardProps {
    title: string;
    institution: string;
    city: string;
    country: string;
    itemCount: number;
}

export default function CollectionCard({
    title,
    institution,
    city,
    country,
    itemCount,
}: CollectionCardProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="truncate p-1 text-base font-bold">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
                <CardDescription className="truncate p-1">
                    {institution}
                </CardDescription>
                <CardDescription className="truncate p-1">
                    {city}, {country}
                </CardDescription>
                <CardDescription className="p-1">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                </CardDescription>
            </CardContent>
        </Card>
    );
}
