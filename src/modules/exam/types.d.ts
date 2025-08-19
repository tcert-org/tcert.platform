export type examType = {
  certification_id: number;
  simulator: boolean;
  time_limit: number | null;
  attempts?: number;
  name_exam: string;
  active: boolean;
};
export type FilterParamsExam = {
  filter_name_exam?: string;
  filter_certification_id?: number;
  filter_certification_name?: string; // 👈 NUEVO
  filter_simulator?: boolean;
  filter_active?: boolean;
  filter_created_at?: string;
  filter_created_at_op?: string;
  order_by?: string;
  order_dir?: string;
  page?: number;
  limit_value?: number;
};
