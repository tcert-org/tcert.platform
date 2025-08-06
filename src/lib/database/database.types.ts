export type Database = {
  public: {
    Tables: {
      answers: {
        Row: {
          created_at: string | null;
          exam_attempt_id: number | null;
          id: number;
          question_id: number | null;
          selected_option_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          exam_attempt_id?: number | null;
          id?: never;
          question_id?: number | null;
          selected_option_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          exam_attempt_id?: number | null;
          id?: never;
          question_id?: number | null;
          selected_option_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "answers_exam_attempt_id_fkey";
            columns: ["exam_attempt_id"];
            isOneToOne: false;
            referencedRelation: "exam_attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answers_selected_option_id_fkey";
            columns: ["selected_option_id"];
            isOneToOne: false;
            referencedRelation: "options";
            referencedColumns: ["id"];
          }
        ];
      };
      certifications: {
        Row: {
          created_at: string | null;
          description: string | null;
          duration: number | null;
          expiration_period_months: number | null;
          id: number;
          name: string;
          price: number;
          study_material_url: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          duration?: number | null;
          expiration_period_months?: number | null;
          id?: never;
          name: string;
          price: number;
          study_material_url?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          duration?: number | null;
          expiration_period_months?: number | null;
          id?: never;
          name?: string;
          price?: number;
          study_material_url?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      diplomas: {
        Row: {
          certification_id: number | null;
          completion_date: string;
          created_at: string | null;
          diploma_url: string | null;
          exam_attempt_id: number | null;
          expiration_date: string | null;
          id: number;
          student_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          certification_id?: number | null;
          completion_date: string;
          created_at?: string | null;
          diploma_url?: string | null;
          exam_attempt_id?: number | null;
          expiration_date?: string | null;
          id?: never;
          student_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          certification_id?: number | null;
          completion_date?: string;
          created_at?: string | null;
          diploma_url?: string | null;
          exam_attempt_id?: number | null;
          expiration_date?: string | null;
          id?: never;
          student_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "diplomas_certification_id_fkey";
            columns: ["certification_id"];
            isOneToOne: false;
            referencedRelation: "certifications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diplomas_exam_attempt_id_fkey";
            columns: ["exam_attempt_id"];
            isOneToOne: false;
            referencedRelation: "exam_attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diplomas_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "partner_voucher_counts";
            referencedColumns: ["partner_id"];
          },
          {
            foreignKeyName: "diplomas_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      exam_attempts: {
        Row: {
          attempt_date: string;
          created_at: string | null;
          exam_id: number | null;
          id: number;
          passed: boolean | null;
          score: number | null;
          student_id: number | null;
          updated_at: string | null;
          voucher_id: number | null;
        };
        Insert: {
          attempt_date?: string;
          created_at?: string | null;
          exam_id?: number | null;
          id?: never;
          passed?: boolean | null;
          score?: number | null;
          student_id?: number | null;
          updated_at?: string | null;
          voucher_id?: number | null;
        };
        Update: {
          attempt_date?: string;
          created_at?: string | null;
          exam_id?: number | null;
          id?: never;
          passed?: boolean | null;
          score?: number | null;
          student_id?: number | null;
          updated_at?: string | null;
          voucher_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey";
            columns: ["exam_id"];
            isOneToOne: false;
            referencedRelation: "exams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exam_attempts_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "partner_voucher_counts";
            referencedColumns: ["partner_id"];
          },
          {
            foreignKeyName: "exam_attempts_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exam_attempts_voucher_id_fkey";
            columns: ["voucher_id"];
            isOneToOne: false;
            referencedRelation: "vouchers";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          id: number;
          partner_id: string;
          admin_id: string | null;
          voucher_quantity: number;
          unit_price: number;
          total_price: number | null;
          file_url: string | null;
          created_at: string;
          expiration_date: string;
        };
        Insert: {
          partner_id: string;
          admin_id?: string | null;
          voucher_quantity: number;
          unit_price: number;
          total_price?: number | null;
          file_url?: string | null;
          created_at?: string;
          expiration_date?: string;
        };
        Update: {
          partner_id?: string;
          admin_id?: string | null;
          voucher_quantity?: number;
          unit_price?: number;
          total_price?: number | null;
          file_url?: string | null;
          created_at?: string;
          expiration_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_partner_id_fkey";
            columns: ["partner_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_admin_id_fkey";
            columns: ["admin_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      exams: {
        Row: {
          certification_id: number;
          simulator: boolean;
          time_limit: number | null;
          attempts: number;
          name_exam: string;
          active: boolean;
          created_at: string | null;
          id: number;
          updated_at: string | null;
        };
        Insert: {
          certification_id?: number | null;
          simulator: boolean;
          time_limit?: number | null;
          attempts?: number;
          name_exam: string;
          active: boolean;
          created_at?: string | null;
          id?: never;
          updated_at?: string | null;
        };
        Update: {
          certification_id?: number | null;
          simulator: boolean;
          time_limit?: number | null;
          attempts?: number;
          name_exam: string;
          active: boolean;
          created_at?: string | null;
          id?: never;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "exams_certification_id_fkey";
            columns: ["certification_id"];
            isOneToOne: false;
            referencedRelation: "certifications";
            referencedColumns: ["id"];
          }
        ];
      };
      membership: {
        Row: {
          name: string;
          count_from: number;
          count_up: number;
          price: number;
          id: number;
          created_at?: string | null;
        };
        Insert: {
          name: string;
          count_from: number;
          count_up: number;
          price: number;
          id: number;
          created_at?: string | null;
        };
        Update: {
          name: string;
          count_from: number;
          count_up: number;
          price: number;
          id: number;
          created_at?: string | null;
        };
      };
      params: {
        Row: {
          name: string;
          value: number;
          created_at?: string | null;
        };
        Insert: {
          name: string;
          value: number;
          created_at?: string | null;
        };
        Update: {
          name: string;
          value: number;
          created_at?: string | null;
        };
      };
      feedback: {
        Row: {
          correct_count: number;
          created_at: string | null;
          exam_attempt_id: number | null;
          id: number;
          incorrect_count: number;
          unanswered_count: number;
          updated_at: string | null;
        };
        Insert: {
          correct_count: number;
          created_at?: string | null;
          exam_attempt_id?: number | null;
          id?: never;
          incorrect_count: number;
          unanswered_count: number;
          updated_at?: string | null;
        };
        Update: {
          correct_count?: number;
          created_at?: string | null;
          exam_attempt_id?: number | null;
          id?: never;
          incorrect_count?: number;
          unanswered_count?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_exam_attempt_id_fkey";
            columns: ["exam_attempt_id"];
            isOneToOne: false;
            referencedRelation: "exam_attempts";
            referencedColumns: ["id"];
          }
        ];
      };
      options: {
        Row: {
          content: string;
          created_at: string | null;
          id: number;
          is_correct: boolean;
          question_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: never;
          is_correct: boolean;
          question_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: never;
          is_correct?: boolean;
          question_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "options_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          }
        ];
      };
      questions: {
        Row: {
          id: number;
          exam_id: number | null;
          content: string;
          type_question: number;
          active: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          exam_id: number | null;
          content: string;
          type_question: number;
          active: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Update: {
          id: number;
          exam_id: number | null;
          content: string;
          type_question: number;
          active: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey";
            columns: ["exam_id"];
            isOneToOne: false;
            referencedRelation: "exams";
            referencedColumns: ["id"];
          }
        ];
      };
      roles: {
        Row: {
          created_at: string | null;
          id: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: never;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: never;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          created_at: string | null;
          id: number;
          updated_at: string | null;
          voucher_code: string | null;
          voucher_id: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: never;
          updated_at?: string | null;
          voucher_code?: string | null;
          voucher_id?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: never;
          updated_at?: string | null;
          voucher_code?: string | null;
          voucher_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_voucher_id_fkey";
            columns: ["voucher_id"];
            isOneToOne: false;
            referencedRelation: "vouchers";
            referencedColumns: ["id"];
          }
        ];
      };
      students: {
        Row: {
          created_at: string | null;
          document_number: string | null;
          document_type: string | null;
          email: string | null;
          fullname: string | null;
          id: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          document_number?: string | null;
          document_type?: string | null;
          email?: string | null;
          fullname?: string | null;
          id?: never;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          document_number?: string | null;
          document_type?: string | null;
          email?: string | null;
          fullname?: string | null;
          id?: never;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          company_address: string | null;
          company_name: string | null;
          contact_number: string | null;
          created_at: string | null;
          email: string;
          first_name: string | null;
          last_name: string | null;
          id: number;
          role_id: number;
          updated_at: string | null;
          user_uuid: string | null;
          membership_id: number;
        };
        Insert: {
          company_address?: string | null;
          company_name?: string | null;
          contact_number?: string | null;
          created_at?: string | null;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          id?: never;
          role_id: number;
          updated_at?: string | null;
          user_uuid?: string | null;
        };
        Update: {
          company_address?: string | null;
          company_name?: string | null;
          contact_number?: string | null;
          created_at?: string | null;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          id?: never;
          role_id?: number;
          updated_at?: string | null;
          user_uuid?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          }
        ];
      };

      voucher_statuses: {
        Row: {
          created_at: string | null;
          id: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: never;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: never;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      vouchers: {
        Row: {
          available: boolean | null;
          certification_id: number | null;
          code: string;
          created_at: string | null;
          email: string | null;
          expiration_date: string | null;
          id: number;
          partner_id: number | null;
          purchase_date: string;
          status_id: number | null;
          updated_at: string | null;
          voucher_code: string | null;
        };
        Insert: {
          available?: boolean | null;
          certification_id?: number | null;
          code?: string;
          created_at?: string | null;
          email?: string | null;
          expiration_date?: string | null;
          id?: never;
          partner_id?: number | null;
          purchase_date?: string;
          status_id?: number | null;
          student_id?: number | null;
          updated_at?: string | null;
          voucher_code?: string | null;
        };
        Update: {
          available?: boolean | null;
          certification_id?: number | null;
          code?: string;
          created_at?: string | null;
          email?: string | null;
          expiration_date?: string | null;
          id?: never;
          partner_id?: number | null;
          purchase_date?: string;
          status_id?: number | null;
          student_id?: number | null;
          updated_at?: string | null;
          voucher_code?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "vouchers_certification_id_fkey";
            columns: ["certification_id"];
            isOneToOne: false;
            referencedRelation: "certifications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vouchers_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partner_voucher_counts";
            referencedColumns: ["partner_id"];
          },
          {
            foreignKeyName: "vouchers_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vouchers_status_id_fkey";
            columns: ["status_id"];
            isOneToOne: false;
            referencedRelation: "voucher_statuses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vouchers_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vouchers_voucher_code_fkey";
            columns: ["voucher_code"];
            isOneToOne: true;
            referencedRelation: "vouchers";
            referencedColumns: ["code"];
          }
        ];
      };
    };
    Views: {
      partner_voucher_counts: {
        Row: {
          partner_id: number | null;
          total_vouchers: number | null;
          unused_vouchers: number | null;
          used_vouchers: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_partners_with_filters: {
        Args: {
          filter_company_name?: string;
          filter_email?: string;
          filter_created_at?: string;
          filter_total_vouchers_op?: string;
          filter_total_vouchers?: number;
          filter_used_vouchers_op?: string;
          filter_used_vouchers?: number;
          order_by?: string;
          order_dir?: string;
          page?: number;
        };
        Returns: JSON;
      };
      get_vouchers_with_filters: {
        Args: {
          filter_code?: string;
          filter_certification_name?: string;
          filter_email?: string;
          filter_available?: boolean;
          filter_purchase_date?: string;
          filter_expiration_date?: string;
          filter_partner_id?: number;
          order_by?: string;
          order_dir?: string;
          page?: number;
        };
        Returns: JSON;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
