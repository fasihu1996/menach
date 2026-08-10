import { createClient } from "@/lib/server";
import { createServiceClient } from "@/lib/service";

export async function getAllEntries(table: string, key: string) {
    const supabase = await createClient();
    const { data } = await supabase.from(table).select(key);
    return data;
}

export async function getEntry(table: string, key: string) {
    const supabase = await createClient();
    const { data } = await supabase.from(table).select(key);
    supabase.from(table).select();
    return data;
}

export async function getById<T>(
    table: string,
    key: string,
    id: number,
): Promise<T | null> {
    const supabase = await createClient();
    const { data } = await supabase
        .from(table)
        .select(key)
        .eq("id", id)
        .maybeSingle();
    return data as T | null;
}

export async function insertRow<T>(
    table: string,
    values: Record<string, unknown>,
): Promise<T> {
    const supabase = createServiceClient();
    const { data } = await supabase
        .from(table)
        .insert(values)
        .select()
        .single();
    return data as T;
}
