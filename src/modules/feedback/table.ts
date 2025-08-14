import Table from "@/lib/database/table";
import { supabase } from "@/lib/database/conection";
import { Database } from "@/lib/database/database.types";

export type FeedbackRowType = Database["public"]["Tables"]["feedback"]["Row"];

export type FeedbackData = {
  id: number;
  certification_id: number;
  name: string;
  comment: string;
  rating: number;
  profession: string;
};

export default class FeedbackTable extends Table<"feedback"> {
  constructor() {
    super("feedback");
  }

  async getAllFeedback(): Promise<FeedbackData[]> {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("id, certification_id, name, comment, rating, profession")
        .order("rating", { ascending: false })
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching feedback:", error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAllFeedback:", error);
      return [];
    }
  }

  async getFeedbackByCertification(
    certificationId: number
  ): Promise<FeedbackData[]> {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("id, certification_id, name, comment, rating, profession")
        .eq("certification_id", certificationId)
        .order("rating", { ascending: false })
        .order("id", { ascending: false });

      if (error) {
        console.error(
          `Error fetching feedback for certification ${certificationId}:`,
          error
        );
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error(
        `Error in getFeedbackByCertification(${certificationId}):`,
        error
      );
      return [];
    }
  }

  async getFeedbackById(id: number): Promise<FeedbackData | null> {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("id, certification_id, name, comment, rating, profession")
        .eq("id", id)
        .single();

      if (error) {
        console.error(`Error fetching feedback by id ${id}:`, error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error(`Error in getFeedbackById(${id}):`, error);
      return null;
    }
  }

  async getAverageRatingByCertification(
    certificationId: number
  ): Promise<number> {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("rating")
        .eq("certification_id", certificationId);

      if (error) {
        console.error(
          `Error fetching ratings for certification ${certificationId}:`,
          error
        );
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      const totalRating = data.reduce(
        (sum, feedback) => sum + (feedback.rating || 0),
        0
      );
      return Math.round((totalRating / data.length) * 10) / 10; // Redondear a 1 decimal
    } catch (error) {
      console.error(
        `Error in getAverageRatingByCertification(${certificationId}):`,
        error
      );
      return 0;
    }
  }
}
