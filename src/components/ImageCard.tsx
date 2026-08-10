import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface ImageCardProps {
    title: string;
    imageURL: string | null;
}

export default function ImageCard({ title, imageURL }: ImageCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="p-2">
                    {imageURL ?
                        <Image
                            src={imageURL}
                            alt={title}
                            width={400}
                            height={400}
                            unoptimized
                        />
                    :   <div className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                            No image available
                        </div>
                    }
                </div>
            </CardHeader>
            <CardContent>
                <CardTitle className="p-1 text-base font-bold">
                    {title}
                </CardTitle>
            </CardContent>
        </Card>
    );
}
