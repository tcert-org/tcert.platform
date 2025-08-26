import { supabase } from "@/lib/database/conection";

export async function getStatusIdBySlug(slug: string): Promise<number | null> {
  const { data, error } = await supabase
    .from("voucher_statuses")
    .select("id")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data?.id || null;
}
