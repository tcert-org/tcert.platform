import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type DiamondRowType = Database["public"]["Tables"]["users"]["Row"];

export type DiamondUserData = {
  id: number;
  company_name: string | null;
  logo_url: string | null;
  page_url: string | null;
  membership_id: number | null;
};

export default class DiamondUsers extends Table<"users"> {
  constructor() {
    super("users");
  }

  async getDiamondUsers(): Promise<DiamondUserData[]> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, company_name, logo_url, page_url, membership_id")
        .not("membership_id", "is", null)
        .order("membership_id", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching top membership users:", error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error in getDiamondUsers:", error);
      return [];
    }
  }

  async getDiamondUserById(id: number): Promise<DiamondUserData | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, company_name, logo_url, page_url, membership_id")
        .not("membership_id", "is", null)
        .eq("id", id)
        .single();

      if (error) {
        console.error(`Error fetching user by id ${id}:`, error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error(`Error in getDiamondUserById(${id}):`, error);
      return null;
    }
  }
}
