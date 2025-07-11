export type examType = {
  certification_id: number;
  simulator: boolean;
  time_limit: number | null;
  attempts?: number;
  name_exam: string;
  active: boolean;
};
