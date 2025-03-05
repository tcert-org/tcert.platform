import Table from "@/lib/database/table";
import { Database } from "@/lib/database/database.types";
import { supabase } from "@/lib/database/conection";

export type RoleRowType = Database["public"]["Tables"]["roles"]["Row"];
export type RoleInsertType = Database["public"]["Tables"]["roles"]["Insert"];
export type RoleUpdateType = Database["public"]["Tables"]["roles"]["Update"];

export default class RoleTable extends Table<"roles"> {
  constructor() {
    super("roles");
  }

  async findByName(name: string): Promise<RoleRowType | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("name", name)
        .single();
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error(
        `Error in findByName(${name}) from ${this.tableName}:`,
        error
      );
      return null;
    }
  }
}
