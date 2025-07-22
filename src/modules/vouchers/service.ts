import VoucherTable from "./table";
import { FilterParamsVoucher, CreateParamsVoucher } from "./types";
import { addMonths } from "date-fns";

export default class VoucherService {
  static async getVouchersWithFilters(params: FilterParamsVoucher) {
    const voucherTable = new VoucherTable();
    // Usa el método correcto
    return await voucherTable.getVouchersForTable(params);
  }

  static async createVoucher(data: CreateParamsVoucher) {
    const {
      partner_id,
      certification_id = null,
      status_id,
      email,
      expiration_dates,
      used = false,
    } = data;

    const expiration_date =
      expiration_dates ??
      addMonths(
        new Date(),
        parseInt(process.env.VOUCHER_EXPIRATION_MONTHS || "24")
      ).toISOString();

    const voucherData = {
      partner_id: Number(partner_id),
      certification_id: certification_id ? Number(certification_id) : null,
      status_id: status_id ? Number(status_id) : null,
      email: email,
      expiration_date,
      used: used,
    };

    const voucherTable = new VoucherTable();
    return await voucherTable.createVoucher(voucherData);
  }
}
