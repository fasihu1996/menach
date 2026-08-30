import { createClient } from "@/lib/server";
import { createServiceClient } from "@/lib/service";
import { PostgrestError } from "@supabase/supabase-js";

export async function getEntries(
    table: string,
    key: string,
    filters?: Record<
        string,
        string | number | boolean | Array<string | number>
    >,
) {
    const entries = Object.entries(filters ?? {});
    const hasEmptyInFilter = entries.some(
        ([, value]) => Array.isArray(value) && value.length === 0,
    );
    if (hasEmptyInFilter) {
        return [];
    }

    const supabase = await createClient();
    let query = supabase.from(table).select(key);
    for (const [column, value] of entries) {
        query =
            Array.isArray(value) ?
                query.in(column, value)
            :   query.eq(column, value);
    }
    const { data } = await query;
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
    const { data, error } = await supabase
        .from(table)
        .insert(values)
        .select()
        .single();
    if (error) throw new PostgrestError(error);
    return data as T;
}
