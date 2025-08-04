// ==== Filtros usados en la tabla y para la función SQL (estándar) ====
export type FilterParamsVoucher = {
  filter_code?: string;
  filter_certification_name?: string;
  filter_email?: string;
  filter_available?: boolean; // <--- CORRECTO
  filter_purchase_date?: string;
  filter_expiration_date?: string;
  filter_partner_id?: string;
  order_by?: string;
  order_dir?: "asc" | "desc";
  page?: number;
  limit_value?: number;
  filter_token?: string; // Solo si lo usas de verdad
};

// ==== Para crear vouchers ====
export type CreateParamsVoucher = {
  partner_id: string;
  certification_id?: string | null;
  status_id?: string;
  email: string;
  used?: boolean;
  expiration_dates?: string;
};

// ==== Respuesta estándar de tabla ====
export type ResponseVoucherTable = {
  data: DataVoucherTable[];
  totalCount: number;
};

export interface DataVoucherTable {
  id?: number;
  code: string;
  certification_name: string;
  status_name: string;
  email: string;
  purchase_date: string;
  expiration_date: string;
  used: boolean;
}

export type VoucherType = {
  partner_id: number;
  certification_id: number | null;
  status_id?: number | null;
  email: string;
  expiration_date: string;
  used: boolean;
};
