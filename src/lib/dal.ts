import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/server";

export type ProducerSession = {
    userId: string;
    email: string | null;
};

export const verifyProducerSession = cache(
    async (): Promise<ProducerSession | null> => {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getClaims();
        if (error || !data?.claims) return null;

        return {
            userId: data.claims.sub,
            email: (data.claims.email as string | undefined) ?? null,
        };
    },
);
