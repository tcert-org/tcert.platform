export type diplomaType = {
  student_id: number;
  completion_date: string;
  certificate_id: number;
  diploma_url: string;
  expiration_date: string;
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
