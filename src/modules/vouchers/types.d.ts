// params from the fetch function
export type FilterParamsVoucher = {
  filter_code?: string;
  filter_certification_name?: string;
  filter_student_fullname?: string;
  filter_student_document_number?: string;
  filter_email?: string;
  filter_available?: boolean;
  filter_purchase_date?: string;
  filter_expiration_date?: string;
  filter_partner_id?: string;
  order_by?: string;
  order_dir?: "asc" | "desc";
  page?: number;
  limit?: number;
};
// params for the RPC vouchers_with_filters function
export type RpcParamsVoucher = {
  filter_code: string | null;
  filter_certification_name: string | null;
  filter_student_fullname: string | null;
  filter_student_document_number: string | null;
  filter_email: string | null;
  filter_available: boolean | null;
  filter_purchase_date: string | null;
  filter_expiration_date: string | null;
  filter_partner_id: string | null;
  order_by: string;
  order_dir: "asc" | "desc";
  page: number;
};

// response from the RPC vouchers_with_filters function
// response of the table fetch function
export type ResponseVoucherTable = {
  data: DataVoucherTable[];
  totalCount: number;
};

export interface DataVoucherTable {
  id?: number;
  code: string;
  certification_name: string;
  student_fullname: string;
  student_document_number: string;
  email?: string;
  available: boolean;
  purchase_date: string;
  expiration_date: string;
}
