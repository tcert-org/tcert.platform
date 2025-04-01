import { z } from "zod";

export const answers_InsertSchema = z.object({
  exam_attempt_id: z.number().int().positive().nullable(),
  question_id: z.number().int().positive().nullable(),
  selected_option_id: z.number().int().positive().nullable(),
});

export const answers_UpdateSchema = z.object({
  exam_attempt_id: z.number().int().positive().nullable().optional(),
  question_id: z.number().int().positive().nullable().optional(),
  selected_option_id: z.number().int().positive().nullable().optional(),
});

export const certifications_InsertSchema = z.object({
  description: z.string().min(1).nullable(),
  duration: z.number().nullable(),
  expiration_period_months: z.number().nullable(),
  name: z.string().min(1),
  price: z.number(),
  study_material_url: z.string().min(1).nullable(),
});

export const certifications_UpdateSchema = z.object({
  description: z.string().min(1).nullable().optional(),
  duration: z.number().nullable().optional(),
  expiration_period_months: z.number().nullable().optional(),
  name: z.string().min(1).optional(),
  price: z.number().optional(),
  study_material_url: z.string().min(1).nullable().optional(),
});

export const diplomas_InsertSchema = z.object({
  certification_id: z.number().int().positive().nullable(),
  completion_date: z
    .string()
    .datetime()
    .transform((str) => new Date(str)),
  diploma_url: z.string().min(1).nullable(),
  exam_attempt_id: z.number().int().positive().nullable(),
  expiration_date: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .nullable(),
  student_id: z.number().int().positive().nullable(),
});

export const diplomas_UpdateSchema = z.object({
  certification_id: z.number().int().positive().nullable().optional(),
  completion_date: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .optional(),
  diploma_url: z.string().min(1).nullable().optional(),
  exam_attempt_id: z.number().int().positive().nullable().optional(),
  expiration_date: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .nullable()
    .optional(),
  student_id: z.number().int().positive().nullable().optional(),
});

export const exam_attempts_InsertSchema = z.object({
  attempt_date: z
    .string()
    .datetime()
    .transform((str) => new Date(str)),
  exam_id: z.number().int().positive().nullable(),
  passed: z.boolean().nullable(),
  score: z.number().nullable(),
  student_id: z.number().int().positive().nullable(),
  voucher_id: z.number().int().positive().nullable(),
});

export const exam_attempts_UpdateSchema = z.object({
  attempt_date: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .optional(),
  exam_id: z.number().int().positive().nullable().optional(),
  passed: z.boolean().nullable().optional(),
  score: z.number().nullable().optional(),
  student_id: z.number().int().positive().nullable().optional(),
  voucher_id: z.number().int().positive().nullable().optional(),
});

export const exams_InsertSchema = z.object({
  attempts: z.number(),
  certification_id: z.number().int().positive().nullable(),
  max_attempts: z.number(),
  simulator: z.boolean(),
  time_limit: z.number().nullable(),
});

export const exams_UpdateSchema = z.object({
  attempts: z.number().optional(),
  certification_id: z.number().int().positive().nullable().optional(),
  max_attempts: z.number().optional(),
  simulator: z.boolean().optional(),
  time_limit: z.number().nullable().optional(),
});

export const feedback_InsertSchema = z.object({
  correct_count: z.number(),
  exam_attempt_id: z.number().int().positive().nullable(),
  incorrect_count: z.number(),
  unanswered_count: z.number(),
});

export const feedback_UpdateSchema = z.object({
  correct_count: z.number().optional(),
  exam_attempt_id: z.number().int().positive().nullable().optional(),
  incorrect_count: z.number().optional(),
  unanswered_count: z.number().optional(),
});

export const options_InsertSchema = z.object({
  content: z.string().min(1),
  is_correct: z.boolean(),
  question_id: z.number().int().positive().nullable(),
});

export const options_UpdateSchema = z.object({
  content: z.string().min(1).optional(),
  is_correct: z.boolean().optional(),
  question_id: z.number().int().positive().nullable().optional(),
});

export const questions_InsertSchema = z.object({
  content: z.string().min(1),
  exam_id: z.number().int().positive().nullable(),
});

export const questions_UpdateSchema = z.object({
  content: z.string().min(1).optional(),
  exam_id: z.number().int().positive().nullable().optional(),
});

export const roles_InsertSchema = z.object({
  name: z.string().min(2),
});

export const roles_UpdateSchema = z.object({
  name: z.string().min(1).optional(),
});

export const students_InsertSchema = z.object({
  document_number: z.string().min(1).nullable(),
  document_type: z.string().min(1).nullable(),
  email: z.string().email().nullable(),
  fullname: z.string().min(1).nullable(),
  voucher_id: z.number().int().positive().nullable(),
});

export const students_UpdateSchema = z.object({
  document_number: z.string().min(1).nullable().optional(),
  document_type: z.string().min(1).nullable().optional(),
  email: z.string().email().nullable().optional(),
  fullname: z.string().min(1).nullable().optional(),
  voucher_id: z.number().int().positive().nullable().optional(),
});

export const users_InsertSchema = z.object({
  company_address: z.string().min(1).nullable(),
  company_name: z.string().min(1).nullable(),
  contact_number: z.string().min(1).nullable(),
  email: z.string().email(),
  role_id: z.number().int().positive(),
  user_uuid: z.string().uuid(),
});

export const users_UpdateSchema = z.object({
  company_address: z.string().min(1).nullable().optional(),
  company_name: z.string().min(1).nullable().optional(),
  contact_number: z.string().min(1).nullable().optional(),
  email: z.string().email().optional(),
  role_id: z.number().int().positive().optional(),
  user_uuid: z.string().uuid().optional(),
});

export const voucher_statuses_InsertSchema = z.object({
  name: z.string().min(1),
});

export const voucher_statuses_UpdateSchema = z.object({
  name: z.string().min(1).optional(),
});

export const vouchers_InsertSchema = z.object({
  certification_id: z.number().int().positive().nullable(),
  code: z.string().min(1),
  email: z.string().email().nullable(),
  expiration_date: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .nullable(),
  partner_id: z.number().int().positive().nullable(),
  purchase_date: z
    .string()
    .datetime()
    .transform((str) => new Date(str)),
  status_id: z.number().int().positive().nullable(),
  student_id: z.number().int().positive().nullable(),
  available: z.boolean().nullable(),
});

export const vouchers_UpdateSchema = z.object({
  certification_id: z.number().int().positive().nullable().optional(),
  code: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  expiration_date: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .nullable()
    .optional(),
  partner_id: z.number().int().positive().nullable().optional(),
  purchase_date: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .optional(),
  status_id: z.number().int().positive().nullable().optional(),
  student_id: z.number().int().positive().nullable().optional(),
  available: z.boolean().nullable().optional(),
});

export const sessions_InsertSchema = z.object({
  voucher_code: z.string().min(1).nullable(),
  voucher_id: z.number().int().positive().nullable(),
});

export const sessions_UpdateSchema = z.object({
  voucher_code: z.string().min(1).nullable().optional(),
  voucher_id: z.number().int().positive().nullable().optional(),
});
