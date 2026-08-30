import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface ImageCardProps {
    title: string;
    imageURL: string | null;
}

export default function ImageCard({ title, imageURL }: ImageCardProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <div className="p-2">
                    {imageURL ?
                        <div className="relative aspect-square w-full overflow-hidden rounded-md">
                            <Image
                                src={imageURL}
                                alt={title}
                                fill
                                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    :   <div className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                            No image available
                        </div>
                    }
                </div>
            </CardHeader>
            <CardContent>
                <CardTitle className="truncate p-1 text-base font-bold">
                    {title}
                </CardTitle>
            </CardContent>
        </Card>
    );
}
