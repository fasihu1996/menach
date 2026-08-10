export type MediaType =
    | "StillImage"
    | "MovingImage"
    | "Text"
    | "Sound"
    | "Interactive";

export type Item = {
    id: number;
    title: string;
    description: string;
    date: string | null;
    created_at: string;
    collection: number | null;
};

export type Collection = {
    id: number;
    title: string;
};

export type Media = {
    id: number;
    storage_key: string;
    title: string;
    description: string | null;
    date: string | null;
    media_type: MediaType;
    created_at: string;
};

export type Asset = {
    item: number;
    media: number;
};
