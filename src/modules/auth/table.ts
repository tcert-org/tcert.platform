import Table from "@/lib/database/table";
import { Database } from "@/lib/database/database.types";

export type UserRowType = Database["public"]["Tables"]["users"]["Row"];
export type UserInsertType = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdateType = Database["public"]["Tables"]["users"]["Update"];

export default class UserTable extends Table<"users"> {
  constructor() {
    super("users");
  }
}
