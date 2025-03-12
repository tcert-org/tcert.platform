import Table from "@/lib/database/table";
import { Database } from "@/lib/database/database.types";
import { supabase } from "@/lib/database/conection";

export type UserRowType = Database["public"]["Tables"]["users"]["Row"];
export type UserInsertType = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdateType = Database["public"]["Tables"]["users"]["Update"];
const tableName = "users";

export default class UserTable extends Table<typeof tableName> {
  constructor() {
    super(tableName);
  }

  async getByUuid(
    uuid: string
  ): Promise<(UserRowType & { roles?: { name: string } | null }) | null> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*, roles(name)")
        .eq("user_uuid", uuid)
        .single();

      if (error) throw new Error(error.message);
      console.log("data consulta db resultado: ", data);
      return data;
    } catch (error) {
      console.error(`Error in getByUuid(${uuid}) from ${tableName}:`, error);
      return null;
    }
  }
}
