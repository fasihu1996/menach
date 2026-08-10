import { S3Client } from "bun";
import "dotenv/config";

export const client = new S3Client({
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    bucket: process.env.S3_BUCKET,
    endpoint: process.env.S3_ENDPOINT,
    region: "garage",
});

export const getFile = (key: string) => {
    const file = client.file(key);
    return file;
};

export const getObjectURL = (key: string) => {
    const objectURL = client.presign(key, {
        method: "GET",
        expiresIn: 3600,
    });
    return objectURL;
};

export const putFile = (key: string, file: File) => {
    return client.write(key, file, { type: file.type });
};
