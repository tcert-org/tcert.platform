import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

type Tables = Database["public"]["Tables"];

export default class Table<T extends keyof Tables> {
  public readonly tableName: T;
  public readonly columns: Record<keyof Tables[T]["Row"], string>;

  constructor(tableName: T) {
    this.tableName = tableName;
    this.columns = Object.keys({} as Tables[T]["Row"]).reduce((acc, key) => {
      acc[key as keyof Tables[T]["Row"]] = key;
      return acc;
    }, {} as Record<keyof Tables[T]["Row"], string>);
  }

  async getAll(): Promise<Tables[T]["Row"][]> {
    try {
      const { data, error } = await supabase.from(this.tableName).select("*");
      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      console.error(`Error in getAll() de ${this.tableName}:`, error);
      return [];
    }
  }

  async getById(id: number): Promise<Tables[T]["Row"] | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error(`Error in getById(${id}) from ${this.tableName}:`, error);
      return null;
    }
  }

  async insert(data: Tables[T]["Insert"]): Promise<Tables[T]["Row"] | null> {
    try {
      const { data: insertedData, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return insertedData;
    } catch (error) {
      console.error(`Error in insert() from ${this.tableName}:`, error);
      return null;
    }
  }

  async update(
    id: number,
    data: Tables[T]["Update"]
  ): Promise<Tables[T]["Row"] | null> {
    try {
      const { data: updatedData, error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updatedData;
    } catch (error) {
      console.error(`Error in update(${id}) from ${this.tableName}:`, error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
      return true;
    } catch (error) {
      console.error(`Error in delete(${id}) from ${this.tableName}:`, error);
      return false;
    }
  }

  async findByEmail(email: string): Promise<Tables[T]["Row"] | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("email", email)
        .single();
      if (error) throw new Error(error.message);
      if (!data) return null;
      return data;
    } catch (error) {
      console.error(
        `Error in findByEmail(${email}) from ${this.tableName}:`,
        error
      );
      return null;
    }
  }
}
