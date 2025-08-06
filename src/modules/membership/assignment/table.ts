import { supabase } from "@/lib/database/conection";

export class MembershipAssignmentTable {
  async getPartners(): Promise<any[]> {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("role_id", 5);

    if (error) throw new Error("Error fetching partners: " + error.message);
    return data ?? [];
  }

  async getMemberships(): Promise<any[]> {
    const { data, error } = await supabase
      .from("membership")
      .select("*")
      .order("count_from", { ascending: true });

    if (error) throw new Error("Error fetching memberships: " + error.message);
    return data ?? [];
  }

  async updateUserMembership(userId: number, membershipId: number): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({ membership_id: membershipId })
      .eq("id", userId);

    if (error) throw new Error(`Error updating user ${userId}: ${error.message}`);
  }
}
