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
    external_id: string;
};

export type Collection = {
    id: number;
    title: string;
    institution: string;
    city: string;
    country: string;
    created_at: string;
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
    created_at: string;
};
