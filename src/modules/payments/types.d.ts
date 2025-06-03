export type PaymentsInsertType = {
  partner_id: string;
  admin_id: string;
  voucher_quantity: number;
  unit_price: number;
  total_price: number;
  files: string;
};