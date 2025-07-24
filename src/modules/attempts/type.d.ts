export type attemptsType = {
  exam_id: number;
  student_id: number;
  score: number | null;
  passed: boolean | null;
  correct_count: number | null;
  unanswered_count: number | null;
  voucher_id: number;
};
