export type diplomaType = {
  exam_attempt_id?: number | null;
  student_id: number;
  completion_date: string;
  certification_id: number;
  diploma_url?: string | null;
  expiration_date?: string | null;
};

export type certificationsType = {
  id: number;
  name: string;
  study_material_url: string;
  price: number;
  desciption: string;
  duration: number;
  expiration_period_months: number;
};
