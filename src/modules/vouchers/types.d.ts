// params from the fetch function
export type FilterParamsVoucher = {
  filter_code?: string;
  filter_certification_name?: string;
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
//params to create vouchers
export type createParamsVoucher = {
  partner_id: string;
  certification_id?: string | null;
  status_id?: string;
  email: string;
  used?: boolean;
  expiration_dates?: string;
};
// params for the RPC vouchers_with_filters function
export type RpcParamsVoucher = {
  filter_code?: string | null;
  filter_certification_name?: string | null;
  filter_email?: string | null;
  filter_available?: boolean | null;
  filter_purchase_date?: string | null;
  filter_expiration_date?: string | null;
  filter_partner_id?: number | null;
  filter_status_id?: number | null;
  order_by?: string;
  order_dir?: "asc" | "desc";
  page?: number;
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
  email: string;
  purchase_date: string;
  expiration_date: string;
}
